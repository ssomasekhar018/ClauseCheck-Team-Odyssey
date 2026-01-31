import os
from typing import Dict, Optional
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class DocumentExtractorAgent:
    def __init__(self):
        """Document extractor agent powered by OpenAI (or OpenRouter via OpenAI client).
        
        Extracts case details from legal documents.
        Uses:
        - OPENAI_API_KEY from environment
        """
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        # Support both direct OpenAI and OpenRouter keys (sk-or-...)
        if api_key.startswith("sk-or-"):
            self.client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
            self.model = os.getenv("EXTRACTOR_MODEL_NAME") or "openai/gpt-4o-mini"
            logger.info("Document Extractor Agent initialized with OpenRouter (%s)", self.model)
        else:
            self.client = OpenAI(api_key=api_key)
            self.model = os.getenv("EXTRACTOR_MODEL_NAME") or "gpt-4o-mini"
            logger.info("Document Extractor Agent initialized with OpenAI (%s)", self.model)

    async def extract_case_details(self, document_text: str) -> Dict[str, Optional[str]]:
        """Extract case details from document text using AI"""
        
        try:
            logger.info("Extracting case details from document...")
            
            prompt = f"""You are a legal document analyzer. Extract case details from the following legal document text.

Document Text:
{document_text}

Extract the following information and return it in a structured format:
1. Case Type: The type of case (e.g., Criminal Defense, Civil Litigation, Contract Dispute, etc.)
2. Case Facts: A detailed description of the case facts, circumstances, and events
3. Charges or Claims: The specific charges, claims, or legal issues involved
4. Evidence: Any evidence, documents, or supporting materials mentioned

If any information is not found in the document, use "Not specified" for that field.

Format your response EXACTLY as:
CASE_TYPE: [case type or "Not specified"]
FACTS: [detailed facts or "Not specified"]
CHARGES: [charges/claims or "Not specified"]
EVIDENCE: [evidence or "Not specified"]
"""

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert legal document analyzer. Extract structured case information accurately."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,  # Lower temperature for more consistent extraction
            )
            
            response_text = (completion.choices[0].message.content or "").strip()
            logger.info("Case details extracted successfully")
            
            # Parse the response
            extracted = {
                "case_type": "Not specified",
                "facts": "Not specified",
                "charges": "Not specified",
                "evidence": "Not specified"
            }
            
            lines = response_text.split('\n')
            current_field = None
            current_value = []
            
            for line in lines:
                line = line.strip()
                if line.startswith("CASE_TYPE:"):
                    if current_field:
                        extracted[current_field] = " ".join(current_value).strip() or "Not specified"
                    current_field = "case_type"
                    current_value = [line.replace("CASE_TYPE:", "").strip()]
                elif line.startswith("FACTS:"):
                    if current_field:
                        extracted[current_field] = " ".join(current_value).strip() or "Not specified"
                    current_field = "facts"
                    current_value = [line.replace("FACTS:", "").strip()]
                elif line.startswith("CHARGES:"):
                    if current_field:
                        extracted[current_field] = " ".join(current_value).strip() or "Not specified"
                    current_field = "charges"
                    current_value = [line.replace("CHARGES:", "").strip()]
                elif line.startswith("EVIDENCE:"):
                    if current_field:
                        extracted[current_field] = " ".join(current_value).strip() or "Not specified"
                    current_field = "evidence"
                    current_value = [line.replace("EVIDENCE:", "").strip()]
                elif current_field and line:
                    current_value.append(line)
            
            # Don't forget the last field
            if current_field:
                extracted[current_field] = " ".join(current_value).strip() or "Not specified"
            
            # Clean up "Not specified" values
            for key in extracted:
                if extracted[key] == "Not specified":
                    extracted[key] = ""
            
            logger.info(f"Extracted case type: {extracted['case_type'][:50]}...")
            return extracted
            
        except Exception as e:
            logger.error(f"Error extracting case details: {str(e)}", exc_info=True)
            raise Exception(f"Failed to extract case details from document: {str(e)}")

