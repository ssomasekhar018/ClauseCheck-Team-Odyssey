import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { PageContainer } from './PageContainer';
import { GlassCard } from './GlassCard';

const UploadPage = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        setError('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
      setSummary('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSummary('');

      const formData = new FormData();
      formData.append('pdf', selectedFile);

      // Note: Assuming endpoint is correct based on original code
      const response = await axios.post('/api/summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutes timeout
      });

      // Adjust based on actual API response structure if needed
      // Original code used /api/summarize-upload but DocumentViewer used /api/summarize
      // Let's assume the backend handles multipart/form-data on /api/summarize or similar
      // Actually original code had: await axios.post('/api/summarize-upload', ...)
      // I should stick to that if it exists.
      
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Upload error:', err);
      // Fallback if the endpoint was different
      try {
          // Retry with /api/summarize if the first one fails (just a guess, or stick to original)
          // Actually, let's just stick to the original endpoint logic but clean it up
          // If the original code used /api/summarize-upload, I should use that.
          // Wait, I see `axios.post('/api/summarize-upload', ...)` in the original code snippet.
          // So I will use that.
      } catch (e) {}
      
      setError(err.response?.data?.error || 'Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Re-implementing the upload logic to be safe with the endpoint
  const performUpload = async () => {
      if (!selectedFile) return;
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('pdf', selectedFile); // The key might need to be 'file' or 'pdf' depending on backend. Original said 'pdf'.
      
      try {
         const response = await axios.post('/api/summarize-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         setSummary(response.data.summary);
      } catch (err) {
         setError('Failed to upload. ' + (err.response?.data?.error || err.message));
      } finally {
         setUploading(false);
      }
  };

  return (
    <PageContainer
      title="Document Summarizer"
      description="Upload legal PDFs for instant AI-powered summarization."
      action={
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Search
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Upload */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <GlassCard className="h-full flex flex-col justify-center items-center text-center p-12 relative overflow-hidden group">
             <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <Upload className="text-primary w-10 h-10" />
             </div>
             
             <h3 className="text-xl font-bold text-white mb-2">Select PDF Document</h3>
             <p className="text-slate-400 mb-8 max-w-xs">
               Max file size: 50MB.
             </p>

             <div className="relative mb-6 w-full max-w-xs">
               <input
                 type="file"
                 onChange={handleFileSelect}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 accept="application/pdf"
               />
               <div className="px-6 py-4 bg-white/5 border-2 border-dashed border-white/10 rounded-xl hover:border-primary hover:bg-white/10 transition-all flex flex-col items-center gap-2">
                 <span className="text-slate-300 font-medium truncate w-full text-center">
                    {selectedFile ? selectedFile.name : 'Choose PDF File'}
                 </span>
               </div>
             </div>
             
             <button
                onClick={performUpload}
                disabled={!selectedFile || uploading}
                className="w-full max-w-xs py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold shadow-lg shadow-primary/25 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
             >
                {uploading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
                {uploading ? 'Processing...' : 'Summarize Document'}
             </button>
             
             {error && (
               <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                 <AlertCircle size={16} /> {error}
               </div>
             )}
          </GlassCard>
        </motion.div>

        {/* Right: Result */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-400" /> AI Summary
            </h3>
            
            <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 overflow-y-auto custom-scrollbar">
              {summary ? (
                <div className="prose prose-invert prose-sm">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>Upload a document to see the AI-generated summary here.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default UploadPage;
