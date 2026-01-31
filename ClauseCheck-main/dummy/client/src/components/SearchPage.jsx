import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="md">
        <Box className="fade-in" sx={{ textAlign: 'center' }}>
          {/* Logo/Icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' }
              }
            }}
          >
            <GavelIcon 
              sx={{ 
                fontSize: 60, 
                color: 'white'
              }} 
            />
          </Box>

          {/* Title */}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: 'white',
              fontWeight: 800,
              mb: 1,
              textShadow: '0 2px 20px rgba(0,0,0,0.2)'
            }}
          >
            India Case Search Portal
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              mb: 5,
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 400,
              textShadow: '0 1px 10px rgba(0,0,0,0.1)'
            }}
          >
            Search Indian court judgments across all jurisdictions
          </Typography>

          {/* Search Box */}
          <Paper
            elevation={12}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)',
            }}
          >
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter case name, citation, keywords, or legal topic..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError('');
                }}
                disabled={loading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    backgroundColor: 'white',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                sx={
{
                  py: 2,
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 4px 20px 0 rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 30px 0 rgba(102, 126, 234, 0.6)',
                  }
                }}
              >
                {loading ? 'Searching...' : '🔍 Search Cases'}
              </Button>
            </form>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mt: 3 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Examples */}
            <Box sx={{ mt: 4, textAlign: 'left' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                Example searches:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  'fundamental rights',
                  'cyber crime',
                  'land dispute',
                  'consumer protection'
                ].map((example) => (
                  <Button
                    key={example}
                    size="small"
                    variant="outlined"
                    onClick={() => setQuery(example)}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 5,
                      fontSize: '0.85rem',
                      borderWidth: 2,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                      }
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Upload Document Button */}
          <Box sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={onNavigateToUpload}
              fullWidth
              sx={{ 
                py: 1.8,
                fontSize: '1.05rem',
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                background: 'rgba(102, 126, 234, 0.05)',
                transition: 'all 0.3s',
                '&:hover': {
                  borderWidth: 2,
                  background: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              📄 Upload & Summarize Your Own Document
            </Button>
          </Box>

          {/* Footer note */}
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 4,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              textShadow: '0 1px 5px rgba(0,0,0,0.1)'
            }}
          >
            ⚡ Powered by Indian Kanoon API & OpenRouter AI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchPage;
