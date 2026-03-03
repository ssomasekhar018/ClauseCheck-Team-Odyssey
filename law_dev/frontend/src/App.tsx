import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import CaseForm from './components/CaseForm';
import CaseReview from './components/CaseReview';
import SimulationRoom from './components/SimulationRoom';
import Results from './components/Results';
import { CaseData, api } from './services/api';
import './navbar.css';

type AppState = 'form' | 'review' | 'simulation' | 'ending' | 'results';

function App() {
  const [state, setState] = useState<AppState>('form');
  const [sessionId, setSessionId] = useState<string>('');
  const [extractedData, setExtractedData] = useState<CaseData | null>(null);

  const handleCaseCreated = (id: string) => {
    setSessionId(id);
    setState('simulation');
  };

  const handleExtractedData = (data: CaseData) => {
    setExtractedData(data);
    setState('review');
  };

  const handleReviewConfirm = async (data: CaseData) => {
    try {
      const response = await api.createCase(data);
      handleCaseCreated(response.session_id);
    } catch (error) {
      console.error('Failed to create case:', error);
    }
  };

  const handleReviewBack = () => {
    setExtractedData(null);
    setState('form');
  };

  const handleEndSimulation = () => {
    setState('ending');
  };

  const handleNewCase = () => {
    setSessionId('');
    setExtractedData(null);
    setState('form');
  };

  return (
    <ThemeProvider>
      {/* Animated background — same as home page */}
      <div className="background-animate" />
      <div className="particles" />

      {/* Navbar — exact same structure & classes as landing/index.html */}
      <nav className="cc-navbar">
        <a href="http://localhost:8080" className="cc-logo">
          <i className="bx bxs-layer" />
          ClauseCheck
        </a>

        <div className="cc-nav-links">
          <a href="http://localhost:8080" className="cc-nav-item">
            <i className="bx bx-home" />
            Home
          </a>
          <a href="http://localhost:5175" className="cc-nav-item">
            <i className="bx bxs-analyse" />
            AI Analysis
          </a>
          <a href="http://localhost:5174" className="cc-nav-item active">
            <i className="bx bx-gavel" />
            Courtroom
          </a>
          <a href="http://localhost:3000" className="cc-nav-item">
            <i className="bx bx-library" />
            Case Files
          </a>
        </div>

        <div className="cc-ai-badge">
          <div className="cc-ai-dot" />
          AI Engine Active
        </div>
      </nav>

      {/* Spacer below fixed navbar */}
      <div className="cc-navbar-spacer" />

      {state === 'form' && (
        <CaseForm
          onCaseCreated={handleCaseCreated}
          onExtractedData={handleExtractedData}
        />
      )}
      {state === 'review' && extractedData && (
        <CaseReview
          extractedData={extractedData}
          onConfirm={handleReviewConfirm}
          onBack={handleReviewBack}
        />
      )}
      {state === 'simulation' && (
        <SimulationRoom sessionId={sessionId} onEndSimulation={handleEndSimulation} />
      )}
      {state === 'ending' && (
        <EndSplash onDone={() => setState('results')} />
      )}
      {state === 'results' && (
        <Results sessionId={sessionId} onNewCase={handleNewCase} />
      )}
    </ThemeProvider>
  );
}

function EndSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'black'
    }}>
      <div style={{
        borderRadius: '50%', overflow: 'hidden',
        width: 'min(90vw, 90vh)', height: 'min(90vh, 90vw)'
      }}>
        {/* @ts-ignore */}
        <dotlottie-player
          src="/justice-hummer-black.lottie"
          background="transparent"
          style={{ width: '100%', height: '100%' }}
          autoplay
        ></dotlottie-player>
      </div>
      <div style={{
        marginTop: '1.5rem', color: 'white',
        fontSize: '3.5rem', fontWeight: 800, letterSpacing: '0.05em'
      }}>
        Verdict
      </div>
    </div>
  );
}

export default App;
