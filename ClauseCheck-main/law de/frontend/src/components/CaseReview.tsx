import React, { useState } from 'react';
import { CaseData } from '../services/api';

interface CaseReviewProps {
  extractedData: CaseData;
  onConfirm: (data: CaseData) => void;
  onBack: () => void;
}

const CaseReview: React.FC<CaseReviewProps> = ({ extractedData, onConfirm, onBack }) => {
  const [formData, setFormData] = useState<CaseData>(extractedData);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.case_type || !formData.facts || !formData.charges) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(formData);
    } catch (error) {
      console.error('Error creating case:', error);
      // Error handling could be improved here
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
                <svg className="w-20 h-20 text-white drop-shadow-2xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 tracking-tight text-white">
            Review Case Details
          </h1>
          <p className="text-white/70 text-xl font-medium">
            Review and edit the extracted case information before starting the simulation
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
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Info Banner */}
            <div className="rounded-2xl px-6 py-4 flex items-start gap-4" style={{
              background: 'rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
            }}>
              <svg className="w-6 h-6 flex-shrink-0 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-blue-300 font-medium mb-1">Case details extracted from document</p>
                <p className="text-blue-200/70 text-sm">Please review and make any necessary edits before proceeding to the simulation.</p>
              </div>
            </div>

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
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 text-white/90">
                <div className="rounded-xl p-2.5 border-purple-500/30" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 text-white/90">
                <div className="rounded-xl p-2.5 border-purple-500/30" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 text-white/90">
                <div className="rounded-xl p-2.5 border-purple-500/30" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                }}>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-6 rounded-2xl font-bold text-lg transition-all duration-300"
                style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  color: 'white',
                }}
              >
                Back to Manual Input
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex-1 py-6 rounded-2xl font-bold text-lg overflow-hidden hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(139, 92, 246, 0.2)',
                  color: 'white',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaseReview;

