# Legal Document Summarizer

A Python application that extracts text from legal case PDF documents and generates structured summaries using AI via the OpenRouter API.

## Features

- 📄 Extract text from PDF legal documents
- 🤖 AI-powered analysis using OpenRouter API
- 📊 Structured output with key case information:
  - Case Information (name, number, court, dates)
  - Parties (plaintiffs, defendants, counsel)
  - Case Type and Claims
  - Summary of Facts
  - Evidence (documentary, witness, physical, expert)
  - Legal Arguments
  - Key Issues
  - Procedural History
  - Verdict/Current Status
  - Important Dates
  - Notable Points
- 💾 Automatic saving of summaries to text files

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up your OpenRouter API key:**
   - Get your API key from [OpenRouter](https://openrouter.ai/keys)
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Edit `.env` and add your API key:
     ```
     OPENROUTER_API_KEY=your_actual_api_key_here
     ```

## Usage

### Basic Usage

```bash
python summarize_legal_doc.py <path_to_pdf>
```

**Example:**
```bash
python summarize_legal_doc.py case_document.pdf
```

### Specify a Different Model

You can optionally specify which AI model to use:

```bash
python summarize_legal_doc.py case_document.pdf anthropic/claude-3-opus
```

**Popular model options:**
- `anthropic/claude-3.5-sonnet` (default, balanced)
- `anthropic/claude-3-opus` (most capable)
- `openai/gpt-4-turbo`
- `google/gemini-pro-1.5`

See [OpenRouter models](https://openrouter.ai/models) for full list.

## Output

The application will:
1. Extract text from the PDF
2. Send it to OpenRouter API for analysis
3. Display the structured summary in the console
4. Save the summary to `<original_filename>_summary.txt`

### Example Output Structure

```
LEGAL CASE SUMMARY
============================================================

**CASE INFORMATION:**
- Case Name: Smith v. Johnson Corp.
- Case Number: 2023-CV-12345
- Court: Superior Court of California
- Date Filed: January 15, 2023
- Current Status: Pending

**PARTIES:**
- Plaintiff(s): John Smith
- Defendant(s): Johnson Corporation
- Plaintiff's Counsel: Jane Doe, Esq. (Doe & Associates)
- Defendant's Counsel: Robert Brown, Esq. (Brown Legal Group)

**CASE TYPE:**
- Legal Area: Civil - Employment Law
- Specific Claims/Charges: Wrongful Termination, Discrimination

[... continues with all sections ...]
```

## Project Structure

```
law-document-summarizer/
├── summarize_legal_doc.py    # Main application script
├── pdf_extractor.py           # PDF text extraction module
├── openrouter_client.py       # OpenRouter API integration
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── .env                      # Your API key (create this, not in git)
└── README.md                 # This file
```

## Requirements

- Python 3.7+
- pdfplumber (PDF text extraction)
- requests (API calls)
- python-dotenv (environment variables)
- OpenRouter API key

## Notes

- The application uses Claude 3.5 Sonnet by default for optimal balance of speed and quality
- Ensure your PDF contains selectable text (not scanned images)
- For scanned PDFs, you'll need to add OCR preprocessing
- API costs depend on document length and model used
- Summary quality depends on the completeness of the source document

## Troubleshooting

**"No text could be extracted from the PDF"**
- Your PDF might be a scanned image. You'll need OCR (Optical Character Recognition)

**"OPENROUTER_API_KEY not found"**
- Make sure you created a `.env` file with your API key

**API errors**
- Check your API key is valid
- Ensure you have credits on your OpenRouter account
- Very large documents may need chunking (not yet implemented)

## Future Enhancements

- [ ] OCR support for scanned documents
- [ ] Multi-document batch processing
- [ ] PDF/HTML output formatting
- [ ] Document chunking for very large files
- [ ] Cost estimation before processing
- [ ] Web interface

## License

MIT License - feel free to use and modify for your needs.
