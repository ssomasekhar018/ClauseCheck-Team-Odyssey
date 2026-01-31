import sys
import os
import json
import pdfplumber
import spacy
import requests
from dotenv import load_dotenv

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
# OPENROUTER API CALL
# ============================================================

def call_openrouter_api(prompt, api_key, model="mistralai/mistral-7b-instruct"):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Legal Document Summarizer"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 900,
        "temperature": 0.2
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code != 200:
        return "Summary could not be generated due to API limits."

    data = response.json()
    return data["choices"][0]["message"]["content"]


# ============================================================
# MAIN FUNCTION
# ============================================================

def main():
    load_dotenv()

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY not found in environment.", file=sys.stderr)
        sys.exit(1)

    nlp = spacy.load("en_core_web_sm")

    # Read input
    if len(sys.argv) > 1 and sys.argv[1].lower().endswith(".pdf"):
        text = extract_text_from_pdf(sys.argv[1])
    else:
        text = sys.stdin.read()

    # Safety trimming BEFORE NLP + API
    text = trim_text(text, max_chars=4000)

    # Entity extraction
    entities = extract_entities(text, nlp)

    # Prompt building
    prompt = build_prompt(text, entities)

    # LLM call
    summary = call_openrouter_api(prompt, api_key)

    # Output
    print(summary)

# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
