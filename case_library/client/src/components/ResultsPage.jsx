import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, ExternalLink, Download, FileText, Eye } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { GlassCard } from './GlassCard';

const ResultsPage = ({ results, query, onBack, onViewDocument }) => {
  const { count, results: cases } = results;

  const handleViewJudgment = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPDF = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer
      title="Search Results"
      description={`Found ${count} cases matching "${query}"`}
      action={
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={16} /> New Search
        </button>
      }
    >
      {count === 0 ? (
        <GlassCard className="text-center py-16">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No cases found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search terms or keywords.</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.tid || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="group hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                        {caseItem.title}
                      </h3>
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-400 font-mono">
                        ID: {caseItem.tid}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      {caseItem.docsource && (
                        <span className="flex items-center gap-1">
                          <Gavel size={14} /> {caseItem.docsource}
                        </span>
                      )}
                      {caseItem.publishdate && (
                        <span>{caseItem.publishdate}</span>
                      )}
                    </div>

                    <p className="text-slate-300 text-sm line-clamp-2 mb-4">
                      {caseItem.headline || "No summary available for this case."}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => onViewDocument(caseItem)}
                        className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Eye size={16} /> View Full Case
                      </button>

                      {caseItem.url && (
                        <button
                          onClick={() => handleViewJudgment(caseItem.url)}
                          className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                        >
                          <ExternalLink size={16} /> Source
                        </button>
                      )}

                      {caseItem.pdf_url && (
                        <button
                          onClick={() => handleDownloadPDF(caseItem.pdf_url)}
                          className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Download size={16} /> PDF
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* AI Score / Stats Badge (Mock) */}
                  <div className="hidden md:flex flex-col items-end gap-2 pl-4 border-l border-white/5">
                    <div className="text-right">
                       <span className="block text-xs text-slate-500 uppercase tracking-wider">Relevance</span>
                       <span className="text-xl font-bold text-green-400">9{index % 10}%</span>
                    </div>
                    <div className="text-right">
                       <span className="block text-xs text-slate-500 uppercase tracking-wider">Citations</span>
                       <span className="text-lg font-bold text-white">{Math.floor(Math.random() * 50)}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default ResultsPage;
