# Quick Start Guide - AI Contract Analysis System

## 🚀 Fastest Way to Run

### Option 1: All-in-One Script (Recommended)
```powershell
.\start-project.ps1
```

This script will:
- Clean up any existing processes
- Start the backend in a separate window
- Wait for backend to be ready
- Start the frontend
- Open your browser automatically

### Option 2: Separate Windows (Better for Debugging)

**Terminal 1 - Backend:**
```powershell
.\start-backend.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\start-frontend.ps1
```

### Option 3: Manual Start

**Backend:**
```powershell
cd C:\Desktop\vit-ap\ai-contract-analysis-system
python -m uvicorn backend_main:app --reload --host 127.0.0.1 --port 8100
```

**Frontend:**
```powershell
cd C:\Desktop\vit-ap\ai-contract-analysis-system\frontend
npm run dev
```

## 📍 URLs

Once running:
- **Frontend**: http://localhost:5175
- **Backend API**: http://127.0.0.1:8100
- **API Documentation**: http://127.0.0.1:8100/docs

## ✅ Testing

Test if backend is working:
```powershell
.\test-backend.ps1
```

Or manually:
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8100/health" -UseBasicParsing
```

## 🔧 Troubleshooting

### Backend returns 404
1. Make sure backend is running: Check http://127.0.0.1:8100/health
2. Check if port 8100 is in use: `netstat -ano | findstr :8100`
3. Kill existing processes: `.\start-project.ps1` (it auto-cleans)

### Frontend can't connect to backend
1. Verify backend is running on port 8100
2. Check browser console for errors
3. Verify proxy in `frontend/vite.config.ts` points to `http://127.0.0.1:8100`

### Port already in use
```powershell
# Find process on port 8100
netstat -ano | findstr :8100

# Kill it (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

## 📝 Environment Variables

Create a `.env` file in the project root:
```
GEMINI_API_KEY=your-api-key-here
```

This enables enhanced AI summaries using Google's Gemini API. The system works without it using heuristic analysis.

## 🛑 Stopping Servers

- **Frontend**: Press `Ctrl+C` in the frontend terminal
- **Backend**: Press `Ctrl+C` in the backend window, or close the window

## 📚 Project Structure

```
ai-contract-analysis-system/
├── backend_main.py          # FastAPI backend server
├── contract_ai/             # Core analysis modules
├── frontend/                # React + Vite frontend
├── start-project.ps1        # All-in-one startup script
├── start-backend.ps1        # Backend only
├── start-frontend.ps1       # Frontend only
├── test-backend.ps1         # Test backend connectivity
└── run-dev.ps1              # Original dev script (improved)
```

## 🎯 Next Steps

1. Open http://localhost:5175 in your browser
2. Upload a PDF contract or paste contract text
3. Click "Analyze Contract"
4. Review the results in the tabs:
   - **AI Summary**: Overview of the contract
   - **Risk highlights**: Flagged risk areas
   - **Clause list**: Identified clauses
   - **Extracted text**: Raw contract text

## 💡 Tips

- The backend runs with auto-reload, so code changes restart automatically
- Frontend also has hot-reload for instant UI updates
- Check the browser developer console (F12) for detailed error messages
- Backend logs appear in the backend terminal window
