# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Environment and setup

- Language: Python 3
- Recommended setup:
  - Create and activate a virtual environment.
  - Install dependencies from the root of the repository:
    - `pip install -r requirements.txt`
- Optional NLP model: if you want spaCy-powered sentence splitting and entity extraction instead of the rule-based fallbacks, install a small English model:
  - `python -m spacy download en_core_web_sm`

## Running the application

From the repository root:

- Start the Streamlit app:
  - `streamlit run streamlit_app.py`
- The app will expose a local URL in the terminal (typically `http://localhost:8500`).

## Testing and linting

- There is currently no test suite or linting configuration checked into the repo.
- No canonical "run tests" or "lint" command exists yet; if you introduce tests or linters, prefer to add a single entry point (e.g., a `make` target or script) and update this section.

## High-level architecture

This project is a small, self-contained prototype for heuristic contract analysis, centered around a Streamlit UI and a pure-Python analysis pipeline.

### Top-level flow

1. **User interface** (`streamlit_app.py`)
   - Defines the Streamlit app, file upload / text paste inputs, and four main tabs: Extracted Text, Key Clauses, Risk Highlights, and Summary.
   - On "Analyze Contract", it passes the uploaded file (or in-memory text file) to `contract_ai.analyzer.analyze_contract` and then renders the returned `AnalysisResult` object.
   - Contains the primary **disclaimer text** shown in the sidebar and below the summary. If you change system behavior or scope, update the disclaimer consistently in both the UI and the analysis layer.

2. **Analysis orchestration** (`contract_ai/analyzer.py`)
   - `analyze_contract(uploaded_file)` is the main orchestration entry point used by the UI.
   - Pipeline stages:
     - `load_document` (from `document_processing`) → produces a normalized `DocumentText`.
     - `identify_clauses` (from `clause_identification`) → turns raw text into typed `Clause` objects.
     - `assess_risks` (from `risk_detection`) → attaches heuristic `RiskAssessment` records to clauses.
     - `summarize_contract` (from `summarization`) → generates a human-readable summary string.
   - Wraps these into a single `AnalysisResult` dataclass that the UI consumes.

3. **Core data models** (`contract_ai/models.py`)
   - Central enums and dataclasses used across the pipeline:
     - `ClauseType` and `RiskLevel` enums define the canonical set of clause categories and risk levels.
     - `DocumentText`, `Clause`, `RiskAssessment`, `AnalysisResult` capture the contract, extracted structure, and analysis outputs.
   - Any change to `ClauseType` or `RiskLevel` typically requires coordinated updates in:
     - `clause_identification` (keyword mapping),
     - `risk_detection` (risk logic),
     - `summarization` (which clauses are summarized), and
     - `streamlit_app` (display logic and risk color mapping).

### Document ingestion and normalization (`contract_ai/document_processing.py`)

- Provides `load_document(uploaded_file)` which:
  - Detects PDFs by extension and uses `pdfplumber` to extract text when available.
  - Falls back to treating the file as UTF-8 text for other extensions.
  - Normalizes newlines and collapses excessive whitespace via `normalize_text` so downstream components receive cleaner text.
- `extract_text_from_pdf` is defensive:
  - If `pdfplumber` is unavailable or extraction fails, it returns an empty string rather than raising.
- All analysis starts from the `DocumentText` it returns; if you modify ingestion (e.g., add DOCX support), integrate it here so the rest of the pipeline remains unchanged.

### NLP core and fallbacks (`contract_ai/nlp_core.py`)

- Wraps optional spaCy usage behind a thin abstraction:
  - `get_nlp()` lazily loads `en_core_web_sm` if spaCy and the model are installed, otherwise returns `None` and callers use rule-based fallbacks.
- Key functions:
  - `split_into_sentences(text)` → uses spaCy sentence boundaries when available; otherwise naively splits on `.`.
  - `extract_parties(text)` →
    - Uses spaCy NER (ORG/PERSON) on the first part of the document, plus
    - Simple pattern matching around phrases like "This Agreement is between".
- When extending NLP behavior, keep these functions as the integration points so that higher-level modules remain decoupled from specific NLP libraries.

### Clause identification (`contract_ai/clause_identification.py`)

- `identify_clauses(text)` is the heuristic segmentation step:
  - Uses `split_into_sentences` to obtain candidate units.
  - Assigns each sentence a `ClauseType` via `_guess_clause_type`, driven by the `CLAUSE_KEYWORDS` mapping.
  - Produces `Clause` objects with IDs and basic character offsets in the original text.
- To add a new clause type or adjust detection sensitivity, update `ClauseType` in `models.py` and the `CLAUSE_KEYWORDS` dictionary here.

### Risk assessment (`contract_ai/risk_detection.py`)

- `assess_risks(clauses)` maps each `Clause` to a `RiskAssessment` via `assess_risk_for_clause`.
- The logic is intentionally simple and transparent:
  - Looks for patterns like "sole discretion", "without liability", broad "indemnify" language, percentage-based penalties, vague terms (e.g., "reasonable efforts"), and very long clauses.
  - Increments risk from LOW → MEDIUM → HIGH based on matches, aggregating human-readable reasons.
- This is the primary place to adjust heuristic sensitivity for risk flags; ensure that reason strings remain short, explanatory, and suitable for display in the UI.

### Summarization (`contract_ai/summarization.py`)

- `summarize_contract(text, clauses, risks)` builds a multi-paragraph, simple-English summary using only local heuristics:
  - Uses `extract_parties` to list likely parties (when possible).
  - Summarizes payment and termination clauses via dedicated helpers.
  - Highlights medium and high risk clauses with brief snippets and the first risk reason.
  - Appends an explicit note that the summary is heuristic and not legal advice.
- The summary is shown in the "Summary" tab of the UI and is not generated via an external LLM; changes here directly impact what users see as the AI summary.

### Streamlit UI behavior (`streamlit_app.py`)

- Handles both file uploads (PDF or text) and pasted text:
  - For pasted text, it constructs a `BytesIO` object and sets a synthetic filename so `load_document` treats it as text.
- Renders results from `AnalysisResult`:
  - **Extracted Text** tab: shows normalized contract text.
  - **Key Clauses** tab: iterates over the first ~300 detected clauses.
  - **Risk Highlights** tab: sorts risks by level, joins risk metadata back to clause text, and colors each block based on `RiskLevel`.
  - **Summary** tab: shows the heuristic summary and reiterates the disclaimer.
- Color mapping for risk levels lives in `_color_for_risk`; if you introduce new `RiskLevel`s or visual states, update this function in sync with the enum.

## Notes for future agents

- Maintain the strong "assistance only" positioning:
  - Any change that makes the system feel more authoritative (e.g., stronger language, automated recommendations) should be mirrored by updating disclaimer text in both `streamlit_app.py` and `contract_ai/analyzer.py`.
- Keep the pipeline composition clear:
  - New analysis steps (e.g., additional classifiers or scoring functions) should generally be wired into `analyze_contract` and reflected in `AnalysisResult`, rather than bypassing the main orchestrator.
- When extending clause types or risk logic:
  - Update enums in `models.py` first, then propagate changes to `clause_identification`, `risk_detection`, `summarization`, and UI display where relevant.
- Be careful with external dependencies:
  - The current design tolerates missing `pdfplumber` and spaCy gracefully. If you introduce new libraries or models, aim for similar optional/fallback behavior so the app still runs in minimal environments.
