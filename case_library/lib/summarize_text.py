"""
Legal Document Text Summarizer
Reads document text from stdin and outputs summary.
"""

import sys
import os
from dotenv import load_dotenv
from openrouter_client import OpenRouterClient

def main():
    """Summarize document text from stdin."""
    
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY not found", file=sys.stderr)
        sys.exit(1)
    
    # Read document text from stdin
    document_text = sys.stdin.read()
    
    if not document_text.strip():
        print("Error: No document text provided", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Summarize using OpenRouter
        client = OpenRouterClient(api_key)
        summary = client.summarize_legal_document(document_text)
        print(summary)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
