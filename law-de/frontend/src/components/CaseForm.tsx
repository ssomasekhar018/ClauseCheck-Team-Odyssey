import React, { useState } from 'react';
import { api, CaseData } from '../services/api';

interface CaseFormProps {
  onCaseCreated: (sessionId: string) => void;
  onExtractedData?: (data: CaseData) => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ onCaseCreated, onExtractedData }) => {
  const [formData, setFormData] = useState<CaseData>({
    case_type: '',
    facts: '',
    charges: '',
    evidence: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setSelectedFile(file);

    try {
      const response = await api.uploadDocument(file);
      if (response.success && response.case_details) {
        // Pre-fill form with extracted data
        setFormData({
          case_type: response.case_details.case_type || '',
          facts: response.case_details.facts || '',
          charges: response.case_details.charges || '',
          evidence: response.case_details.evidence || ''
        });
        // If onExtractedData callback exists, call it to show review step
        if (onExtractedData) {
          onExtractedData(response.case_details);
        }
      }
    } catch (err: any) {
      console.error('Upload error details:', err);
      let errorMessage = 'Failed to process document';
      
      if (err.response) {
        // Server responded with a status code outside 2xx range
        errorMessage = err.response.data?.detail || `Server Error (${err.response.status})`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network Error: No response from server. Is the backend running on port 8000?';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setError(`Unsupported file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.createCase(formData);
      onCaseCreated(response.session_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative inline-block" style={{animation: 'bounce 1.5s ease-in-out'}}>
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                backdropFilter: 'blur(40px)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 80px rgba(139, 92, 246, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
              }}>
                <svg className="w-20 h-20 dark:text-white light:text-purple-700 drop-shadow-2xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          </div>
          <h1 className="text-6xl font-bold mb-6 tracking-tight text-white">
            Law Simulation
          </h1>
          <p className="text-white/70 text-xl font-medium">
            Master the courtroom with AI-powered practice sessions
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl p-10 animate-scale-in" style={{
          boxShadow: `
            0 25px 100px -20px rgba(0, 0, 0, 0.5), 
            0 0 0 1px rgba(139, 92, 246, 0.1), 
            inset 0 1px 0 rgba(139, 92, 246, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.7) 0%, rgba(20, 20, 20, 0.8) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '2px solid rgba(139, 92, 246, 0.2)',
        }}>
          {/* Upload Section */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
              <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            </div>
            
            <div className="relative">
              <input
                type="file"
                id="document-upload"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="document-upload"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  uploading 
                    ? 'border-purple-500/50 bg-purple-500/10' 
                    : 'border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10'
                }`}
                style={{
                  background: uploading 
                    ? 'rgba(139, 92, 246, 0.1)' 
                    : 'rgba(30, 30, 30, 0.5)',
                }}
              >
                {uploading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white/90 font-medium">Processing document...</p>
                    <p className="text-white/60 text-sm mt-2">Extracting case details</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-white/90 font-medium mb-2">Upload Case Document</p>
                    <p className="text-white/60 text-sm">PDF, DOC, DOCX, or TXT</p>
                    <p className="text-white/40 text-xs mt-2">AI will extract case details automatically</p>
                  </>
                )}
              </label>
            </div>
            
            {selectedFile && !uploading && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-white/90 text-sm flex-1">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFormData({ case_type: '', facts: '', charges: '', evidence: '' });
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Case Type */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 text-white/90">
                <div className="rounded-xl p-2.5 border-purple-500/30" style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Case Type
              </label>
              <input
                type="text"
                value={formData.case_type}
                onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                onFocus={() => setFocusedField('case_type')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g., Criminal Defense, Civil Litigation"
                className={`w-full px-6 py-5 rounded-2xl focus:outline-none transition-all duration-300 ${
                  focusedField === 'case_type' 
                    ? 'ring-4 ring-purple-500/30' 
                    : ''
                } text-white placeholder-white/30`}
                style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(139, 92, 246, 0.1)',
                }}
                required
              />
            </div>

            {/* Case Facts */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 dark:text-white/90 light:text-gray-800">
                <div className="rounded-xl p-2.5 dark:border-purple-500/30 light:border-purple-600/40" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 dark:text-purple-400 light:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                Case Facts
              </label>
              <textarea
                value={formData.facts}
                onChange={(e) => setFormData({ ...formData, facts: e.target.value })}
                onFocus={() => setFocusedField('facts')}
                onBlur={() => setFocusedField(null)}
                placeholder="Provide a detailed description of the case facts..."
                rows={6}
                className={`w-full px-6 py-5 rounded-2xl focus:outline-none transition-all duration-300 resize-none ${
                  focusedField === 'facts' 
                    ? 'ring-4 ring-purple-500/30' 
                    : ''
                } text-white placeholder-white/30`}
                style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(139, 92, 246, 0.1)',
                }}
                required
              />
            </div>

            {/* Charges */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 dark:text-white/90 light:text-gray-800">
                <div className="rounded-xl p-2.5 dark:border-purple-500/30 light:border-purple-600/40" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 dark:text-purple-400 light:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                Charges or Claims
              </label>
              <textarea
                value={formData.charges}
                onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                onFocus={() => setFocusedField('charges')}
                onBlur={() => setFocusedField(null)}
                placeholder="Specify the charges, claims, or legal issues..."
                rows={5}
                className={`w-full px-6 py-5 rounded-2xl focus:outline-none transition-all duration-300 resize-none ${
                  focusedField === 'charges' 
                    ? 'ring-4 ring-purple-500/30' 
                    : ''
                } text-white placeholder-white/30`}
                style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(139, 92, 246, 0.1)',
                }}
                required
              />
            </div>

            {/* Evidence */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 dark:text-white/90 light:text-gray-800">
                <div className="rounded-xl p-2.5 dark:border-purple-500/30 light:border-purple-600/40" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 dark:text-purple-400 light:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                Evidence (Optional)
              </label>
              <textarea
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                onFocus={() => setFocusedField('evidence')}
                onBlur={() => setFocusedField(null)}
                placeholder="Describe any available evidence or supporting materials..."
                rows={5}
                className={`w-full px-6 py-5 rounded-2xl focus:outline-none transition-all duration-300 resize-none ${
                  focusedField === 'evidence' 
                    ? 'ring-4 ring-purple-500/30' 
                    : ''
                } text-white placeholder-white/30`}
                style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(139, 92, 246, 0.1)',
                }}
              />
            </div>

            {error && (
              <div className="rounded-2xl px-6 py-5 flex items-center gap-4 animate-scale-in" style={{
                background: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              }}>
                <svg className="w-6 h-6 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold text-red-400">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-6 rounded-2xl font-bold text-lg overflow-hidden hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(139, 92, 246, 0.2)',
                color: 'white',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3 dark:text-white light:text-gray-800">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                    Creating Courtroom...
                  </>
                ) : (
                  <>
                    <span>Start Simulation</span>
                    <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;
