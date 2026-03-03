import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import DocumentViewer from './components/DocumentViewer';
import UploadPage from './components/UploadPage';

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadPage, setShowUploadPage] = useState(false);

  const handleSearch = (query, results) => {
    setSearchQuery(query);
    setSearchResults(results);
    setSelectedDocument(null);
  };

  const handleBackToSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
    setSelectedDocument(null);
  };

  const handleViewDocument = (caseItem) => {
    setSelectedDocument(caseItem);
  };

  const handleBackToResults = () => {
    setSelectedDocument(null);
  };

  const handleNavigateToUpload = () => {
    setShowUploadPage(true);
  };

  const handleBackFromUpload = () => {
    setShowUploadPage(false);
  };

  return (
    <div className="min-h-screen bg-bgDark text-slate-200 font-sans selection:bg-primary/30 relative">
      <div className="background-animate" />
      <div className="particles" />
      <Navbar />
      
      {showUploadPage ? (
        <UploadPage onBack={handleBackFromUpload} />
      ) : selectedDocument ? (
        <DocumentViewer document={selectedDocument} onBack={handleBackToResults} />
      ) : searchResults ? (
        <ResultsPage 
          results={searchResults} 
          query={searchQuery} 
          onBack={handleBackToSearch}
          onViewDocument={handleViewDocument}
        />
      ) : (
        <SearchPage 
          onSearch={handleSearch} 
          onNavigateToUpload={handleNavigateToUpload}
        />
      )}
    </div>
  );
}

export default App;
