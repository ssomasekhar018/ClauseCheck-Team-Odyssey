# Legal Tech Portfolio — Three Projects Overview

**README for PPT / Presentation**  
Combined overview of: **Law Simulation (Courtroom)** | **Case File Library** | **AI Contract Analysis System**

---

## ▶️ Running the projects

**Run one folder at a time:** use **[RUN_ONE_AT_A_TIME.md](./RUN_ONE_AT_A_TIME.md)** for step-by-step instructions.  
Start → verify → stop one project, then run the next. Don’t run multiple projects at once.

---

## 📌 Quick Summary (Slide 1 – Title / Overview)

| Project | Folder | One-Liner |
|--------|--------|-----------|
| **Law Simulation (Courtroom)** | `law de` | AI-powered courtroom practice: argue vs AI opposing counsel, get mentor help & performance analysis |
| **Case File Library** | `dummy` | Search Indian cases, upload PDFs, view & AI-summarize case files (Indian Kanoon + OpenRouter) |
| **AI Contract Analysis System** | `ai-contract-analysis-system` | Upload contracts → extract clauses, detect risks, generate plain-English summaries |

**Common theme:** Legal domain + AI-assisted workflows (practice, research, contract review).

---

## 1️⃣ Law Simulation — Courtroom Training Platform

**Folder:** `law de`

### What It Does
- Lawyers **practice courtroom arguments** in a simulated environment.
- **AI opposing counsel** (Gemini) argues against you in real time via chat.
- **Mentor assistant** (GPT-4): “Help me understand,” custom legal questions.
- **Performance analysis**: win probability, case weaknesses, improvement areas.

### Main Features
- **Case input**: Case type, facts, charges, evidence.
- **Real-time debate**: WebSocket chat with AI opposing counsel.
- **Mentor (💡)**: Explain opponent’s arguments, ask legal questions.
- **Post-simulation**: Win probability, weaknesses, recommendations.
- **Document upload**: Optional case document support.

### Tech Stack
| Layer | Tech |
|-------|------|
| **Backend** | Python 3.9+, FastAPI, SQLite, WebSockets |
| **AI** | Google Gemini (opposing counsel), OpenAI GPT-4 (mentor & analyzer) |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |

### Key APIs
- `POST /api/case/create` — Create case & session  
- `WS /ws/simulation/{session_id}` — Real-time debate  
- `POST /api/help` — Mentor assistance  
- `POST /api/analyze/{session_id}` — Final analysis  

### Run It
```bash
# Backend
cd "law de/backend"
pip install -r requirements.txt
# Add OPENAI_API_KEY, GEMINI_API_KEY in .env
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd "law de/frontend"
npm install && npm run dev   # → http://localhost:5174
```

---

## 2️⃣ Case File Library (India Case Search + Document Management)

**Folder:** `dummy`

### What It Does
- **Search** Indian court judgments (all jurisdictions) via **Indian Kanoon API**.
- **Upload** your own case PDFs.
- **View** full case content and **AI-summarize** (OpenRouter) with structured output: parties, facts, evidence, arguments, verdict, etc.
- **Download** judgment PDFs when available.

### Main Features
- **Search**: Any Indian case (criminal, civil, land, cyber, etc.).
- **Results**: Case title, court, date, citation, judge, link to Indian Kanoon.
- **Document viewer**: Full text + “Summarize” button for AI summary.
- **Upload**: PDF case files → upload → AI summary.
- **Responsive UI**: Material UI, clean layout, mobile-friendly.

### Tech Stack
| Layer | Tech |
|-------|------|
| **Frontend** | React 18, Vite, Material UI, Axios |
| **Backend** | Node.js, Express, Multer (uploads) |
| **APIs** | Indian Kanoon API, OpenRouter (AI summarization) |
| **Lib** | Python: `pdf_extractor`, `llm_legal_summarizer`, OpenRouter client |

### Run It
```bash
# Backend
cd dummy/server
npm install
# Add INDIAN_KANOON_API_TOKEN, OPENROUTER_API_KEY in .env
npm start   # → http://localhost:5001

# Frontend (new terminal)
cd dummy/client
npm install && npm run dev   # → http://localhost:3000
```

---

## 3️⃣ AI Contract Analysis System

**Folder:** `ai-contract-analysis-system`

