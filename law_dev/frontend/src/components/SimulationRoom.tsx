import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import HelpPanel from './HelpPanel';

interface Message {
  role: 'lawyer' | 'opponent';
  content: string;
}

interface SimulationRoomProps {
  sessionId: string;
  onEndSimulation: () => void;
}

const SimulationRoom: React.FC<SimulationRoomProps> = ({ sessionId, onEndSimulation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [showObjection, setShowObjection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unmounting = false;
    const websocket = new WebSocket(api.getWebSocketUrl(sessionId));

    websocket.onopen = () => {
      if (unmounting) return;
      console.log('WebSocket connected');
      setIsConnected(true);
      setTimeout(() => setIsEntering(false), 1500);
    };

    websocket.onmessage = (event) => {
      if (unmounting) return;
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages((prev) => [...prev, { role: data.role, content: data.content }]);
      }
    };

    websocket.onerror = (error) => {
      if (unmounting) return;
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      if (unmounting) return;
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      unmounting = true;
      try { websocket.close(); } catch {}
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !ws || !isConnected) return;

    setMessages((prev) => [...prev, { role: 'lawyer', content: inputMessage }]);

    ws.send(JSON.stringify({
      type: 'lawyer_message',
      content: inputMessage
    }));

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isEntering) {
    return (
      <div className="flex h-screen items-center justify-center relative overflow-hidden">
        {/* Entrance Animation - Scales Animation */}
        <div className="relative z-50 text-center space-y-8">
          {/* Scales Icon with Bounce */}
          <div className="relative inline-block" style={{animation: 'bounce 1.5s ease-in-out'}}>
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              backdropFilter: 'blur(40px)',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 80px rgba(139, 92, 246, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
            }}>
              <svg className="w-28 h-28 dark:text-white light:text-purple-700 drop-shadow-2xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Rotating shine */}
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-gradient" style={{animationDuration: '3s'}}></div>
              </div>
            </div>
            {/* Expanding rings */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" style={{animationDuration: '2s', animationDelay: '0.5s'}}></div>
          </div>

          {/* Text Animation */}
          <div className="space-y-4" style={{animation: 'slideUp 1s ease-out 0.3s both'}}>
            <h2 className="text-5xl font-bold bg-gradient-to-r dark:from-white dark:via-purple-300 light:from-gray-900 light:via-purple-600 bg-clip-text text-transparent" style={{fontFamily: 'Inter, sans-serif'}}>
              Entering Courtroom
            </h2>
            <p className="dark:text-white/60 light:text-gray-600 text-xl">Preparing your AI-powered simulation...</p>
          </div>

          {/* Loading Animation - Scales Tipping */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-4 h-20 rounded-full bg-gradient-to-t from-purple-600 via-purple-500 to-blue-500 animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/10 to-black"></div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="glass glass-border border-b dark:border-white/5 light:border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 dark:bg-purple-600 light:bg-purple-400 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-14 h-14 glass glass-border rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 dark:text-white/90 light:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 dark:border-black light:border-white ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </div>
              <div>
                <h1 className="text-xl font-bold dark:text-white light:text-gray-900">Courtroom Simulation</h1>
                <p className="text-xs dark:text-white/50 light:text-gray-500 flex items-center gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setHelpPanelOpen(!helpPanelOpen)}
                className="group glass glass-border dark:border-yellow-500/20 light:border-yellow-500/40 dark:text-white/90 light:text-gray-700 px-5 py-2.5 rounded-xl hover-lift hover:border-yellow-500/40 transition-all duration-300 text-sm font-medium flex items-center gap-2"
              >
                <span className="text-lg">💡</span>
                Get Help
              </button>
              <button
                onClick={onEndSimulation}
                className="group glass glass-border dark:border-red-500/20 light:border-red-500/40 dark:text-white/90 light:text-gray-700 px-5 py-2.5 rounded-xl hover-lift hover:border-red-500/40 transition-all duration-300 text-sm font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 dark:bg-gradient-to-r light:bg-gradient-to-r dark:from-purple-600 light:from-purple-500 dark:to-blue-600 light:to-blue-500 rounded-full opacity-20 blur-2xl"></div>
                    <div className="relative glass glass-border rounded-full w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 dark:text-white/60 light:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold dark:text-white light:text-gray-900 mb-2">Start Your Defense</h3>
                    <p className="dark:text-white/50 light:text-gray-600">Begin arguing your case in the courtroom</p>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isLawyer = msg.role === 'lawyer';
              const bubbleClasses = `group max-w-2xl px-6 py-4 rounded-2xl glass glass-border ` +
                (isLawyer
                  ? 'dark:bg-gradient-to-br dark:from-purple-600/20 dark:to-blue-600/20 dark:border-purple-500/30 light:bg-gradient-to-br light:from-purple-600/30 light:to-blue-600/30 light:border-purple-500/40'
                  : 'dark:bg-white/5 dark:border-white/10 light:bg-gray-100 light:border-gray-200');
              return (
                <div
                  key={idx}
                  className={`flex items-start ${isLawyer ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={`flex items-start gap-3 ${isLawyer ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={isLawyer ? '/mclawyer.gif' : '/oplawyer.gif'}
                      alt={isLawyer ? 'You' : 'Opposing Counsel'}
                      className="w-9 h-9 rounded-full object-cover border border-white/20"
                    />
                    <div className={bubbleClasses}>
                      <p className="text-xs font-medium dark:text-white/60 light:text-gray-600 mb-1">
                        {isLawyer ? 'You' : 'Opposing Counsel'}
                      </p>
                      <p className="dark:text-white/90 light:text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="glass glass-border border-t dark:border-white/5 light:border-gray-200 px-6 py-5">
          <div className="flex gap-3 max-w-4xl mx-auto items-start">
            <button
              onClick={() => { setShowObjection(true); setTimeout(() => setShowObjection(false), 1000); }}
              className="glass glass-border dark:border-red-500/30 light:border-red-500/40 dark:text-white light:text-gray-800 px-4 py-3 rounded-xl hover-lift hover:border-red-500/50 transition-all duration-300 text-sm font-semibold"
            >
              Objection
            </button>
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your Honor, ... Use sections (e.g. Under S.420 IPC), citations (In [Case]...), I submit that... Use bullets for multiple points."
                rows={1}
                className="w-full px-5 py-4 glass-light glass-border rounded-xl dark:text-white light:text-gray-800 dark:placeholder-white/30 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-300"
                disabled={!isConnected}
              />
              <div className="absolute bottom-2 right-2 text-xs dark:text-white/20 light:text-gray-400">
                Enter to send
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="glass glass-border dark:border-purple-500/30 light:border-purple-500/40 dark:text-white light:text-gray-800 px-6 py-4 rounded-xl hover-lift hover:border-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none transition-all duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Temporary objection overlay */}
      {showObjection && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <img src="/objection.gif" alt="Objection" className="w-40 h-40 object-contain" />
        </div>
      )}

      {/* Help Panel */}
      <HelpPanel
        sessionId={sessionId}
        isOpen={helpPanelOpen}
        onClose={() => setHelpPanelOpen(false)}
        onUseResponse={(response) => {
          setInputMessage(response);
          setHelpPanelOpen(false);
        }}
      />
    </div>
  );
};

export default SimulationRoom;
