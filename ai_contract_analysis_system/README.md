# AI-Assisted Contract Analysis System

Prototype decision-support tool to help legal professionals explore and understand contract text more efficiently.

**Important:** This system is for assistance only and does **not** provide legal advice or replace professional judgment.

## Features
- Upload PDF or plain-text contracts.
- Extract and normalize contract text.
- Heuristically identify common clause types (payment, termination, confidentiality, liability, penalty, governing law).
- Flag potentially risky or unusual language with simple risk levels (Low / Medium / High) and short explanations.
- Generate a concise, simple-English summary focused on parties, key terms, and major risks.
- Streamlit UI with sections for extracted text, key clauses, risk highlights, and summary.

## Tech Stack
- Python 3
- Streamlit
- pdfplumber (PDF text extraction)
- spaCy (optional, for NLP and entity recognition)

## Running the App

1. Create and activate a virtual environment (recommended).
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Streamlit app:
   ```bash
   streamlit run streamlit_app.py
   ```

Then open the URL shown in your terminal (typically `http://localhost:8500`).

## Ethics & Safety
- The system highlights patterns using heuristic rules and may miss important issues.
- Risk levels are **not** authoritative. They are simple indicators to support human review.
- Always read the full contract and consult qualified legal counsel before making decisions.

## Limitations
- Clause and risk detection is heuristic and may produce false positives/negatives.
- The prototype is not tuned for specific jurisdictions or industries.
- Very long or highly complex contracts may not be analyzed perfectly.
