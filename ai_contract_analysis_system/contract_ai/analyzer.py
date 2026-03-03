from __future__ import annotations

from dataclasses import asdict
from typing import Any, Dict

from .clause_identification import identify_clauses
from .document_processing import DocumentText, load_document
from .models import AnalysisResult
from .risk_detection import assess_risks
from .summarization import summarize_contract


DISCLAIMER_TEXT = (
    "This system is for assistance only and does not replace professional legal advice. "
    "It highlights patterns in the text using heuristic rules and may miss important issues."
)


def analyze_contract(uploaded_file) -> AnalysisResult:
    """Run the full analysis pipeline given an uploaded file-like object."""

    document = load_document(uploaded_file)
    clauses = identify_clauses(document.content)
    risks = assess_risks(clauses)
    summary = summarize_contract(document.content, clauses, risks)
    return AnalysisResult(
        document=document,
        clauses=clauses,
        risks=risks,
        summary=summary,
        disclaimer=DISCLAIMER_TEXT,
    )


def analysis_result_to_dict(result: AnalysisResult) -> Dict[str, Any]:
    """Convert AnalysisResult into basic Python types for UI or JSON output."""

    return asdict(result)
