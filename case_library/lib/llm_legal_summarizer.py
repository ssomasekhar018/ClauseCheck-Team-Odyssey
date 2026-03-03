import sys
import os
import json
import pdfplumber
import spacy
import requests
from dotenv import load_dotenv

# Set stdout to UTF-8 to avoid encoding errors in Node.js
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# PDF TEXT EXTRACTION
# ============================================================
print("DEBUG: USING UPDATED PYTHON SUMMARIZER (max_tokens=900)", file=sys.stderr)

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# ============================================================
# TEXT TRIMMING (TOKEN SAFETY)
# ============================================================

def trim_text(text, max_chars=4000):
    if len(text) > max_chars:
        return text[:max_chars]
    return text

# ============================================================
# ENTITY EXTRACTION
# ============================================================

def extract_entities(text, nlp):
    doc = nlp(text)

    persons = set()
    organizations = set()
    courts = set()
    dates = set()

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            persons.add(ent.text)

        elif ent.label_ == "ORG":
            organizations.add(ent.text)
            if "court" in ent.text.lower():
                courts.add(ent.text)

        elif ent.label_ == "DATE":
            dates.add(ent.text)

    return {
        "persons": list(persons),
        "organizations": list(organizations),
        "courts": list(courts),
        "dates": list(dates)
    }

# ============================================================
# PROMPT BUILDER (FULL VERSION – SAME AS YOURS)
# ============================================================

def build_prompt(text, entities):
    prompt = f"""You are a legal assistant. Analyze the following legal document and generate a structured summary in this format:

LEGAL CASE SUMMARY
============================================================

**CASE INFORMATION:**
- Case Name: [Extract if possible]
- Case Number: [Extract if possible]
- Court: {', '.join(entities['courts']) or '[Extract if possible]'}
- Date Filed: {entities['dates'][0] if entities['dates'] else '[Extract if possible]'}
- Current Status: [Extract if possible]

**PARTIES:**
- Persons Involved: {', '.join(entities['persons']) or '[Extract if possible]'}
- Organizations Involved: {', '.join(entities['organizations']) or '[Extract if possible]'}
- Plaintiff's Counsel: [Extract if possible]
- Defendant's Counsel: [Extract if possible]

**CASE TYPE:**
- Legal Area: [Extract if possible]
- Specific Claims: [Extract if possible]

**SUMMARY OF FACTS:**
[Extract if possible]

**EVIDENCE:**
- Documentary Evidence: [Extract if possible]
- Witness Testimony: [Extract if possible]
- Physical Evidence: [Extract if possible]
- Expert Testimony: [Extract if possible]

**LEGAL ARGUMENTS:**
- Plaintiff's Arguments: [Extract if possible]
- Defendant's Arguments: [Extract if possible]

**KEY ISSUES:**
[Extract if possible]

**PROCEDURAL HISTORY:**
[Extract if possible]

**VERDICT / DECISION:**
[Extract if possible]

**IMPORTANT DATES:**
[Extract if possible]

**NOTABLE POINTS:**
[Extract if possible]

Document:
{text}
"""
    return prompt

# ============================================================
# LLM API CALL (OpenRouter or OpenAI)
# ============================================================

def call_llm_api(prompt, api_key, provider="openrouter", model=None):
    if provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        model = model or "gpt-4o-mini" # Default to gpt-4o-mini for OpenAI
    else:
        url = "https://openrouter.ai/api/v1/chat/completions"
        model = model or "mistralai/mistral-7b-instruct" # Default for OpenRouter

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    if provider == "openrouter":
        headers["HTTP-Referer"] = "http://localhost"
        headers["X-Title"] = "Legal Document Summarizer"

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1000,
        "temperature": 0.2
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            error_msg = f"API Error ({response.status_code}): {response.text}"
            print(error_msg, file=sys.stderr)
            return f"Summary could not be generated. {error_msg}"

        data = response.json()
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
        else:
            return "Summary could not be generated. Invalid response format."
            
    except Exception as e:
        print(f"Request failed: {str(e)}", file=sys.stderr)
        return f"Summary could not be generated. Error: {str(e)}"


# ============================================================
# MAIN FUNCTION
# ============================================================

def main():
    # Load from current directory and parent directories
    load_dotenv()
    
    # Also try to load from sibling project directories if not found
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../../"))
    
    possible_env_paths = [
        os.path.join(project_root, ".env"),
        os.path.join(project_root, "law-de/backend/.env"),
        os.path.join(project_root, "ai-contract-analysis-system/.env"),
        os.path.join(current_dir, "../server/.env")
    ]
    
    for env_path in possible_env_paths:
        if os.path.exists(env_path):
            load_dotenv(env_path)
            
    # Try OpenRouter first
    api_key = os.getenv("OPENROUTER_API_KEY")
    provider = "openrouter"
    model = os.getenv("LLM_MODEL")

    # Fallback to OpenAI if OpenRouter key is missing
    if not api_key:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            if api_key.startswith("sk-or-"):
                provider = "openrouter"
            else:
                provider = "openai"
        
    if not api_key:
        print("Error: neither OPENROUTER_API_KEY nor OPENAI_API_KEY found in environment.", file=sys.stderr)
        # Don't exit, return error message as summary to be helpful
        print("Error: API Key missing. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in .env file.")
        sys.exit(1)

    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception as e:
        print(f"Error loading spacy model: {e}", file=sys.stderr)
        sys.exit(1)

    # Read input
    text = ""
    if len(sys.argv) > 1 and sys.argv[1].lower().endswith(".pdf"):
        text = extract_text_from_pdf(sys.argv[1])
    else:
        # Read from stdin safely
        try:
            # Use specific encoding for stdin to avoid charmap errors on Windows
            if sys.stdin.encoding != 'utf-8':
                 sys.stdin.reconfigure(encoding='utf-8')
            text = sys.stdin.read()
        except Exception as e:
            print(f"Error reading input: {e}", file=sys.stderr)
            sys.exit(1)

    if not text.strip():
        print("Error: Empty document text provided.")
        return

    # Safety trimming BEFORE NLP + API
    text = trim_text(text, max_chars=12000) # Increased limit for better context

    # Entity extraction
    entities = extract_entities(text, nlp)

    # Prompt building
    prompt = build_prompt(text, entities)

    # LLM call
    summary = call_llm_api(prompt, api_key, provider, model)

    # Output
    print(summary)

# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
