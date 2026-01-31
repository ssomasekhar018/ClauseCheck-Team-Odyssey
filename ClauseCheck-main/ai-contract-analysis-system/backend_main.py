from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from contract_ai.analyzer import analyze_contract, analysis_result_to_dict
from contract_ai.document_processing import load_document
from contract_ai.llm_integration import (
    generate_gemini_risk_overview,
    generate_gemini_summary,
)
from contract_ai.output_formatter import format_for_display, formatted_output_to_dict


app = FastAPI(title="AI Contract Analysis API", version="1.0.0")

# Allow local frontend dev servers to talk to this API.
# In production you would tighten this up.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextAnalysisRequest(BaseModel):
    text: str
    source_name: Optional[str] = "pasted_text.txt"


class ExtractResponse(BaseModel):
    document: Dict[str, Any]  # { source_name, content }


class AnalysisResponse(BaseModel):
    document: Dict[str, Any]
    clauses: list[Dict[str, Any]]
    risks: list[Dict[str, Any]]
    heuristic_summary: str
    disclaimer: str
    llm_summary: Optional[str] = None
    llm_risk_overview: Optional[str] = None
    # NEW: Clean formatted output for UI
    formatted: Optional[Dict[str, Any]] = None


def _run_full_analysis_from_bytes(raw_bytes: bytes, filename: str) -> AnalysisResponse:
    # Reuse the existing analyzer by building a BytesIO with a name.
    buffer = BytesIO(raw_bytes)
    setattr(buffer, "name", filename)

    # analyze_contract expects a file-like object similar to Streamlit's UploadFile.
    # We provide a BytesIO with a name attribute so the existing pipeline can load
    # and normalize the document internally.
    result = analyze_contract(buffer)
    result_dict = analysis_result_to_dict(result)

    heuristic_summary = result_dict.get("summary", "")

    llm_summary = generate_gemini_summary(
        result.document,
        result.clauses,
        result.risks,
        heuristic_summary=heuristic_summary,
    )
    llm_risk_overview = generate_gemini_risk_overview(
        result.document,
        result.clauses,
        result.risks,
    )

    # Generate clean formatted output for UI
    formatted_output = format_for_display(
        result.document,
        result.clauses,
        result.risks,
        result_dict["disclaimer"],
    )

    return AnalysisResponse(
        document=result_dict["document"],
        clauses=result_dict["clauses"],
        risks=result_dict["risks"],
        heuristic_summary=heuristic_summary,
        disclaimer=result_dict["disclaimer"],
        llm_summary=llm_summary,
        llm_risk_overview=llm_risk_overview,
        formatted=formatted_output_to_dict(formatted_output),
    )


def _extract_document_from_bytes(raw_bytes: bytes, filename: str) -> ExtractResponse:
    buf = BytesIO(raw_bytes)
    setattr(buf, "name", filename)
    doc = load_document(buf)
    return ExtractResponse(document={"source_name": doc.source_name, "content": doc.content})


@app.post("/api/extract/file", response_model=ExtractResponse)
async def extract_file(file: UploadFile = File(...)) -> ExtractResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename")
    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    return _extract_document_from_bytes(raw_bytes, file.filename)


@app.post("/api/extract/text", response_model=ExtractResponse)
async def extract_text(request: TextAnalysisRequest) -> ExtractResponse:
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")
    raw_bytes = request.text.encode("utf-8")
    filename = request.source_name or "pasted_text.txt"
    return _extract_document_from_bytes(raw_bytes, filename)


@app.post("/api/analyze/file", response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)) -> AnalysisResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename")

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    return _run_full_analysis_from_bytes(raw_bytes, file.filename)


@app.post("/api/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest) -> AnalysisResponse:
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")

    raw_bytes = request.text.encode("utf-8")
    filename = request.source_name or "pasted_text.txt"

    return _run_full_analysis_from_bytes(raw_bytes, filename)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}
