# 🏛️ Legal Tech Suite - ClauseCheck

> **A comprehensive legal technology platform integrating AI-powered courtroom simulation, case file management, and contract analysis into a unified ecosystem.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)

## Demo Video
▶️ [Watch the full demo](https://youtu.be/MPJRqgAQphw)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Projects](#-projects)
  - [1. Courtroom Simulation](#1-courtroom-simulation-law-de)
  - [2. Case File Library](#2-case-file-library-dummy)
  - [3. AI Contract Analysis System](#3-ai-contract-analysis-system)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Projects](#-running-the-projects)
- [Port Configuration](#-port-configuration)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Legal Tech Suite** is an integrated platform combining three powerful legal technology applications:

1. **Courtroom Simulation** - Practice courtroom arguments against AI opposing counsel with real-time feedback
2. **Case File Library** - Search Indian legal cases and manage case documents with AI-powered summarization
3. **AI Contract Analysis** - Analyze contracts, identify clauses, detect risks, and generate summaries

All three applications are connected via a unified navigation bar, allowing seamless movement between tools.

---

## ✨ Features

### 🎭 Courtroom Simulation
- **Real-time AI Opposing Counsel** - Debate against Google Gemini-powered AI
- **Mentor Assistant** - Get help from GPT-4 mentor during arguments
- **Performance Analysis** - Receive win probability and detailed feedback
- **Structured Legal Arguments** - AI generates professional legal submissions with sections and citations
- **Document Support** - Upload case documents for context
- **WebSocket Communication** - Real-time bidirectional communication

### 📚 Case File Library
- **Indian Case Search** - Search all Indian court judgments via Indian Kanoon API
- **PDF Upload & Management** - Upload and manage your case files
- **AI Summarization** - Get structured summaries with parties, facts, evidence, arguments, and verdict
- **Document Viewer** - Full-text viewing with download capabilities
- **Multi-jurisdiction Support** - Criminal, civil, land, cyber, and more

### 📄 AI Contract Analysis
- **Clause Identification** - Automatically detect common contract clauses
- **Risk Detection** - Flag risks with severity levels (Low/Medium/High)
- **Plain-English Summaries** - Generate easy-to-understand contract summaries
- **PDF & Text Support** - Process both PDF and plain-text contracts
- **Structured Output** - Organized display of parties, key terms, and risks

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Legal Tech Suite                          │
│                  (Unified Navigation Bar)                    │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Courtroom       │  │  Case File      │  │  Contract        │
│  Simulation      │  │  Library        │  │  Analysis        │
│                  │  │                  │  │                  │
│  Frontend: 5173  │  │  Frontend: 3000  │  │  Frontend: 5175  │
│  Backend:  8101  │  │  Backend:  5000  │  │  Backend:  8100  │
│                  │  │                  │  │                  │
│  • React/TS      │  │  • React/JS      │  │  • React/TS      │
│  • FastAPI       │  │  • Express       │  │  • FastAPI       │
│  • Gemini/GPT-4  │  │  • Indian Kanoon │  │  • Gemini/LLM    │
│  • WebSockets    │  │  • OpenRouter    │  │  • NLP/Heuristics│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 📦 Projects

### 1. Courtroom Simulation (`law de`)

**Purpose:** Practice courtroom arguments in a simulated environment with AI-powered opposing counsel and mentor assistance.

**Key Components:**
- **Opposing Counsel Agent** - Google Gemini API (with OpenRouter fallback)
- **Mentor/Observer Agent** - OpenAI GPT-4 via OpenRouter
- **Analyzer Agent** - Evaluates performance and provides feedback
- **Document Extractor** - Processes uploaded case documents

**Tech Stack:**
- **Backend:** Python 3.9+, FastAPI, SQLite, WebSockets
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **AI:** Google Gemini, OpenAI GPT-4 (via OpenRouter)

**Ports:**
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8101`

---

### 2. Case File Library (`dummy`)

**Purpose:** Search Indian legal cases and manage case documents with AI-powered summarization.

**Key Components:**
- **Search Engine** - Indian Kanoon API integration
- **PDF Processor** - Extract text from case PDFs
- **Legal Summarizer** - AI-powered structured summaries using OpenRouter
- **Document Viewer** - Full-text viewing interface

**Tech Stack:**
- **Frontend:** React 18, Vite, Material UI
- **Backend:** Node.js, Express, Multer
- **Python Lib:** pdfplumber, spaCy, OpenRouter client
- **APIs:** Indian Kanoon API, OpenRouter API

**Ports:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

### 3. AI Contract Analysis System

**Purpose:** Analyze contracts, identify clauses, detect risks, and generate plain-English summaries.

**Key Components:**
- **Document Processor** - PDF and text extraction
- **Clause Identifier** - Heuristic-based clause detection
- **Risk Detector** - Risk level assessment (Low/Medium/High)
- **Summarizer** - Plain-English contract summaries
- **NLP Core** - Optional spaCy integration for advanced processing

**Tech Stack:**
- **Backend:** Python 3.9+, FastAPI, pdfplumber, spaCy
- **Frontend:** React 18, TypeScript, Vite
- **AI:** Google Gemini (optional), LLM integration

**Ports:**
- Frontend: `http://localhost:5175`
- Backend: `http://localhost:8100`

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Python Packages (install globally or in venvs):
- `pip`, `uvicorn`, `fastapi`, `python-dotenv`
- `pdfplumber`, `PyPDF2`, `spacy`
- `openai`, `google-generativeai`

### Node.js Packages:
- npm (comes with Node.js)

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/seeramyash/ClauseCheck.git
cd ClauseCheck
```

### 2. Install Dependencies

#### Courtroom Simulation (`law de`)

```bash
# Backend
cd "law de/backend"
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Frontend
cd "../frontend"
npm install
```

#### Case File Library (`dummy`)

```bash
# Backend
cd dummy/server
npm install

# Frontend
cd ../client
npm install

# Python Library (for summarization)
cd ../lib
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

#### AI Contract Analysis System

```bash
# Backend
cd ai-contract-analysis-system
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` files in the respective backend directories with the following variables:

#### Courtroom Simulation (`law de/backend/.env`)

```env
# OpenAI API (for mentor and analyzer)
OPENAI_API_KEY=your_openai_api_key_here

# OpenRouter API (fallback for Gemini)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Google Gemini API (for opposing counsel)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Use Ollama for local LLM
USE_OLLAMA=false
OLLAMA_BASE_URL=http://localhost:11434
```

#### Case File Library (`dummy/server/.env`)

```env
# Indian Kanoon API
INDIAN_KANOON_API_TOKEN=your_indian_kanoon_token_here

# OpenRouter API (for AI summarization)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

#### AI Contract Analysis System (`ai-contract-analysis-system/.env`)

```env
# Google Gemini API (optional, for advanced analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here
```

### Getting API Keys

1. **OpenAI API Key:** [platform.openai.com](https://platform.openai.com/api-keys)
2. **OpenRouter API Key:** [openrouter.ai](https://openrouter.ai/keys)
3. **Google Gemini API Key:** [makersuite.google.com](https://makersuite.google.com/app/apikey)
4. **Indian Kanoon API Token:** [indiankanoon.org](https://indiankanoon.org/api/)

---

## 🚀 Running the Projects

### Option 1: Run All Projects at Once (Recommended)

Use the provided batch script to start all servers simultaneously:

```bash
# Windows
.\start-all-projects.bat

# This will open separate PowerShell windows for each server:
# - Landing Page (http://localhost:8080)
# - Courtroom Simulation (http://localhost:5174)
# - Case File Library (http://localhost:3000)
# - AI Contract Analysis (http://localhost:5175)
```

### Option 2: Run Projects Individually

#### Courtroom Simulation

```bash
# Terminal 1: Backend
cd "law de/backend"
.\venv\Scripts\Activate.ps1  # Activate venv
python -m app.main
# Backend runs on http://localhost:8101

# Terminal 2: Frontend
cd "law de/frontend"
npm run dev
# Frontend runs on http://localhost:5174
```

#### Case File Library

```bash
# Terminal 1: Backend
cd dummy/server
npm start
# Backend runs on http://localhost:5000

# Terminal 2: Frontend
cd dummy/client
npm run dev -- --port 3000
# Frontend runs on http://localhost:3000
```

#### AI Contract Analysis System

```bash
# Terminal 1: Backend
cd ai-contract-analysis-system
python -m uvicorn backend_main:app --reload --host 127.0.0.1 --port 8100
# Backend runs on http://localhost:8100

# Terminal 2: Frontend
cd ai-contract-analysis-system/frontend
npm run dev -- --port 5175
# Frontend runs on http://localhost:5175
```

#### Landing Page

```bash
cd landing
python -m http.server 8080
# Landing page runs on http://localhost:8080
```

---

## 🔌 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Landing Page | 8080 | http://localhost:8080 |
| Courtroom Simulation (Frontend) | 5173 | http://localhost:5174 |
| Courtroom Simulation (Backend) | 8101 | http://localhost:8101 |
| Case File Library (Frontend) | 3000 | http://localhost:3000 |
| Case File Library (Backend) | 5000 | http://localhost:5000 |
| AI Contract Analysis (Frontend) | 5175 | http://localhost:5175 |
| AI Contract Analysis (Backend) | 8100 | http://localhost:8100 |

**Note:** If any port is already in use, you can:
1. Stop the conflicting process: `netstat -ano | findstr :PORT` then `taskkill /PID <PID> /F`
2. Or modify the port in the respective configuration files

---

## 📁 Project Structure

```
vit-ap/
├── landing/                          # Landing page (static HTML)
│   ├── index.html                    # Home page with project cards
│   ├── ai-contract-analysis-system.html
│   ├── courtroom-trails.html
│   └── law-cse-files-library.html
│
├── law de/                           # Courtroom Simulation
│   ├── backend/
│   │   ├── app/
│   │   │   ├── agents/              # AI agents (opposing_counsel, observer, analyzer)
│   │   │   ├── routers/             # API routes
│   │   │   ├── utils/               # Utilities (document parser)
│   │   │   ├── database.py          # SQLite database
│   │   │   ├── main.py              # FastAPI app
│   │   │   └── models.py            # Database models
│   │   ├── .env.example
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── services/           # API service
│       │   └── App.tsx
│       └── package.json
│
├── dummy/                            # Case File Library
│   ├── client/                       # React frontend
│   │   ├── src/
│   │   │   ├── components/         # SearchPage, ResultsPage, DocumentViewer, UploadPage
│   │   │   └── App.jsx
│   │   └── package.json
│   ├── server/                       # Express backend
│   │   ├── index.js
│   │   └── package.json
│   └── lib/                          # Python library for summarization
│       ├── llm_legal_summarizer.py
│       ├── pdf_extractor.py
│       └── requirements.txt
│
├── ai-contract-analysis-system/      # Contract Analysis
│   ├── contract_ai/                  # Core analysis modules
│   │   ├── analyzer.py
│   │   ├── clause_identification.py
│   │   ├── risk_detection.py
│   │   └── summarization.py
│   ├── frontend/                     # React frontend
│   │   └── src/
│   ├── backend_main.py              # FastAPI backend
│   └── requirements.txt
│
├── start-all-projects.bat            # Batch script to start all servers
├── README.md                          # This file
├── README_ALL_PROJECTS.md            # Detailed project overview
└── RUN_ONE_AT_A_TIME.md              # Step-by-step running guide
```

---

## 🛠️ Technologies Used

### Backend Technologies
- **Python 3.9+** - Primary backend language
- **FastAPI** - Modern Python web framework
- **Node.js / Express** - JavaScript backend for Case File Library
- **SQLite** - Lightweight database for Courtroom Simulation
- **WebSockets** - Real-time communication
- **pdfplumber / PyPDF2** - PDF text extraction
- **spaCy** - Natural language processing

### Frontend Technologies
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript (Courtroom Simulation, Contract Analysis)
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS (Courtroom Simulation)
- **Material UI** - Component library (Case File Library)

### AI & APIs
- **Google Gemini API** - AI opposing counsel, contract analysis
- **OpenAI GPT-4** (via OpenRouter) - Mentor, analyzer, summarization
- **OpenRouter API** - Unified AI API gateway
- **Indian Kanoon API** - Indian legal case search

---

## 📚 API Documentation

### Courtroom Simulation

- **Backend API Docs:** http://localhost:8101/docs (FastAPI Swagger UI)
- **WebSocket Endpoint:** `ws://localhost:8101/ws/simulation/{session_id}`
- **Key Endpoints:**
  - `POST /api/case/create` - Create case and session
  - `POST /api/help` - Get mentor assistance
  - `POST /api/analyze/{session_id}` - Get performance analysis

### Case File Library

- **Backend:** http://localhost:5000
- **Key Endpoints:**
  - `GET /api/search?query=...` - Search Indian cases
  - `POST /api/upload` - Upload case PDF
  - `POST /api/summarize` - Get AI summary

### AI Contract Analysis

- **Backend API Docs:** http://localhost:8100/docs (FastAPI Swagger UI)
- **Key Endpoints:**
  - `POST /api/document/upload` - Upload contract
  - `POST /api/analyze` - Analyze contract

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :PORT

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Module Not Found Errors

```bash
# Ensure virtual environment is activated
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # Linux/Mac

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Errors

- Ensure frontend URLs are added to backend CORS `allow_origins` list
- Check that frontend and backend ports match configuration

### API Key Errors

- Verify `.env` files exist in correct directories
- Check API keys are valid and have sufficient quota
- For Gemini 429 errors, the system automatically falls back to OpenRouter

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### spaCy Model Missing

```bash
python -m spacy download en_core_web_sm
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test all changes before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👏 Acknowledgments

- **Google Gemini** - AI opposing counsel and contract analysis
- **OpenAI** - Mentor and analyzer capabilities
- **OpenRouter** - Unified AI API gateway
- **Indian Kanoon** - Indian legal case database
- **FastAPI** - Modern Python web framework
- **React** - UI framework
- **Vite** - Build tool

---

## 🎯 Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/ssomasekhar018/ClauseCheck.git
cd ClauseCheck

# 2. Install dependencies (see Installation section above)

# 3. Configure environment variables (see Configuration section)

# 4. Start all projects
.\start-all-projects.bat

# 5. Open browser
# - Home: http://localhost:8080
# - Courtroom Simulation: http://localhost:5174
# - Case File Library: http://localhost:3000
# - AI Contract Analysis: http://localhost:5175
```

---

**Made with ❤️ for the legal technology community**
