import React, { useEffect, useState } from 'react';
import { api, AnalysisResponse } from '../services/api';

interface ResultsProps {
  sessionId: string;
  onNewCase: () => void;
}

const Results: React.FC<ResultsProps> = ({ sessionId, onNewCase }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await api.analyzeCase(sessionId);
        setAnalysis(data);
      } catch (err) {
        console.error('Failed to fetch analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative mx-auto">
            <img src="/courtroom.gif" alt="Courtroom" className="w-96 h-96 object-cover rounded-full shadow-2xl" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white mb-2">Preparing the judgment...</p>
            <p className="text-white/50">Analyzing your performance</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass glass-border rounded-3xl shadow-2xl p-8 max-w-md animate-slide-up">
          <div className="text-center space-y-5">
            <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-lg font-semibold">Failed to load analysis</p>
            <button
              onClick={onNewCase}
              className="w-full glass glass-border border-purple-500/30 text-white py-3.5 rounded-xl hover-lift hover:border-purple-500/50 font-semibold transition-all duration-300"
            >
              Start New Case
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getWinProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-green-400';
    if (prob >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWinProbabilityBg = (prob: number) => {
    if (prob >= 70) return 'from-green-500 to-emerald-500';
    if (prob >= 40) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-pink-500';
  };

  const getWinProbabilityLabel = (prob: number) => {
    if (prob >= 70) return 'Strong Case';
    if (prob >= 40) return 'Moderate Case';
    return 'Weak Case';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in relative">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="glass glass-border rounded-3xl overflow-hidden animate-scale-in">
          <div className="dark:bg-gradient-to-r light:bg-gradient-to-r dark:from-purple-600/30 dark:via-blue-600/30 dark:to-purple-600/30 light:from-purple-500/20 light:via-blue-500/20 light:to-purple-500/20 p-10 text-center relative">
            <div className="absolute inset-0 dark:bg-gradient-to-r light:bg-gradient-to-r dark:from-purple-600/20 dark:to-blue-600/20 light:from-purple-500/10 light:to-blue-500/10 animate-gradient"></div>
            <div className="relative">
              <div className="text-6xl mb-4 animate-float">📊</div>
              <h1 className="text-4xl font-bold dark:text-white light:text-gray-900 mb-3 tracking-tight">
                Simulation Complete
              </h1>
              <p className="dark:text-white/60 light:text-gray-600 text-lg">
                Performance Analysis Report
              </p>
            </div>
          </div>
        </div>

        {/* Win Probability Card */}
        <div className="glass glass-border rounded-3xl p-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white light:text-gray-900 flex items-center gap-3">
                <div className="glass glass-border dark:border-purple-500/30 light:border-purple-500/40 rounded-xl p-2">
                  <svg className="w-6 h-6 dark:text-purple-400 light:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Win Probability
              </h2>
              <span className={`text-lg font-bold ${getWinProbabilityColor(analysis.win_probability)}`}>
                {getWinProbabilityLabel(analysis.win_probability)}
              </span>
            </div>
            
            <div className="relative h-20">
              <div className="glass-light glass-border h-full rounded-full overflow-hidden border-2 dark:border-white/10 light:border-gray-200">
                <div
                  className={`h-full bg-gradient-to-r ${getWinProbabilityBg(analysis.win_probability)} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${analysis.win_probability}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl font-bold ${getWinProbabilityColor(analysis.win_probability)} glow-text`}>
                  {analysis.win_probability.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Areas to Focus */}
        {analysis.case_cons.length > 0 && (
          <div className="glass glass-border rounded-3xl p-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl font-bold dark:text-white light:text-gray-900 mb-6 flex items-center gap-3">
              <div className="glass glass-border dark:border-blue-500/30 light:border-blue-500/40 rounded-xl p-2">
                <svg className="w-6 h-6 dark:text-blue-400 light:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              Areas to Focus
            </h2>
            <div className="space-y-4">
              {analysis.case_cons.map((focus, idx) => (
                <div
                  key={idx}
                  className="glass glass-border dark:border-blue-500/20 light:border-blue-500/30 dark:bg-blue-500/5 light:bg-blue-50 rounded-2xl p-5 flex items-start gap-4 hover-lift animate-scale-in"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <div className="glass glass-border dark:border-blue-500/30 light:border-blue-500/40 rounded-xl p-2 flex-shrink-0">
                    <svg className="w-5 h-5 dark:text-blue-400 light:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="dark:text-white/80 light:text-gray-800 flex-1 leading-relaxed font-medium whitespace-pre-wrap">{focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <button
            onClick={onNewCase}
            className="w-full glass glass-border dark:border-purple-500/30 light:border-purple-500/40 dark:text-white light:text-gray-800 py-5 rounded-2xl hover-lift hover:border-purple-500/50 font-bold text-lg transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Simulation
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 dark:bg-gradient-to-r light:bg-gradient-to-r dark:from-purple-600/10 dark:to-blue-600/10 light:from-purple-500/10 light:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
