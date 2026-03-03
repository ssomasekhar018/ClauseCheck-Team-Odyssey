import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import CaseForm from './components/CaseForm';
import CaseReview from './components/CaseReview';
import SimulationRoom from './components/SimulationRoom';
import Results from './components/Results';
import { CaseData, api } from './services/api';

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
      // You might want to show an error message here
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
      {/* Animated background matching home page */}
      <div className="background-animate" />
      <div className="particles" />

      {/* Fixed Navbar matching landing page style exactly */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(3, 7, 18, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 100,
        boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: '#7c3aed', flexShrink: 0 }}>
            <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>ClauseCheck</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          {([
            { href: 'http://localhost:8080', label: 'Home', active: false },
            { href: 'http://localhost:5175', label: 'AI Analysis', active: false },
            { href: 'http://localhost:5174', label: 'Courtroom', active: true },
            { href: 'http://localhost:3000', label: 'Case Files', active: false },
          ] as { href: string; label: string; active: boolean }[]).map(({ href, label, active }) => (
            <a
              key={href}
              href={href}
              style={{
                color: active ? 'white' : '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: active ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                border: active ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = 'white';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* AI Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.8rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '2rem',
          fontSize: '0.8rem',
          color: '#22c55e',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'navBlink 1.5s infinite',
            flexShrink: 0,
          }} />
          AI Engine Active
        </div>
      </nav>

      <style>{`
        @keyframes navBlink {
          0%   { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70%  { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>

      {/* Navbar spacer */}
      <div style={{ height: '4.5rem' }} />

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
    const t = setTimeout(onDone, 1000); // show for ~1s
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="rounded-full overflow-hidden" style={{ width: 'min(90vw, 90vh)', height: 'min(90vh, 90vw)' }}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        {/* @ts-ignore */}
        <dotlottie-player
          src="/justice-hummer-black.lottie"
          background="transparent"
          style={{ width: '100%', height: '100%' }}
          autoplay
        ></dotlottie-player>
      </div>
      <div className="mt-6 text-white text-5xl sm:text-6xl font-extrabold tracking-wide drop-shadow-lg">
        Verdict
      </div>
    </div>
  );
}

export default App;
