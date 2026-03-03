import sys
import pdfplumber
import re

TEMPLATE = '''LEGAL CASE SUMMARY
============================================================

**CASE INFORMATION:**
- Case Name: {case_name}
- Case Number: {case_number}
- Court: {court}
- Date Filed: {date_filed}
- Current Status: {status}

**PARTIES:**
- Plaintiff(s): {plaintiffs}
- Defendant(s): {defendants}
- Plaintiff's Counsel: {plaintiff_counsel}
- Defendant's Counsel: {defendant_counsel}

**CASE TYPE:**
- Legal Area: {legal_area}
- Specific Claims: {claims}

**SUMMARY OF FACTS:**
{facts}

**EVIDENCE:**
- Documentary Evidence: {doc_evidence}
- Witness Testimony: {witness}
- Physical Evidence: {physical}
- Expert Testimony: {expert}

**LEGAL ARGUMENTS:**
- Plaintiff's Arguments: {plaintiff_args}
- Defendant's Arguments: {defendant_args}

**KEY ISSUES:**
{issues}

**PROCEDURAL HISTORY:**
{history}

**VERDICT/DECISION:**
{verdict}

**IMPORTANT DATES:**
{dates}

**NOTABLE POINTS:**
{notable}
'''

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_section(text, section):
    # More robust regex: allow for extra spaces, case-insensitive, and section header variations
    section_variants = [
        section,
        section.replace("(s)", "s"),
        section.replace("(s)", ""),
        section.replace("'s", "s"),
        section.replace("'s", "")
    ]
    for variant in section_variants:
        pattern = re.compile(rf"^\s*{re.escape(variant)}\s*:\s*(.*?)(\n\s*[A-Z][A-Z \(\)'s]+:|$)", re.DOTALL | re.IGNORECASE | re.MULTILINE)
        match = pattern.search(text)
        if match:
            return match.group(1).strip()
    return "Not specified in document"

def summarize(text):
    # Try to extract fields using simple regex or fallback
    return TEMPLATE.format(
        case_name=extract_section(text, "Case Name"),
        case_number=extract_section(text, "Case Number"),
        court=extract_section(text, "Court"),
        date_filed=extract_section(text, "Date Filed"),
        status=extract_section(text, "Current Status"),
        plaintiffs=extract_section(text, "Plaintiff\(s\)"),
        defendants=extract_section(text, "Defendant\(s\)"),
        plaintiff_counsel=extract_section(text, "Plaintiff's Counsel"),
        defendant_counsel=extract_section(text, "Defendant's Counsel"),
        legal_area=extract_section(text, "Legal Area"),
        claims=extract_section(text, "Specific Claims"),
        facts=extract_section(text, "SUMMARY OF FACTS"),
        doc_evidence=extract_section(text, "Documentary Evidence"),
        witness=extract_section(text, "Witness Testimony"),
        physical=extract_section(text, "Physical Evidence"),
        expert=extract_section(text, "Expert Testimony"),
        plaintiff_args=extract_section(text, "Plaintiff's Arguments"),
        defendant_args=extract_section(text, "Defendant's Arguments"),
        issues=extract_section(text, "KEY ISSUES"),
        history=extract_section(text, "PROCEDURAL HISTORY"),
        verdict=extract_section(text, "VERDICT/DECISION"),
        dates=extract_section(text, "IMPORTANT DATES"),
        notable=extract_section(text, "NOTABLE POINTS")
    )

def main():
    if len(sys.argv) < 2:
        print("Usage: python custom_summarize_pdf.py <path_to_pdf>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    summary = summarize(text)
    print(summary)

if __name__ == "__main__":
    main()