### What It Does
- **Decision-support** tool for legal professionals (not legal advice).
- Upload **PDF or plain-text** contracts → extract & normalize text.
- **Identify** common clause types: payment, termination, confidentiality, liability, penalty, governing law.
- **Flag risks** with levels (Low / Medium / High) and short explanations.
- **Summarize** in plain English: parties, key terms, major risks.

### Main Features
- **Upload**: PDF or text contracts.
- **Clause detection**: Heuristic identification of common clause types.
- **Risk highlighting**: Simple risk levels + explanations.
- **Summary**: Parties, key terms, risks.
- **UI**: Streamlit (or FastAPI + frontend); sections for text, clauses, risks, summary.

### Tech Stack
| Layer | Tech |
|-------|------|
| **Backend** | Python 3, FastAPI, pdfplumber, spaCy (optional NLP) |
| **UI** | Streamlit (`streamlit run streamlit_app.py`) |
| **Processing** | pdfplumber (extraction), heuristic rules, LLM integration |

### Limitations (for PPT)
- Heuristic rules → possible false positives/negatives.
- Not jurisdiction- or industry-specific.
- Always use with human review and qualified legal counsel.

### Run It
```bash
cd ai-contract-analysis-system
pip install -r requirements.txt
streamlit run streamlit_app.py   # → http://localhost:8500
```

---

## 📊 Side-by-Side Comparison (Good for PPT Table)

| | Law Simulation | Case File Library | AI Contract Analysis |
|--|----------------|-------------------|----------------------|
| **Purpose** | Practice courtroom arguments | Search & manage case files, AI summaries | Analyze contracts, risks, summaries |
| **Users** | Lawyers, law students | Legal researchers, practitioners | Legal professionals |
| **AI use** | Opposing counsel, mentor, analyzer | Document summarization | Clause ID, risk detection, summarization |
| **Input** | Case form + optional docs | Search query + PDF uploads | Contract PDF / text |
| **Output** | Debate + win probability + weaknesses | Search results + case viewer + summaries | Clauses, risks, plain-English summary |
| **Stack** | FastAPI, React, Gemini, GPT-4 | Node/Express, React, Indian Kanoon, OpenRouter | Python, Streamlit, pdfplumber, spaCy |

---

## 🎯 Suggested PPT Structure

1. **Title slide**: Legal Tech Portfolio — 3 Projects  
2. **Overview**: Table of 3 projects + one-liners (use “Quick Summary” above).  
3. **Slide per project**:  
   - Name + folder  
   - Problem it solves  
   - Main features (3–5 bullets)  
   - Tech stack (short)  
   - Optional: 1–2 screenshots or wireframes  
4. **Comparison slide**: Use “Side-by-Side Comparison” table.  
5. **Demo / flow**:  
   - Law Sim: Fill case → Start simulation → Debate → Get analysis.  
   - Case Library: Search **or** Upload → View → Summarize.  
   - Contract: Upload contract → View clauses, risks, summary.  
6. **Closing**: Common theme (AI + legal workflows), possible future integration.

---

## 📁 Project Locations

```
vit-ap/
├── law de/                    # Courtroom simulation
│   ├── backend/               # FastAPI, AI agents, DB
│   └── frontend/              # React + TypeScript + Tailwind
├── dummy/                     # Case file library
│   ├── client/                # React + Vite + MUI
│   ├── server/                # Express, Indian Kanoon, uploads
│   └── lib/                   # PDF extraction, legal summarizer
└── ai-contract-analysis-system/
    ├── contract_ai/           # Analyzer, clauses, risk, NLP
    ├── streamlit_app.py       # Streamlit UI
    ├── backend_main.py        # Optional FastAPI backend
    └── frontend/              # Optional React frontend
```

---

## ✅ Checklist for Your PPT

- [ ] Title + overview slide with 3 project names and one-liners  
- [ ] One slide each: Law Simulation, Case File Library, AI Contract Analysis  
- [ ] Comparison table (purpose, users, AI, input/output, stack)  
- [ ] Demo flow for each (1–2 bullets)  
- [ ] Screenshots or mockups if available  
- [ ] “Future work” or “Integration possibilities” slide  

Use this README as the single source to pull bullets, tables, and structure for your presentation.
