import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

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
      if (file.size > 50 * 1024 * 1024) {
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

      const response = await axios.post('/api/summarize-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutes timeout
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="md">
        {/* Back Button */}
        {onBack && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mb: 3, textTransform: 'none' }}
          >
            Back to Search
          </Button>
        )}

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SummarizeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Legal Document Summarizer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your legal PDF documents for AI-powered summarization
          </Typography>
        </Box>

        {/* Upload Card */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Upload PDF Document
          </Typography>

          {/* File Input */}
          <Box
            sx={{
              border: '2px dashed',
              borderColor: selectedFile ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              mb: 3,
              backgroundColor: selectedFile ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.05)'
              }
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <Box>
                <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF files only (Max 50MB)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
            startIcon={uploading ? <CircularProgress size={20} /> : <SummarizeIcon />}
            sx={{ py: 1.5, textTransform: 'none', fontSize: '1.1rem' }}
          >
            {uploading ? 'Processing Document...' : 'Generate Summary'}
          </Button>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                This may take a few minutes depending on document length...
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Summary Display */}
        {summary && (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              📝 Document Summary
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f8f9fa',
                p: 3,
                borderRadius: 1,
                borderLeft: '4px solid #1976d2'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  fontFamily: 'monospace'
                }}
              >
                {summary}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Info Card */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Supported formats:</strong> PDF documents with selectable text
            <br />
            <strong>Note:</strong> Scanned PDFs (images) are not currently supported
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
};

export default UploadPage;
