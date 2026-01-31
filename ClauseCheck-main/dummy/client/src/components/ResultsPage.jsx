import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ResultsPage = ({ results, query, onBackToSearch, onViewDocument }) => {
  const { count, results: cases } = results;

  const handleViewJudgment = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPDF = (pdfUrl, title) => {
    // Open PDF in new tab for download
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBackToSearch}
              sx={{ 
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              New Search
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GavelIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Search Results
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Query: "{query}"
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${count} ${count === 1 ? 'result' : 'results'} found`}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
        </Paper>

        {/* Results */}
        {count === 0 ? (
          <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No cases found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try different keywords or a broader search term
            </Typography>
            <Button 
              variant="contained" 
              onClick={onBackToSearch}
              sx={{ textTransform: 'none' }}
            >
              Try Another Search
            </Button>
          </Paper>
        ) : (
          <Box className="fade-in">
            {cases.map((caseItem, index) => (
              <Card
                key={caseItem.id}
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                    borderColor: 'primary.main',
                  },
                  animation: `fadeIn 0.5s ease-in-out ${index * 0.08}s both`,
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Case Title */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <DescriptionIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 1.5,
                          color: 'text.primary',
                          fontWeight: 600,
                          lineHeight: 1.4
                        }}
                      >
                        {caseItem.title}
                      </Typography>

                      {/* Metadata */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {caseItem.court && (
                          <Chip 
                            label={caseItem.court} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {caseItem.date && (
                          <Chip 
                            label={caseItem.date} 
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {caseItem.cite && (
                          <Chip 
                            label={caseItem.cite} 
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {caseItem.author && (
                          <Chip 
                            label={`Judge: ${caseItem.author}`} 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {/* Read Judgment in App */}
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<VisibilityIcon />}
                    onClick={() => onViewDocument(caseItem)}
                    sx={{
                      textTransform: 'none',
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      boxShadow: '0 3px 12px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)',
                      }
                    }}
                  >
                    📖 Read Judgment
                  </Button>

                  {/* Open in Indian Kanoon */}
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => handleViewJudgment(caseItem.url)}
                    sx={{
                      textTransform: 'none',
                      px: 3,
                      py: 1.2,
                      borderWidth: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    View Original
                  </Button>
                </CardActions>
              </Card>
            ))}

            {/* Info Note */}
            <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> PDF downloads are only available for cases where court copies exist. 
                If the Download button is not visible, the court copy may not be available for that judgment.
              </Typography>
            </Alert>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ResultsPage;
