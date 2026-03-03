import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Scale, Upload, AlertCircle, Loader2, Library } from 'lucide-react';
import axios from 'axios';
import { GlassCard } from './GlassCard';

const SearchPage = ({ onSearch, onNavigateToUpload }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/search', {
        params: { query: query.trim() }
      });

      onSearch(query, response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError(
        err.response?.data?.error || 
        'Failed to search cases. Please check your API configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow relative">
             <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
             <Library size={48} className="text-white relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
            Legal Intelligence Database
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Search 10,000+ indexed cases with AI-powered summaries and citation analysis.
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-slate-200"
                placeholder="Search by case name, citation, or keywords (e.g., 'contract breach')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
               {['Supreme Court', 'High Court', 'Criminal', 'Civil', 'Recent Judgments'].map((filter) => (
                 <button 
                   key={filter}
                   type="button"
                   onClick={() => setQuery(filter)}
                   className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 hover:text-white transition-colors"
                 >
                   {filter}
                 </button>
               ))}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                {loading ? 'Searching Database...' : 'Search Cases'}
              </button>
              
              <button
                type="button"
                onClick={onNavigateToUpload}
                className="px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-slate-300 font-medium"
                title="Upload & Summarize Document"
              >
                <Upload size={20} />
              </button>
            </div>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
        </GlassCard>

        <div className="mt-8 flex justify-center gap-8 text-slate-500 text-sm">
           <div className="flex flex-col items-center">
              <span className="font-bold text-white text-lg">10,842</span>
              <span>Cases Indexed</span>
           </div>
           <div className="w-px bg-slate-800 h-12"></div>
           <div className="flex flex-col items-center">
              <span className="font-bold text-green-400 text-lg">98%</span>
              <span>Uptime</span>
           </div>
           <div className="w-px bg-slate-800 h-12"></div>
           <div className="flex flex-col items-center">
              <span className="font-bold text-secondary text-lg">Active</span>
              <span>AI Engine</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchPage;
