import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GavelIcon from '@mui/icons-material/Gavel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from 'axios';

const DocumentViewer = ({ caseItem, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentData, setDocumentData] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [caseItem.docId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/doc/${caseItem.docId}`);
      setDocumentData(response.data);
    } catch (err) {
      console.error('Failed to fetch document:', err);
      setError('Failed to load document content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOriginal = () => {
    window.open(caseItem.url, '_blank', 'noopener,noreferrer');
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      setSummary('');
      
      // Extract text from document data
      const documentText = documentData?.doc?.doc || documentData?.doc?.content || documentData?.doc || documentData?.content || documentData?.text || '';
      
      if (!documentText) {
        setError('No document text available to summarize');
        return;
      }

      // Split text into chunks if it's too large (max 1MB per chunk)
      const maxChunkSize = 1024 * 1024; // 1MB
      let textToSend = documentText;
      
      if (documentText.length > maxChunkSize) {
        // Take first 1MB of text for summarization
        textToSend = documentText.slice(0, maxChunkSize);
        console.log('Document text truncated for summarization due to size constraints');
      }

      const response = await axios.post('/api/summarize', {
        docId: caseItem.docId,
        documentText: textToSend
      }, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.error('Summarize error:', err);
      setError('Failed to summarize document. Please try again.');
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Loading document...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mb: 3 }}
          >
            Back to Results
          </Button>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchDocument}>
            Retry
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header with Actions */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ 
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Back to Results
            </Button>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={summarizing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleSummarize}
                disabled={summarizing}
                sx={{
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  color: 'white',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
                    boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              >
                {summarizing ? 'Analyzing with AI...' : '✨ Summarize with AI'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<OpenInNewIcon />}
                onClick={handleViewOriginal}
                sx={{
                  borderColor: 'white',
                  borderWidth: 2,
                  color: 'white',
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)'
                  }
                }}
              >
                View on Indian Kanoon
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GavelIcon sx={{ fontSize: 40 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {caseItem.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {caseItem.court && (
                  <Chip 
                    label={caseItem.court} 
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
                {caseItem.date && (
                  <Chip 
                    label={caseItem.date} 
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
                {caseItem.cite && (
                  <Chip 
                    label={caseItem.cite} 
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Document Content */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          {/* Document metadata */}
          {(documentData?.doc || documentData) && (
            <Box sx={{ mb: 4 }}>
              {(documentData?.doc?.author || documentData?.author) && (
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  <strong>Judge:</strong> {documentData?.doc?.author || documentData?.author}
                </Typography>
              )}
              {(documentData?.doc?.bench || documentData?.bench) && (
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  <strong>Bench:</strong> {documentData?.doc?.bench || documentData?.bench}
                </Typography>
              )}
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          {/* Summary Section */}
          {summary && (
            <>
              <Box
                className="fade-in"
                sx={{
                  animation: 'fadeIn 0.8s ease-in-out',
                  mb: 4
                }}
              >
                <Paper 
                  elevation={4}
                  sx={{ 
                    p: 4, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #FE6B8B, #FF8E53, #FE6B8B)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s infinite'
                    },
                    '@keyframes shimmer': {
                      '0%': { backgroundPosition: '200% 0' },
                      '100%': { backgroundPosition: '-200% 0' }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 32, mr: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      AI-Generated Summary
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      p: 3,
                      maxHeight: '500px',
                      overflow: 'auto',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography 
                      variant="body1"
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.9,
                        color: 'text.primary',
                        fontSize: '1.05rem'
                      }}
                    >
                      {summary}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              <Divider sx={{ my: 4 }} />
            </>
          )}

          {summarizing && (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Generating AI summary... This may take a moment.
              </Typography>
            </Box>
          )}

          {/* Judgment Text */}
          <Box 
            sx={{ 
              '& p': { mb: 2, lineHeight: 1.8, textAlign: 'justify' },
              '& h1, & h2, & h3': { mt: 3, mb: 2, color: 'primary.main' },
              '& blockquote': { 
                borderLeft: '4px solid #1976d2', 
                pl: 2, 
                ml: 2, 
                fontStyle: 'italic',
                color: 'text.secondary'
              },
              '& pre': {
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                overflow: 'auto'
              }
            }}
            dangerouslySetInnerHTML={{ 
              __html: documentData?.doc?.doc || documentData?.doc?.content || documentData?.doc || documentData?.content || documentData?.text || '<p>No content available</p>' 
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default DocumentViewer;
