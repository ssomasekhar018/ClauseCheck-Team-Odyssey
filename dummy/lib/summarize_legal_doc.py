"""
Legal Document Summarizer
Main application script for summarizing legal case PDF documents.
"""

import os
import sys
from dotenv import load_dotenv
from pdf_extractor import extract_text_from_pdf
from openrouter_client import OpenRouterClient


def main():
    """Main function to run the legal document summarizer."""
    
    # Load environment variables
    load_dotenv()
    
    # Get API key from environment
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY not found in environment variables.")
        print("Please create a .env file with your API key or set it as an environment variable.")
        sys.exit(1)
    
    # Get PDF path from command line argument
    if len(sys.argv) < 2:
        print("Usage: python summarize_legal_doc.py <path_to_pdf>")
        print("Example: python summarize_legal_doc.py case_document.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Optional: specify model as second argument
    model = sys.argv[2] if len(sys.argv) > 2 else "anthropic/claude-3.5-sonnet"
    
    print(f"Processing legal document: {pdf_path}")
    print("-" * 60)
    
    try:
        # Step 1: Extract text from PDF
        print("Step 1: Extracting text from PDF...")
        document_text = extract_text_from_pdf(pdf_path)
        print(f"✓ Extracted {len(document_text)} characters from PDF")
        
        # Step 2: Summarize using OpenRouter API
        print(f"\nStep 2: Analyzing document with {model}...")
        client = OpenRouterClient(api_key)
        summary = client.summarize_legal_document(document_text, model)
        
        print("\n" + "=" * 60)
        print("LEGAL CASE SUMMARY")
        print("=" * 60 + "\n")
        print(summary)
        print("\n" + "=" * 60)
        
        # Step 3: Save summary to file
        output_filename = os.path.splitext(pdf_path)[0] + "_summary.txt"
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write("LEGAL CASE SUMMARY\n")
            f.write("=" * 60 + "\n\n")
            f.write(summary)
        
        print(f"\n✓ Summary saved to: {output_filename}")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
