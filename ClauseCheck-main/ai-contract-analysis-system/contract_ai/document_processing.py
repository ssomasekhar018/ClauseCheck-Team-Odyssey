from __future__ import annotations

from io import BytesIO
from typing import BinaryIO

try:
    import pdfplumber  # type: ignore
except Exception:  # pragma: no cover - optional dependency at runtime
    pdfplumber = None

from .models import DocumentText


def extract_text_from_pdf(file_obj: BinaryIO) -> str:
    """Extract text from a PDF file-like object using pdfplumber.

    Falls back to returning an empty string if pdfplumber is unavailable
    or extraction fails.
    """

    if pdfplumber is None:
        return ""

    text_chunks: list[str] = []
    try:
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text_chunks.append(page_text)
    except Exception:
        return ""

    return "\n\n".join(text_chunks)


def normalize_text(text: str) -> str:
    """Basic normalization: collapse excessive whitespace and strip.

    This keeps paragraph and sentence boundaries roughly intact while
    producing cleaner output for downstream modules and the UI.
    """

    # Normalize Windows/Mac newlines
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse 3+ newlines into 2 to avoid extreme gaps
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")
    # Strip trailing whitespace on each line
    lines = [line.strip() for line in text.split("\n")]
    return "\n".join(lines).strip()


def load_document(uploaded_file) -> DocumentText:
    """Load an uploaded file (Streamlit UploadFile-like object) into DocumentText.

    Supports PDF (by extension) and plain text. For PDFs, attempts text
    extraction and normalization. For text, decodes as UTF-8.
    """

    filename = getattr(uploaded_file, "name", "uploaded")
    name_lower = filename.lower()

    if name_lower.endswith(".pdf"):
        raw_bytes = uploaded_file.read()
        buffer = BytesIO(raw_bytes)
        content = extract_text_from_pdf(buffer)
        normalized = normalize_text(content)
        return DocumentText(
            source_name=filename,
            content=normalized,
            num_pages=None,
            source_type="pdf",
        )

    # Fallback: treat as text
    raw_bytes = uploaded_file.read()
    try:
        text = raw_bytes.decode("utf-8", errors="ignore")
    except Exception:
        text = ""
    normalized = normalize_text(text)
    return DocumentText(
        source_name=filename,
        content=normalized,
        num_pages=None,
        source_type="text",
    )