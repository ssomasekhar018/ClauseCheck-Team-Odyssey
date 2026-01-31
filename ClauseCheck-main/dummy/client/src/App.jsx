import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import DocumentViewer from './components/DocumentViewer';
import UploadPage from './components/UploadPage';

// Professional blue and white theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Professional blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#0288d1',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Global navbar to jump between all three tools */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          background: '#0d47a1',
          color: '#fff',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ fontWeight: 700 }}>Legal Tech Suite</span>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          <a href="http://localhost:8080" style={{ color: '#fff', textDecoration: 'none' }}>
            Home
          </a>
          <a href="http://localhost:5175" style={{ color: '#fff', textDecoration: 'none' }}>
            AI Contract Analysis
          </a>
          <a href="http://localhost:5174" style={{ color: '#fff', textDecoration: 'none' }}>
            Courtroom Simulation
          </a>
          <a href="http://localhost:3000" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
            Case File Library
          </a>
        </nav>
      </header>
      {showUploadPage ? (
        <UploadPage onBack={handleBackFromUpload} />
      ) : selectedDocument ? (
        <DocumentViewer 
          caseItem={selectedDocument}
          onBack={handleBackToResults}
        />
      ) : !searchResults ? (
        <SearchPage 
          onSearch={handleSearch}
          onNavigateToUpload={handleNavigateToUpload}
        />
      ) : (
        <ResultsPage 
          results={searchResults} 
          query={searchQuery}
          onBackToSearch={handleBackToSearch}
          onViewDocument={handleViewDocument}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
