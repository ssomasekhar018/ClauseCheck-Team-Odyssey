# 🏛️ ClauseCheck — AI-Powered Legal Intelligence Platform

> **A unified legal technology suite combining AI-driven contract analysis, immersive courtroom simulation, and an intelligent Indian case file library — built by Team Odyssey.**

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-3776ab.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-3c873a.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React 18](https://img.shields.io/badge/React-18+-61dafb.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3+-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🎬 Demo

▶️ [Watch the full demo](https://youtu.be/MPJRqgAQphw)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Platform Architecture](#-platform-architecture)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
  - [🏠 Landing Page](#-landing-page-landing)
  - [⚖️ Courtroom Simulation](#️-courtroom-simulation-law_dev)
  - [📚 Case File Library](#-case-file-library-case_library)
  - [🧠 AI Contract Analysis](#-ai-contract-analysis-ai_contract_analysis_system)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Port Configuration](#-port-configuration)
- [Environment Variables](#-environment-variables)
- [Technologies Used](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**ClauseCheck** is a modular, microservices-based legal AI platform with 4 loosely coupled apps connected by a **unified dark-glass navigation bar**. Each module independently handles a different legal workflow:

| Module | Purpose | Stack |
|---|---|---|
| 🏠 **Landing** | Central hub & navigation | HTML, CSS, Vanilla JS |
| ⚖️ **Courtroom** | AI vs. Human oral argument simulator | React/TS + FastAPI + WebSockets |
| 📚 **Case Library** | Indian legal case search + AI summaries | React/JS + Node/Express + Indian Kanoon API |
| 🧠 **AI Analysis** | Contract clause & risk detector | React/TS + FastAPI + Gemini/GPT-4 |

---

## 🏗️ Platform Architecture

```
╔═══════════════════════════════════════════════════════════════╗
║              ClauseCheck — Unified Navigation Bar             ║
╚═════════════╦═══════════════╦═══════════════╦════════════════╝
              ║               ║               ║
              ▼               ▼               ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │  ⚖️ Courtroom │  │ 📚 Case Files│  │ 🧠 AI Contract│
   │  Simulation  │  │   Library    │  │   Analysis   │
   │              │  │              │  │              │
   │  React/TS    │  │  React/JS    │  │  React/TS    │
   │  FastAPI     │  │  Express.js  │  │  FastAPI     │
   │  Gemini+GPT4 │  │  Indian      │  │  Gemini/NLP  │
   │  WebSockets  │  │  Kanoon API  │  │  Risk Engine │
   └──────────────┘  └──────────────┘  └──────────────┘
      :5174 / :8101     :3000 / :5000     :5175 / :8100
```

---

## 📁 Project Structure

```
ClauseCheck-Team-Odyssey/
│
├── 🏠 landing/                          # Home page (static)
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── ⚖️ law_dev/                          # Courtroom Simulation
│   ├── frontend/                        # React + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── components/             # CaseForm, SimulationRoom, Results...
│   │   │   ├── context/ThemeContext.tsx
│   │   │   ├── services/api.ts
│   │   │   ├── App.tsx                 # Main app with shared navbar
│   │   │   ├── navbar.css              # 🔗 Shared navbar styles
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   └── backend/                        # FastAPI + WebSockets
│       ├── app/
│       │   ├── main.py
│       │   ├── agents/                 # AI counsel, mentor, analyzer
│       │   └── models/
│       └── requirements.txt
│
├── 📚 case_library/                     # Case File Library
│   ├── client/                          # React + JavaScript + Vite
│   │   ├── src/
│   │   │   ├── components/             # SearchPage, ResultsPage, DocumentViewer
│   │   │   ├── navbar.css              # 🔗 Shared navbar styles
│   │   │   ├── App.jsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   └── package.json
│   └── server/                         # Node.js + Express
│       ├── index.js
│       ├── routes/
│       └── package.json
│
├── 🧠 ai_contract_analysis_system/      # AI Contract Analyzer
│   ├── frontend/                        # React + TypeScript + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── components/             # Navbar, GlassCard, RiskGauge, Issue
│   │   │   ├── navbar.css              # 🔗 Shared navbar styles
│   │   │   ├── App.tsx
│   │   │   └── style.css
│   │   ├── index.html
│   │   └── package.json
│   ├── backend_main.py                  # FastAPI entry point
│   ├── analyzer.py
│   └── requirements.txt
│
├── 📄 start-all-projects.bat            # One-click launcher (Windows)
├── 📄 stop-all-servers.bat             # One-click stopper (Windows)
└── 📄 README.md
```

---

## 🧩 Modules

### 🏠 Landing Page (`landing/`)

The central hub that connects all modules under one unified dark-glass navbar.

- **Design:** Space Grotesk + Inter fonts, `#030712` dark navy background, animated gradient orbs
- **Navigation:** Links to all 3 sub-applications
- **Port:** `http://localhost:8080`

---

### ⚖️ Courtroom Simulation (`law_dev/`)

Practice courtroom oral arguments against an AI opposing counsel in real-time.

**Key Features:**
- 🤖 **AI Opposing Counsel** — Powered by Google Gemini (OpenRouter fallback)
- 🧑‍⚖️ **Mentor Assistant** — GPT-4 provides real-time coaching
- 📊 **Performance Analysis** — Win probability score and argument feedback
- 📄 **PDF Case Upload** — AI extracts facts, parties, and legal issues automatically
- ⚡ **WebSocket Communication** — Real-time bidirectional argument exchange

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| Backend | Python 3.9+, FastAPI, WebSockets, SQLite |
| AI | Google Gemini, OpenAI GPT-4 (via OpenRouter) |

**Ports:** Frontend `:5174` · Backend `:8101`

---

### 📚 Case File Library (`case_library/`)

Search 10,000+ Indian court judgments and get AI-powered structured summaries.

**Key Features:**
- 🔍 **Indian Case Search** — Indian Kanoon API integration
- 📤 **PDF Upload & Management** — Upload and store your own case files
- 🤖 **AI Summarization** — Structured summaries with parties, facts, verdict
- 📖 **Document Viewer** — Full-text reading with download
- 🏛️ **Multi-court Support** — Supreme Court, High Courts, Criminal, Civil

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | React 18, JavaScript, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js 16+, Express, Multer, cors |
| AI/APIs | Indian Kanoon API, OpenRouter API |
| Processing | pdfplumber, spaCy |

**Ports:** Frontend `:3000` · Backend `:5000`

---

### 🧠 AI Contract Analysis (`ai_contract_analysis_system/`)

Analyze contracts to detect clauses, flag risks, and generate plain-English summaries.

**Key Features:**
- 📋 **Clause Detection** — Automatically identifies 15+ clause types
- 🚨 **Risk Flagging** — Low/Medium/High/Critical severity classification
- 📝 **AI Summaries** — Plain-English contract overview powered by Gemini
- 📊 **Risk Analytics** — Distribution charts and health score
- 📄 **PDF & Text Input** — Upload files or paste contract text directly

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| Backend | Python 3.9+, FastAPI, pdfplumber, spaCy |
| AI | Google Gemini API, NLP heuristics |

**Ports:** Frontend `:5175` · Backend `:8100`

---

## 🔧 Prerequisites

| Tool | Version | Download |
|---|---|---|
| Python | 3.9+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 16+ | [nodejs.org](https://nodejs.org/) |
| Git | any | [git-scm.com](https://git-scm.com/) |

---

## 📥 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ssomasekhar018/ClauseCheck-Team-Odyssey.git
cd ClauseCheck-Team-Odyssey
```

### 2. Install Frontend Dependencies

```bash
# Courtroom Simulation
cd law_dev/frontend && npm install && cd ../..

# Case File Library
cd case_library/client && npm install && cd ../..
cd case_library/server && npm install && cd ../..

# AI Contract Analysis
cd ai_contract_analysis_system/frontend && npm install && cd ../..
```

### 3. Install Python Dependencies

```bash
# Courtroom Backend
cd law_dev/backend
pip install -r requirements.txt
cd ../..

# AI Contract Analysis Backend
pip install -r ai_contract_analysis_system/requirements.txt
```

---

## 🚀 Running Locally

### Option A — One-Click Launch (Windows)

```bash
.\start-all-projects.bat
```

### Option B — Manual (per service)

```bash
# Landing Page (port 8080)
cd landing && python -m http.server 8080

# Courtroom Backend (port 8101)
cd law_dev/backend && uvicorn app.main:app --host 127.0.0.1 --port 8101

# Courtroom Frontend (port 5174)
cd law_dev/frontend && npm run dev

# Case Library Backend (port 5000)
cd case_library/server && node index.js

# Case Library Frontend (port 3000)
cd case_library/client && npm run dev

# AI Contract Backend (port 8100)
cd ai_contract_analysis_system && uvicorn backend_main:app --host 127.0.0.1 --port 8100

# AI Contract Frontend (port 5175)
cd ai_contract_analysis_system/frontend && npm run dev
```

---

## 🌐 Port Configuration

| Service | URL | Description |
|---|---|---|
| 🏠 **Landing Page** | http://localhost:8080 | Home & navigation hub |
| ⚖️ **Courtroom Frontend** | http://localhost:5174 | Courtroom simulation UI |
| ⚖️ **Courtroom Backend** | http://localhost:8101 | FastAPI + WebSocket server |
| 📚 **Case Files Frontend** | http://localhost:3000 | Case search & library UI |
| 📚 **Case Files Backend** | http://localhost:5000 | Node/Express API server |
| 🧠 **AI Analysis Frontend** | http://localhost:5175 | Contract analysis UI |
| 🧠 **AI Analysis Backend** | http://localhost:8100 | FastAPI contract analyzer |

---

## 🔐 Environment Variables

Create `.env` files in each backend directory:

### `law_dev/backend/.env`
```env
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key
```

### `case_library/server/.env`
```env
INDIAN_KANOON_API_KEY=your_kanoon_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### `ai_contract_analysis_system/.env`
```env
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🛠️ Technologies Used

### Frontend
- **React 18** + **TypeScript** / **JavaScript**
- **Vite** — Ultra-fast dev server & bundler
- **TailwindCSS** — Utility-first CSS framework
- **Framer Motion** — Smooth animations
- **Lucide React** — Icon library
- **Boxicons** — Additional icon set (navbar)
- **Space Grotesk** + **Inter** — Premium typography

### Backend
- **Python FastAPI** — Async REST + WebSocket server
- **Node.js Express** — Case library API
- **pdfplumber** / **PyPDF2** — PDF text extraction
- **spaCy** — NLP processing
- **SQLite** — Lightweight session storage

### AI & APIs
- **Google Gemini** — Opposing counsel + contract summaries
- **OpenAI GPT-4** — Mentor assistant (via OpenRouter)
- **OpenRouter** — Multi-model AI gateway
- **Indian Kanoon API** — Indian case law database

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by Team Odyssey**

[⬆ Back to Top](#️-clausecheck--ai-powered-legal-intelligence-platform)

</div>
