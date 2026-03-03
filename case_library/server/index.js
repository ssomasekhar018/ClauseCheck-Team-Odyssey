import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to port 5001
const API_TOKEN = process.env.INDIAN_KANOON_API_TOKEN?.trim();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const upload = multer({ 
  dest: path.join(__dirname, '../lib/uploads/'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, '../lib/uploads'))) {
  fs.mkdirSync(path.join(__dirname, '../lib/uploads'), { recursive: true });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'India Case Search API is running' });
});

// Get full document content
app.get('/api/doc/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    if (!API_TOKEN) {
      return res.status(500).json({ 
        error: 'API token not configured' 
      });
    }

    const apiUrl = `https://api.indiankanoon.org/doc/${docId}/`;
    console.log(`Fetching document: ${docId}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Token ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Document API Error ${response.status}:`, errorText);
      throw new Error(`Failed to fetch document: ${response.status}`);
    }

    const data = await response.json();
    console.log('Document fetched successfully:', docId);
    console.log('Document keys:', Object.keys(data));
    res.json(data);

  } catch (error) {
    console.error('Document API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch document',
      message: error.message 
    });
  }
});

// Download PDF endpoint
app.get('/api/download/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    if (!API_TOKEN) {
      return res.status(500).json({ 
        error: 'API token not configured' 
      });
    }

    const apiUrl = `https://api.indiankanoon.org/origdoc/${docId}/`;
    console.log(`Downloading PDF: ${docId}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Token ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PDF Download Error ${response.status}:`, errorText);
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    // Forward the PDF to client
    const contentType = response.headers.get('content-type') || 'application/pdf';
    const contentDisposition = `attachment; filename="case-${docId}.pdf"`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    
    response.body.pipe(res);

  } catch (error) {
    console.error('Download API Error:', error);
    res.status(500).json({ 
      error: 'Failed to download PDF',
      message: error.message 
    });
  }
});

// Summarize document from Indian Kanoon
app.post('/api/summarize', async (req, res) => {
  try {
    const { docId, text } = req.body; // Changed 'documentText' to 'text' to match frontend

    if (!text) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    console.log(`Summarizing document: ${docId || 'uploaded'}`);

    const summary = await callLLMLegalSummarizer({ text: text });
    
    res.json({ summary });

  } catch (error) {
    console.error('Summarize API Error:', error);
    // Include the actual error message (which contains python stderr)
    res.status(500).json({ 
      error: 'Failed to summarize document',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Upload and summarize external PDF
app.post('/api/summarize-upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`Processing uploaded file: ${req.file.originalname}`);

    const filePath = req.file.path;
    
    // Run Python summarizer on the uploaded PDF
  const summary = await callLLMLegalSummarizer({ pdfPath: filePath });
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({ summary });

  } catch (error) {
    console.error('Upload Summarize Error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Failed to process uploaded document',
      message: error.message 
    });
  }
});

// Helper function to call Python summarizer with document text
const callLLMLegalSummarizer = ({ text, pdfPath }) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../lib/llm_legal_summarizer.py');
    
    // Determine arguments
    let args = [pythonScript];
    if (pdfPath) {
      args.push(pdfPath);
    }

    console.log(`Executing Python script: ${pythonScript}`);
    if (pdfPath) console.log(`With PDF: ${pdfPath}`);

    // Spawn Python process
    const pythonProcess = spawn('python', args, {
      env: { 
        ...process.env, 
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1'
      }
    });

    let outputData = '';
    let errorData = '';

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`Python Stderr: ${data}`);
    });

    // Handle process close
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        reject(new Error(`Summarization failed (Exit Code ${code}): ${errorData}`));
      } else {
        resolve(outputData.trim());
      }
    });

    // Handle spawn errors
    pythonProcess.on('error', (err) => {
      console.error('Failed to start python process:', err);
      reject(new Error(`Failed to start python process: ${err.message}`));
    });

    // If text is provided, write to stdin
    if (text && !pdfPath) {
      try {
        pythonProcess.stdin.write(text);
        pythonProcess.stdin.end();
      } catch (err) {
        console.error('Error writing to stdin:', err);
        reject(new Error('Failed to write text to summarizer'));
      }
    }
  });
};


// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query, pagenum = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!API_TOKEN) {
      return res.status(500).json({ 
        error: 'API token not configured. Please set INDIAN_KANOON_API_TOKEN in .env file' 
      });
    }

    // Construct Indian Kanoon API URL
    const apiUrl = `https://api.indiankanoon.org/search/`;

    console.log(`Searching for: ${query}`);

    // Call Indian Kanoon API with POST method
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Token ${API_TOKEN}`
      },
      body: `formInput=${encodeURIComponent(query)}&pagenum=${pagenum}`
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      
      if (response.status === 403 || response.status === 401) {
        return res.status(403).json({ 
          error: 'Authentication failed. Please check your API token is valid and active.',
          details: 'Visit https://indiankanoon.org/account/ to verify your token'
        });
      }
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Parse and format the results
    const formattedResults = parseSearchResults(data);

    res.json({
      query,
      pagenum: parseInt(pagenum),
      count: formattedResults.length,
      results: formattedResults
    });

  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch search results',
      message: error.message 
    });
  }
});

// Helper function to parse Indian Kanoon API response
function parseSearchResults(data) {
  if (!data || !data.docs) {
    return [];
  }

  return data.docs.map((doc, index) => {
    const docId = doc.tid || doc.docid;
    const title = doc.title || doc.headline || 'Untitled Case';
    const url = `https://indiankanoon.org/doc/${docId}/`;
    
    // Check if PDF/court copy is available
    // Indian Kanoon provides court copies at /doc/<docid>/download/ or via origdoc API
    const hasPdf = doc.has_court_copy || false;
    const pdfUrl = hasPdf ? `https://api.indiankanoon.org/origdoc/${docId}/` : null;

    return {
      id: index,
      docId: docId,
      title: cleanTitle(title),
      url: url,
      pdf: pdfUrl,
      author: doc.author || null,
      court: doc.court || null,
      date: doc.date || null,
      cite: doc.cite || null
    };
  });
}

// Helper to clean HTML entities and extra whitespace from titles
function cleanTitle(title) {
  return title
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 India Case Search API running on http://localhost:${PORT}`);
  console.log(`API Token configured: ${API_TOKEN ? 'Yes ✓' : 'No ✗'}`);
});
