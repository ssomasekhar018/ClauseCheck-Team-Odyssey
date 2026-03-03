import React, { useState } from 'react';
import { api, HelpResponse } from '../services/api';

interface HelpPanelProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onUseResponse?: (response: string) => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ sessionId, isOpen, onClose, onUseResponse }) => {
  const [activeTab, setActiveTab] = useState<'understand' | 'custom'>('understand');
  const [customQuery, setCustomQuery] = useState('');
  const [helpResponse, setHelpResponse] = useState<HelpResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const getHelp = async () => {
    setLoading(true);
    setHelpResponse(null);

    try {
      const response = await api.getHelp({
        session_id: sessionId,
        help_type: activeTab,
        custom_query: activeTab === 'custom' ? customQuery : undefined
      });
      setHelpResponse(response);
    } catch (err) {
      setHelpResponse({
        content: 'Failed to get help. Please try again.',
        ready_response: undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseResponse = () => {
    if (helpResponse?.ready_response && onUseResponse) {
      onUseResponse(helpResponse.ready_response);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 glass glass-border border-l dark:border-white/5 light:border-gray-200 shadow-2xl z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="glass glass-border border-b dark:border-white/5 light:border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass glass-border dark:border-yellow-500/20 light:border-yellow-500/40 rounded-full p-1.5">
              <img src="/mentor.gif" alt="Mentor" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <h2 className="font-bold dark:text-white light:text-gray-900 text-lg">Mentor Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="dark:text-white/50 light:text-gray-500 hover:dark:text-white hover:light:text-gray-900 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-white/5 light:border-gray-200">
        <button
          onClick={() => setActiveTab('understand')}
          className={`flex-1 py-4 text-sm font-semibold relative transition-colors ${
            activeTab === 'understand' ? 'dark:text-white light:text-gray-900' : 'dark:text-white/40 light:text-gray-400'
          }`}
        >
          Understand
          {activeTab === 'understand' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-4 text-sm font-semibold relative transition-colors ${
            activeTab === 'custom' ? 'dark:text-white light:text-gray-900' : 'dark:text-white/40 light:text-gray-400'
          }`}
        >
          Ask Question
          {activeTab === 'custom' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'understand' ? (
          <div className="space-y-5">
            <div className="glass glass-border dark:border-purple-500/20 light:border-purple-500/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 dark:text-purple-400 light:text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm dark:text-white/70 light:text-gray-600 leading-relaxed">
                  Get an explanation of what the opposing counsel just said and learn how to respond effectively.
                </p>
              </div>
            </div>
            <button
              onClick={getHelp}
              disabled={loading}
              className="w-full glass glass-border dark:border-purple-500/30 light:border-purple-500/40 dark:text-white light:text-gray-800 py-4 rounded-xl hover-lift hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting help...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Explain Last Response
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="glass glass-border dark:border-purple-500/20 light:border-purple-500/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 dark:text-purple-400 light:text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm dark:text-white/70 light:text-gray-600 leading-relaxed">
                  Ask any legal question related to your case and get expert guidance.
                </p>
              </div>
            </div>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="e.g., What is the section for hit and run?"
              rows={5}
              className="w-full px-5 py-4 glass-light glass-border rounded-xl dark:text-white light:text-gray-800 dark:placeholder-white/30 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-300"
            />
            <button
              onClick={getHelp}
              disabled={loading || !customQuery.trim()}
              className="w-full glass glass-border dark:border-purple-500/30 light:border-purple-500/40 dark:text-white light:text-gray-800 py-4 rounded-xl hover-lift hover:border-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting answer...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ask Question
                </>
              )}
            </button>
          </div>
        )}

        {helpResponse && (
          <div className="mt-6 space-y-4">
            <div className="glass glass-border dark:border-purple-500/30 light:border-purple-500/40 rounded-xl p-5 animate-scale-in dark:bg-gradient-to-br dark:from-purple-500/10 dark:to-blue-500/10 light:bg-gradient-to-br light:from-purple-50 light:to-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 dark:text-purple-400 light:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold dark:text-white light:text-gray-900">Expert Guidance</h3>
              </div>
              <p className="text-sm dark:text-white/80 light:text-gray-700 whitespace-pre-wrap leading-relaxed">
                {helpResponse.content}
              </p>
            </div>
            
            {helpResponse.ready_response && (
              <div className="glass glass-border dark:border-green-500/30 light:border-green-500/40 rounded-xl p-5 animate-scale-in dark:bg-gradient-to-br dark:from-green-500/10 dark:to-emerald-500/10 light:bg-gradient-to-br light:from-green-50 light:to-emerald-50">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 dark:text-green-400 light:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-semibold dark:text-white light:text-gray-900">Ready-to-Use Response</h3>
                </div>
                <div className="mb-4 p-3 rounded-lg dark:bg-black/20 light:bg-white/50 dark:text-white/90 light:text-gray-800 text-sm whitespace-pre-wrap leading-relaxed border dark:border-white/10 light:border-gray-200">
                  {helpResponse.ready_response}
                </div>
                <button
                  onClick={handleUseResponse}
                  className="w-full glass glass-border dark:border-green-500/40 light:border-green-500/50 dark:text-white light:text-gray-800 py-3 rounded-xl hover-lift hover:border-green-500/60 transition-all duration-300 font-semibold flex items-center justify-center gap-2 dark:bg-gradient-to-r dark:from-green-600/20 dark:to-emerald-600/20 light:bg-gradient-to-r light:from-green-100 light:to-emerald-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Use This Response
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPanel;
