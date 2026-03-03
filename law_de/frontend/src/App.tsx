import React, { useEffect, useState } from 'react';
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
      {/* Global navbar to move between all projects */}
      <header className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-50 shadow">
        <span className="font-semibold tracking-wide">Legal Tech Suite</span>
        <nav className="flex gap-4 text-sm">
          <a href="http://localhost:8080" className="hover:underline">
            Home
          </a>
          <a href="http://localhost:5175" className="hover:underline">
            AI Contract Analysis
          </a>
          <a href="http://localhost:5174" className="hover:underline font-semibold">
            Courtroom Simulation
          </a>
          <a href="http://localhost:3000" className="hover:underline">
            Case File Library
          </a>
        </nav>
      </header>
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
