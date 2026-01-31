"""
OpenRouter API Client Module
Handles communication with OpenRouter API for legal document summarization.
"""

import requests
import json


class OpenRouterClient:
    """Client for interacting with OpenRouter API."""
    
    def __init__(self, api_key):
        """
        Initialize OpenRouter client.
        
        Args:
            api_key (str): OpenRouter API key
        """
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        
    def summarize_legal_document(self, document_text, model="anthropic/claude-3.5-sonnet"):
        """
        Summarize a legal document using OpenRouter API.
        
        Args:
            document_text (str): The extracted text from the legal document
            model (str): The model to use for summarization
            
        Returns:
            str: Structured summary of the legal case
            
        Raises:
            Exception: If API call fails
        """
        template = """Please analyze the following legal document and provide a structured summary in this exact format:

LEGAL CASE SUMMARY
============================================================

**CASE INFORMATION:**
- Case Name: [Name of the case]
- Case Number: [Case number if available]
- Court: [Name of the court]
- Date Filed: [Filing date if available]
- Current Status: [Current status of the case]

**PARTIES:**
- Plaintiff(s): [List all plaintiffs]
- Defendant(s): [List all defendants]
- Plaintiff's Counsel: [Names if available]
- Defendant's Counsel: [Names if available]

**CASE TYPE:**
- Legal Area: [Area of law]
- Specific Claims: [Type of petition/suit/claims]

**SUMMARY OF FACTS:**
[Brief summary of the key facts]

**EVIDENCE:**
- Documentary Evidence: [List key documents]
- Witness Testimony: [Key witness information if any]
- Physical Evidence: [Description if any]
- Expert Testimony: [Expert witness information if any]

**LEGAL ARGUMENTS:**
- Plaintiff's Arguments: [Main arguments]
- Defendant's Arguments: [Main arguments]

**KEY ISSUES:**
[List the main legal issues]

**PROCEDURAL HISTORY:**
[List significant procedural events]

**VERDICT/DECISION:**
[Summary of the court's decision]

**IMPORTANT DATES:**
[List key dates and corresponding events]

**NOTABLE POINTS:**
[Any other significant points]

Document to analyze:
{text}
"""
        prompt = template.format(text=document_text)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            
            result = response.json()
            summary = result["choices"][0]["message"]["content"]
            return summary
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"OpenRouter API error: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Unexpected API response format: {str(e)}")
    
    def _create_legal_summary_prompt(self, document_text):
        """
        Create a structured prompt for legal document summarization.
        
        Args:
            document_text (str): The legal document text
            
        Returns:
            str: Formatted prompt
        """
        return f"""You are an expert legal analyst. Analyze the following legal case document and provide a comprehensive structured summary that a lawyer can quickly understand.

Extract and organize the information into the following categories:

**CASE INFORMATION:**
- Case Name:
- Case Number:
- Court:
- Date Filed:
- Current Status:

**PARTIES:**
- Plaintiff(s):
- Defendant(s):
- Plaintiff's Counsel:
- Defendant's Counsel:

**CASE TYPE:**
- Legal Area (e.g., Criminal, Civil, Corporate, Family Law, etc.):
- Specific Claims/Charges:

**SUMMARY OF FACTS:**
[Provide a concise summary of the key facts]

**EVIDENCE:**
- Documentary Evidence:
- Witness Testimony:
- Physical Evidence:
- Expert Testimony:

**LEGAL ARGUMENTS:**
- Plaintiff's Arguments:
- Defendant's Arguments:

**KEY ISSUES:**
[List the main legal questions or issues]

**PROCEDURAL HISTORY:**
[Brief timeline of court proceedings]

**VERDICT/DECISION/CURRENT STATUS:**
[Outcome if available, or current stage]

**IMPORTANT DATES:**
[List crucial dates]

**NOTABLE POINTS:**
[Any other important information for lawyer review]

---

LEGAL DOCUMENT TEXT:
{document_text}

---

Please provide the structured summary above. If any information is not available in the document, mark it as "Not specified in document"."""
