import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ExternalLink, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { PageContainer } from './PageContainer';
import { GlassCard } from './GlassCard';

const DocumentViewer = ({ document: caseItem, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (caseItem?.docId) {
      fetchDocument();
    }
  }, [caseItem]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/doc/${caseItem.docId}`);
      // The API returns { doc: "content..." } or { doc: { content: "..." } } depending on source
      const data = response.data;
      const content = data.doc?.content || data.doc || data.content || '';
      setDocumentContent(content);
    } catch (err) {
      console.error('Failed to fetch document:', err);
      setError('Failed to load document content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      setError('');
      
      if (!documentContent) {
        setError('No document text available to summarize');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docId: caseItem.docId,
          text: documentContent.slice(0, 10000),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (err) {
      console.error('Summarize error:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleViewOriginal = () => {
    if (caseItem.url) {
      window.open(caseItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <PageContainer
      title={caseItem.title || 'Document Viewer'}
      description={`Case ID: ${caseItem.docId}`}
      action={
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Results
        </button>
      }
    >
      <div className="grid grid-cols-12 gap-8">
        {/* Left Panel: Document Content */}
        <div className="col-span-12 lg:col-span-8">
          <GlassCard className="h-[calc(100vh-250px)] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-secondary" /> Full Text
              </h2>
              {caseItem.url && (
                <button
                  onClick={handleViewOriginal}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  View Original <ExternalLink size={14} />
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-slate-300 leading-relaxed text-sm font-serif">
              {documentContent ? (
                <div dangerouslySetInnerHTML={{ __html: documentContent }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <AlertCircle size={32} className="mb-2" />
                  <p>Content not available.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: AI Summary */}
        <div className="col-span-12 lg:col-span-4">
          <GlassCard className="h-[calc(100vh-250px)] flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4 flex-shrink-0">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">AI Analysis</h3>
            </div>

            {summary ? (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                   <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-white/5 rounded-full p-4 mb-4">
                   <Sparkles className="text-primary w-8 h-8 opacity-80" />
                </div>
                <h4 className="text-white font-semibold mb-2">Generate AI Summary</h4>
                <p className="text-slate-400 mb-6 text-sm max-w-[250px]">
                  Get a quick overview of key points, rulings, and citations.
                </p>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold shadow-lg shadow-primary/25 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {summarizing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Analyze Document
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default DocumentViewer;
