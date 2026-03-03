import sys
import os
import asyncio
from dotenv import load_dotenv

# Add current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.utils.document_parser import extract_text_from_file
from app.agents.document_extractor import DocumentExtractorAgent

async def test():
    print("Testing document extraction...")
    
    # Create a dummy text file
    with open("test_doc.txt", "w") as f:
        f.write("This is a criminal case where John Doe is accused of theft. He stole a car on Jan 1st.")
    
    try:
        # Test text extraction
        print("1. Testing text extraction...")
        text = extract_text_from_file("test_doc.txt", ".txt")
        print(f"Extracted text: {text}")
        
        # Test LLM extraction
        print("2. Testing LLM extraction...")
        agent = DocumentExtractorAgent()
        details = await agent.extract_case_details(text)
        print("Extraction result:", details)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if os.path.exists("test_doc.txt"):
            os.remove("test_doc.txt")

if __name__ == "__main__":
    asyncio.run(test())
