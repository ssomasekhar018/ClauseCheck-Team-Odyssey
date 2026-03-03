# Law Simulation Training Platform

A full-stack web application that allows lawyers to practice courtroom arguments in a safe, simulated environment. The system uses AI to simulate an opposing counsel (Gemini) and provides real-time mentorship assistance (GPT-4).

## Features

- **Case Input**: Submit case details including type, facts, charges, and evidence
- **Real-time Debate**: Argue with an AI-powered opposing counsel via WebSocket
- **Mentor Assistant**: Get help during the simulation with a bulb icon (💡)
  - "Help me understand" - Explains what opposing counsel said
  - Custom queries - Ask specific legal questions
- **Performance Analysis**: Receive win probability and case weaknesses after simulation

## Tech Stack

### Backend
- **Python 3.9+** with FastAPI
- **SQLite** database
- **Gemini API** (Opposing counsel bot)
- **OpenAI GPT-4** (Mentor and analyzer bots)

### Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **TailwindCSS** for styling
- **WebSocket** for real-time communication

## Project Structure

```
law-simulation/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app with routes
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── database.py          # Database setup
│   │   ├── schemas.py           # Pydantic schemas
│   │   └── agents/
│   │       ├── opposing_counsel.py  # Gemini-based opponent
│   │       ├── observer.py          # GPT-4 mentor
│   │       └── analyzer.py          # GPT-4 analyzer
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CaseForm.tsx
│   │   │   ├── SimulationRoom.tsx
│   │   │   ├── HelpPanel.tsx
│   │   │   └── Results.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Node.js 18+ and npm
- OpenAI API key
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** in the `backend` directory:
   ```bash
   copy .env.example .env
   ```
   
5. **Edit `.env` file** with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=sqlite:///./law_simulation.db
   ```

6. **Run the backend server**:
   ```bash
   python -m app.main
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 5173
   ```

   Backend will be running at: `http://localhost:5173`

### Frontend Setup

1. **Open a new terminal** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Frontend will be running at: `http://localhost:5174`

## Usage

1. **Open your browser** and go to `http://localhost:5174`

2. **Fill in the case details**:
   - Case Type (e.g., "Criminal Defense")
   - Case Facts (describe the situation)
   - Charges (list the charges)
   - Evidence (optional)

3. **Click "Start Simulation"** to enter the courtroom

4. **Argue your case**:
   - Type your arguments in the chat
   - Opposing counsel (Gemini) will respond
   - Use the 💡 "Get Help" button anytime for assistance

5. **Get Help**:
   - **Help Me Understand**: Explains the opponent's last response
   - **Ask Question**: Ask custom legal queries

6. **End Simulation** when done:
   - View your win probability
   - Review case weaknesses and improvement areas
   - Start a new simulation

## API Endpoints

- `POST /api/case/create` - Create new case and session
- `WS /ws/simulation/{session_id}` - WebSocket for real-time debate
- `POST /api/help` - Get assistance from mentor AI
- `POST /api/analyze/{session_id}` - Get final case analysis

## Architecture

### AI Agents

1. **Opposing Counsel (Gemini)**:
   - Argues against the lawyer
   - Challenges arguments professionally
   - Acts as realistic courtroom opponent

2. **Observer/Mentor (GPT-4)**:
   - Monitors conversation silently
   - Provides contextual help when requested
   - Answers legal questions

3. **Analyzer (GPT-4)**:
   - Evaluates entire conversation
   - Calculates win probability
   - Identifies case weaknesses

### Communication Flow

```
Frontend (React) 
    ↕ WebSocket
Backend (FastAPI)
    ↕
AI Agents (Gemini + GPT-4)
    ↕
Database (SQLite)
```

## Development

### Backend Development
```bash
# Install dev dependencies
pip install -r requirements.txt

# Run with hot reload
uvicorn app.main:app --reload
```

### Frontend Development
```bash
# Run dev server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Backend Issues

- **Module not found**: Make sure you're in the backend directory and have activated the virtual environment
- **API key errors**: Verify your `.env` file has correct API keys
- **Database errors**: Delete `law_simulation.db` and restart the server

### Frontend Issues

- **Connection refused**: Make sure backend is running on port 5173
- **WebSocket errors**: Check browser console and backend logs
- **Build errors**: Delete `node_modules` and run `npm install` again

## Future Enhancements

- [ ] Multiple judge personalities
- [ ] Voice input/output
- [ ] Case law database integration
- [ ] Multi-turn document submission during debate
- [ ] Performance history tracking
- [ ] Practice sessions recording and playback

## License

MIT License - Feel free to use for learning and practice purposes.

## Credits

Built with ❤️ for lawyers who want to sharpen their courtroom skills.
