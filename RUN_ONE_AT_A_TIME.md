# Run Projects One at a Time

Run **one folder at a time** → verify it works → stop it → then run the next.  
Do **not** run multiple projects simultaneously (port conflicts, confusion).

---

## Workflow

1. **Project 1** — Start → Use & verify → Stop (Ctrl+C in both terminals)
2. **Project 2** — Start → Use & verify → Stop
3. **Project 3** — Start → Use & verify → Stop
4. **Plan integration** — Decide how to connect them
5. **Connect** — Implement the integration

---

## 1️⃣ Law Simulation (`law de`)

**Ports:** Backend `8000`, Frontend `5174`

### Start (two terminals)

**Terminal A – Backend**
```powershell
cd "c:\Desktop\vit-ap\law de\backend"
.\venv\Scripts\Activate.ps1
python -m app.main
```
Wait until you see: `Uvicorn running on http://0.0.0.0:8000`

**Terminal B – Frontend**
```powershell
cd "c:\Desktop\vit-ap\law de\frontend"
npm install
npm run dev
```
Wait until you see: `Local: http://localhost:5174/`

### Verify
- Open **http://localhost:5174** in browser
- Fill case details → Start Simulation → Chat with AI opposing counsel
- Use 💡 Help, then End Simulation → check analysis

### Stop
- `Ctrl+C` in **Terminal A** (backend)
- `Ctrl+C` in **Terminal B** (frontend)

### Env
- `law de\backend\.env`: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`

---

## 2️⃣ Case File Library (`dummy`)

**Ports:** Backend `5000`, Frontend `3000`

### Start (two terminals)

**Terminal A – Backend**
```powershell
cd "c:\Desktop\vit-ap\dummy\server"
npm install
npm start
```
Wait until you see: `India Case Search API running on http://localhost:5000`

**Terminal B – Frontend**
```powershell
cd "c:\Desktop\vit-ap\dummy\client"
npm install
npm run dev
```
Wait until you see: `Local: http://localhost:3000/`

### Verify
- Open **http://localhost:3000** in browser
- **Search:** e.g. "fundamental rights" → check results
- **Upload:** Upload a case PDF → check summary (needs OpenRouter)
- **Document viewer:** Open a search result → View / Summarize

### Stop
- `Ctrl+C` in **Terminal A** (backend)
- `Ctrl+C` in **Terminal B** (frontend)

### Env
- `dummy\server\.env`: `INDIAN_KANOON_API_TOKEN`, `OPENROUTER_API_KEY` (for summarization), `PORT=5000`

### Note
- Frontend proxies `/api` to `http://localhost:5000`. Keep backend on **5000**.
- `/api/summarize` and upload summarization use the **dummy server** (Node) + **lib** (Python/OpenRouter). Ensure backend is running when you test those.

---

## 3️⃣ AI Contract Analysis (`ai-contract-analysis-system`)

**Port:** Streamlit `8500`

### Start (one terminal)

```powershell
cd "c:\Desktop\vit-ap\ai-contract-analysis-system"
# Use a working Python venv (see below if venv is broken)
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run streamlit_app.py --server.port 8500
```
Wait until you see: `You can now view your Streamlit app in your browser` → `http://localhost:8500`

### Verify
- Open **http://localhost:8500** in browser
- Upload a contract PDF **or** paste text → **Analyze Contract**
- Check tabs: Extracted Text, Key Clauses, Risk Highlights, Summary

### Stop
- `Ctrl+C` in the terminal

### Env
- Optional: `.env` if you use LLM features. The Streamlit app works with heuristics without it.

### If `ai-contract-analysis-system` venv is broken
- The venv may point to another user’s Python. Create a new one:
  ```powershell
  cd "c:\Desktop\vit-ap\ai-contract-analysis-system"
  py -3 -m venv venv_new
  .\venv_new\Scripts\Activate.ps1
  pip install -r requirements.txt
  streamlit run streamlit_app.py --server.port 8500
  ```
  Use `venv_new` instead of `venv` from then on.

---

## Port Summary (one at a time)

| Project        | Backend   | Frontend |
|----------------|-----------|----------|
| Law Simulation | 8000      | 5173     |
| Case File Library | 5000   | 3000     |
| AI Contract    | —         | 8500 (Streamlit) |

When you run **one project at a time**, these ports don’t conflict.

---

## Next: Plan & Connect

After all three run successfully **one at a time**:

1. **Plan** — How should they connect? (e.g. shared nav, case files → simulation, contract analysis from case library, etc.)
2. **Connect** — Single app or separate apps with APIs; shared auth if needed.

Use this file as the runbook for sequential run → verify → stop.
