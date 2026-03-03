import React, { useState } from 'react';
import type { FormEvent } from 'react';

import { motion } from 'framer-motion';
import { Upload, FileText, AlertTriangle, CheckCircle, BrainCircuit, Activity, BarChart2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GlassCard } from './components/GlassCard';
import { StatCard } from './components/StatCard';
import { Issue } from './components/Issue';
import { PageContainer } from './components/PageContainer';
import { RiskGauge } from './components/RiskGauge';

// --- Types ---
interface AnalysisResult {
  document: { source_name: string; content: string };
  clauses: Array<{ id: number; type: { name: string } | string; text: string }>;
  risks: Array<{ clause_id: number; level: { name: string } | string; reasons: string[] }>;
  heuristic_summary: string;
  disclaimer: string;
  llm_summary?: string | null;
  llm_risk_overview?: string | null;
}

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'risks' | 'breakdown' | 'analytics'>('summary');

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file && !text.trim()) {
      setError('Please upload a contract file or paste contract text.');
      return;
    }

    setLoading(true);
    try {
      let res: Response;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/analyze/file', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      }

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as AnalysisResult;

      // Normalize data
      const normalizedData: AnalysisResult = {
        document: data.document || { source_name: 'Unknown', content: '' },
        clauses: Array.isArray(data.clauses) ? data.clauses : [],
        risks: Array.isArray(data.risks) ? data.risks : [],
        heuristic_summary: data.heuristic_summary || '',
        disclaimer: data.disclaimer || 'Not legal advice.',
        llm_summary: data.llm_summary || null,
        llm_risk_overview: data.llm_risk_overview || null,
      };

      setAnalysis(normalizedData);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong while analyzing the contract.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract risk level string
  const getRiskLevel = (level: { name: string } | string) => {
    if (typeof level === 'string') return level;
    return level?.name || 'Unknown';
  };

  // Calculate stats
  const riskCount = analysis?.risks.length || 0;
  const highRiskCount = analysis?.risks.filter(r => {
    const lvl = getRiskLevel(r.level).toLowerCase();
    return lvl.includes('high') || lvl.includes('critical');
  }).length || 0;

  // Mock score based on risks (start at 100, deduct for risks)
  const riskScore = Math.max(0, 100 - (riskCount * 5) - (highRiskCount * 10));

  return (
    <div className="min-h-screen bg-bgDark text-slate-200 font-sans selection:bg-primary/30 relative">
      <div className="background-animate" />
      <div className="particles" />
      <Navbar />

      <PageContainer
        title="AI Contract Intelligence"
        description="Real-time clause risk detection powered by NLP models"
      >
        <div className="grid grid-cols-12 gap-8">

          {/* --- Left Panel: Input --- */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <FileText size={100} />
                </div>

                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <Upload className="text-primary" /> Upload Contract
                </h2>

                <form onSubmit={handleAnalyze} className="space-y-6">

                  {/* File Upload Area */}
                  <div className="relative group">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.txt,.text"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`
                      border-2 border-dashed border-slate-600 rounded-xl p-8 text-center transition-all duration-300
                      group-hover:border-primary group-hover:bg-slate-800/50
                      ${file ? 'border-primary bg-slate-800/30' : ''}
                    `}>
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                          <Upload className="text-slate-400 group-hover:text-primary" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                          {file ? file.name : "Drag & drop or click to upload PDF/TXT"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-slate-500 text-sm">OR PASTE TEXT</span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                  </div>

                  <textarea
                    className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    placeholder:text-slate-600 resize-none font-mono text-sm transition-all"
                    placeholder="Paste contract clauses here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary 
                    text-white font-bold text-lg shadow-lg shadow-primary/25
                    hover:scale-[1.02] hover:shadow-glow active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BrainCircuit size={20} /> Analyze Contract
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                      <AlertTriangle size={20} />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                </form>
              </GlassCard>
            </motion.div>
          </div>

          {/* --- Right Panel: Results --- */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {!analysis && !loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[500px]"
              >
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Activity size={40} className="text-slate-600" />
                </div>
                <p className="text-xl">Ready to analyze legal documents</p>
                <p className="text-sm max-w-md text-center">
                  Our AI engine will detect risks, summarize clauses, and provide liability warnings in seconds.
                </p>
              </motion.div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Stats Row */}
                <GlassCard className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 w-full">
                      <h3 className="text-lg font-semibold text-white mb-4">Risk Overview</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard title="Risks Found" value={riskCount} />
                        <StatCard title="Critical Flags" value={highRiskCount} />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <RiskGauge score={riskScore} />
                    </div>
                  </div>
                </GlassCard>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-1">
                  {['summary', 'risks', 'breakdown', 'analytics'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative
                        ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
                      `}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {activeTab === 'summary' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <GlassCard>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <BrainCircuit className="text-secondary" />
                          {analysis.llm_summary ? "AI Executive Summary" : "Heuristic Summary"}
                        </h3>

                        {analysis.llm_summary ? (
                          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                            {analysis.llm_summary.split('\n').map((line, i) => (
                              <p key={i} className="mb-2">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm flex items-center gap-2">
                              <AlertTriangle size={16} />
                              AI Summary unavailable. Showing rule-based analysis.
                            </div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {analysis.heuristic_summary || "No summary available."}
                            </p>
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Distribution */}
                        <GlassCard>
                          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Activity className="text-red-400" /> Risk Distribution
                          </h3>
                          <div className="space-y-4">
                            {[
                              { label: 'High Risk', count: analysis.risks.filter(r => getRiskLevel(r.level).toLowerCase().includes('high')).length, color: 'bg-red-500' },
                              { label: 'Medium Risk', count: analysis.risks.filter(r => getRiskLevel(r.level).toLowerCase().includes('medium')).length, color: 'bg-yellow-500' },
                              { label: 'Low Risk', count: analysis.risks.filter(r => getRiskLevel(r.level).toLowerCase().includes('low')).length, color: 'bg-blue-500' }
                            ].map((item) => (
                              <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">{item.label}</span>
                                  <span className="text-white font-medium">{item.count}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.count / (riskCount || 1)) * 100}%` }}
                                    className={`h-full ${item.color}`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </GlassCard>

                        {/* Clause Breakdown */}
                        <GlassCard>
                          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <BarChart2 className="text-primary" /> Clause Breakdown
                          </h3>
                          <div className="space-y-3">
                            {Object.entries(analysis.clauses.reduce((acc, clause) => {
                              const typeName = typeof clause.type === 'string' ? clause.type : clause.type.name;
                              acc[typeName] = (acc[typeName] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>))
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5)
                              .map(([type, count], idx) => (
                                <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-mono">
                                      {idx + 1}
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">{type}</span>
                                  </div>
                                  <span className="text-white font-bold">{count}</span>
                                </div>
                              ))}
                            {analysis.clauses.length === 0 && (
                              <p className="text-slate-500 text-center py-4">No clauses identified.</p>
                            )}
                          </div>
                        </GlassCard>
                      </div>

                      {/* Health Score */}
                      <GlassCard className="flex items-center justify-between p-8">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">Contract Health Score</h3>
                          <p className="text-slate-400">Based on risk density and critical flags</p>
                        </div>
                        <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                          {riskScore}/100
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {activeTab === 'risks' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <GlassCard>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-white">Detected Risks</h3>
                          <span className="text-xs text-slate-400">{riskCount} issues found</span>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {analysis.risks.length === 0 ? (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center gap-2">
                              <CheckCircle size={20} /> No significant risks detected.
                            </div>
                          ) : (
                            analysis.risks.map((risk, idx) => (
                              <Issue
                                key={idx}
                                severity={getRiskLevel(risk.level)}
                                text={risk.reasons[0] || "Potential issue detected in clause."}
                              />
                            ))
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {activeTab === 'breakdown' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <GlassCard>
                        <h3 className="text-lg font-semibold text-white mb-4">Clause Breakdown</h3>
                        <div className="space-y-4">
                          {analysis.clauses.slice(0, 5).map((clause, idx) => (
                            <div key={idx} className="p-3 bg-slate-800/30 rounded-lg border border-white/5">
                              <div className="text-xs text-primary mb-1 uppercase tracking-wider font-bold">
                                {typeof clause.type === 'string' ? clause.type : clause.type.name}
                              </div>
                              <p className="text-sm text-slate-300 line-clamp-2">{clause.text}</p>
                            </div>
                          ))}
                          {analysis.clauses.length > 5 && (
                            <p className="text-center text-slate-500 text-sm mt-2">
                              + {analysis.clauses.length - 5} more clauses analyzed
                            </p>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
                        <BarChart2 size={48} className="text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Deep Analytics</h3>
                        <p className="text-slate-400 max-w-sm">
                          Detailed contract metrics, readability scores, and jurisdiction heatmap coming soon in Pro version.
                        </p>
                      </GlassCard>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default App;
