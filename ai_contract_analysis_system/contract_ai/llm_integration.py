from __future__ import annotations

import os
from typing import List, Optional

import requests

from .models import Clause, DocumentText, RiskAssessment


GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
# Try Pro first, fallback to Flash
GEMINI_MODEL_NAME = "gemini-1.5-pro"  # Using Pro for better accuracy
GEMINI_FLASH_MODEL = "gemini-1.5-flash"  # Fallback


class GeminiError(RuntimeError):
    """Raised when a Gemini API call fails in a non-transient way."""


def _build_base_prompt(document: DocumentText, clauses: List[Clause], risks: List[RiskAssessment]) -> str:
    """Build a comprehensive prompt context combining document, clauses and risks."""

    # Use MUCH more text - Gemini Pro can handle 1M+ tokens
    # For best results, use as much of the document as possible
    full_text = document.content
    
    # Gemini 1.5 Pro can handle ~1M tokens, which is roughly 750K characters
    # Use up to 200K chars for comprehensive analysis (leaves room for response)
    if len(full_text) <= 200000:
        preview_text = full_text  # Use full document if under 200K chars
    else:
        # For very long docs, use first 150K + last 50K (important parts often at start/end)
        preview_text = full_text[:150000] + "\n\n[... middle section omitted ...]\n\n" + full_text[-50000:]

    high_risks = [r for r in risks if r.level.name == "HIGH"]
    med_risks = [r for r in risks if r.level.name == "MEDIUM"]

    # Extract detailed clause information
    clause_details = []
    for clause in clauses[:50]:  # Top 50 clauses for context
        ctype = clause.type.name if hasattr(clause.type, 'name') else str(clause.type)
        clause_details.append(f"[{ctype}] {clause.text[:300]}")

    # Get high-risk clause details
    high_risk_details = []
    for risk in high_risks[:10]:
        clause = next((c for c in clauses if c.id == risk.clause_id), None)
        if clause:
            high_risk_details.append(f"RISK: {risk.reasons[0] if risk.reasons else 'High risk'}\nCLAUSE: {clause.text[:400]}")

    summary_lines = [
        "=== CONTRACT ANALYSIS SYSTEM ===",
        "",
        "You are an expert contract analyst AI. Your task is to provide comprehensive, accurate, and actionable analysis of legal contracts.",
        "",
        "CRITICAL INSTRUCTIONS:",
        "- Analyze the ENTIRE contract text provided below",
        "- Extract SPECIFIC details: amounts, dates, percentages, names, deadlines",
        "- Identify ALL important clauses, not just obvious ones",
        "- Look for hidden risks, one-sided terms, and unusual provisions",
        "- Be SPECIFIC: quote exact contract language when highlighting issues",
        "- Provide ACTIONABLE insights: what should the user do next?",
        "- Use professional, clear language suitable for business executives",
        "",
        "=== CONTRACT INFORMATION ===",
        f"Document Name: {document.source_name}",
        f"Total Length: {len(document.content):,} characters",
        f"Preview Length: {len(preview_text):,} characters",
        "",
        "=== FULL CONTRACT TEXT ===",
        "---START OF CONTRACT---",
        preview_text,
        "---END OF CONTRACT---",
        "",
        "=== PRELIMINARY ANALYSIS (from rule-based system) ===",
        f"Total clauses identified: {len(clauses)}",
        f"High-risk clauses flagged: {len(high_risks)}",
        f"Medium-risk clauses flagged: {len(med_risks)}",
        "",
    ]
    
    if high_risk_details:
        summary_lines.append("HIGH-RISK CLAUSES DETECTED:")
        summary_lines.extend(high_risk_details[:5])
        summary_lines.append("")

    if clause_details:
        summary_lines.append("SAMPLE IDENTIFIED CLAUSES:")
        summary_lines.extend(clause_details[:10])
        summary_lines.append("")

    return "\n".join(summary_lines)


def _call_gemini(prompt: str, api_key: str, temperature: float = 0.3, model_name: str = None) -> str:
    """Low-level HTTP call to Gemini generateContent API.

    Returns the model's text or raises GeminiError on failure.
    Tries Pro model first, falls back to Flash if Pro is unavailable.
    """

    model = model_name or GEMINI_MODEL_NAME
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    
    headers = {"Content-Type": "application/json"}
    params = {"key": api_key}
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 16384,  # Increased for longer, more detailed responses
        }
    }

    try:
        resp = requests.post(endpoint, headers=headers, params=params, json=body, timeout=60)
    except Exception as exc:  # pragma: no cover - network/runtime dependent
        raise GeminiError(f"Error calling Gemini API: {exc}") from exc

    if resp.status_code != 200:
        # If Pro model fails, try Flash as fallback
        if model == GEMINI_MODEL_NAME:
            try:
                flash_endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_FLASH_MODEL}:generateContent"
                resp = requests.post(flash_endpoint, headers=headers, params=params, json=body, timeout=60)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
            except:
                pass
        raise GeminiError(f"Gemini API returned HTTP {resp.status_code}: {resp.text}")

    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as exc:  # pragma: no cover - defensive
        raise GeminiError(f"Unexpected Gemini API response format: {data}") from exc


def generate_gemini_summary(
    document: DocumentText,
    clauses: List[Clause],
    risks: List[RiskAssessment],
    heuristic_summary: str,
) -> Optional[str]:
    """Generate an enhanced contract summary using Gemini.

    Returns None if no API key is configured or if the call fails.
    """

    api_key = os.getenv(GEMINI_API_KEY_ENV)
    if not api_key:
        return None

    base_prompt = _build_base_prompt(document, clauses, risks)

    task_instructions = """
=== YOUR TASK: Generate WORLD-CLASS Contract Analysis ===

You are analyzing this contract for a hackathon demonstration. The quality of your analysis will determine the project's success.

CRITICAL REQUIREMENTS:
1. Read the ENTIRE contract text carefully
2. Extract EVERY important detail (don't miss anything)
3. Be SPECIFIC - use exact numbers, dates, names from the contract
4. Identify HIDDEN risks that simple keyword matching would miss
5. Provide ACTIONABLE recommendations

=== REQUIRED OUTPUT STRUCTURE ===

# CONTRACT ANALYSIS REPORT

## 1. EXECUTIVE SUMMARY
- Contract Type: [e.g., Service Agreement, License Agreement, Employment Contract]
- Parties: [Full names/entities with their roles]
- Effective Date: [Exact date if mentioned]
- Contract Duration: [Term length, renewal terms]
- Primary Purpose: [What this contract accomplishes]

## 2. KEY COMMERCIAL TERMS

### Payment & Financial Terms
- Payment Amount: [Exact figures with currency]
- Payment Schedule: [When payments are due - be specific]
- Payment Method: [How payments are made]
- Late Fees/Penalties: [Exact percentages or amounts]
- Refund Policy: [If applicable]
- Currency: [If specified]

### Services/Deliverables
- What is being provided: [Detailed description]
- Performance Standards: [Quality requirements, SLAs]
- Delivery Timeline: [Specific deadlines]
- Acceptance Criteria: [How deliverables are accepted]

### Obligations
- Party A Obligations: [List all obligations]
- Party B Obligations: [List all obligations]
- Milestones: [Key dates and deliverables]

## 3. CRITICAL LEGAL PROVISIONS

### Termination
- Termination Rights: [Who can terminate, when, how]
- Notice Period: [Exact notice requirements]
- Termination for Cause: [Specific breach conditions]
- Termination Without Cause: [If allowed, conditions]
- Automatic Renewal: [Yes/No, conditions, notice requirements]
- Consequences of Termination: [What happens after termination]

### Intellectual Property
- IP Ownership: [Who owns what]
- License Grants: [Scope of licenses]
- Work-for-Hire: [If applicable]
- Restrictions: [Limitations on use]

### Confidentiality & Data
- Confidentiality Scope: [What is protected]
- Duration: [How long confidentiality lasts]
- Data Protection: [GDPR, privacy requirements]
- Non-Disclosure: [Specific restrictions]

### Liability & Indemnification
- Liability Caps: [Limits on liability]
- Indemnification: [Who indemnifies whom, scope]
- Exclusions: [What's excluded from liability]
- Insurance Requirements: [If mentioned]

### Dispute Resolution
- Governing Law: [Which jurisdiction]
- Venue: [Where disputes are heard]
- Arbitration: [Yes/No, process]
- Mediation: [If required]

## 4. RISK ANALYSIS

### 🔴 HIGH PRIORITY RISKS
For each high-risk item:
- Risk: [Specific risk identified]
- Location: [Where in contract - quote the exact language]
- Impact: [Why this matters - business/financial impact]
- Recommendation: [What should be done]

### 🟡 MEDIUM PRIORITY CONCERNS
- Concern: [What the concern is]
- Why it matters: [Potential issues]
- Recommendation: [Suggested action]

### ⚠️ UNUSUAL PROVISIONS
- Unusual Term: [What's unusual]
- Why it stands out: [Comparison to standard contracts]
- Consideration: [What to think about]

## 5. ACTION ITEMS & RECOMMENDATIONS

### Immediate Actions Required
1. [Specific action with deadline if mentioned]
2. [Next action]
3. [Another action]

### Questions for Legal Counsel
- [Specific question about a clause]
- [Question about enforceability]
- [Question about negotiation points]

### Negotiation Points
- [What should be negotiated]
- [Why it matters]
- [Suggested alternative language]

## 6. SUMMARY SCORECARD
- Overall Risk Level: [Low/Medium/High]
- Key Strengths: [What's good about this contract]
- Key Concerns: [Main issues to address]
- Recommended Next Steps: [Clear action plan]

---

⚠️ DISCLAIMER: This analysis is AI-generated and is for informational purposes only. It does not constitute legal advice. Always consult with qualified legal counsel before making decisions based on this analysis.

=== END OF REPORT ===

IMPORTANT: 
- Be THOROUGH - analyze every section
- Be SPECIFIC - use exact quotes and numbers from the contract
- Be ACTIONABLE - tell the user exactly what to do
- Be PROFESSIONAL - this is for a hackathon, make it impressive!

Heuristic summary (use as starting point but EXPAND SIGNIFICANTLY):
"""
    prompt = base_prompt + "\n\n" + task_instructions + heuristic_summary

    try:
        result = _call_gemini(prompt, api_key, temperature=0.2)  # Lower temperature for more focused analysis
        # Ensure we got a meaningful response
        if result and len(result.strip()) > 100:
            return result
        else:
            print(f"Warning: Gemini returned short/empty response: {result[:50] if result else 'None'}")
            return None
    except GeminiError as e:
        print(f"Gemini API error in summary generation: {e}")
        # Fail soft: keep the app working even if Gemini is unavailable
        return None
    except Exception as e:
        print(f"Unexpected error in Gemini summary: {e}")
        return None


def generate_gemini_risk_overview(
    document: DocumentText,
    clauses: List[Clause],
    risks: List[RiskAssessment],
) -> Optional[str]:
    """Ask Gemini for a short narrative overview of risk themes.

    Returns None if no API key is configured or if the call fails.
    """

    api_key = os.getenv(GEMINI_API_KEY_ENV)
    if not api_key:
        return None

    base_prompt = _build_base_prompt(document, clauses, risks)

    task_instructions = """
=== YOUR TASK: Deep Risk Analysis for Hackathon Demo ===

Perform a COMPREHENSIVE risk analysis that will impress hackathon judges. Be thorough, specific, and actionable.

=== ANALYSIS FRAMEWORK ===

Analyze the contract for:
1. One-sided terms (favoring one party unfairly)
2. Financial risks (penalties, fees, liability caps)
3. Operational risks (termination, renewal, performance)
4. Legal risks (unenforceable terms, missing protections)
5. Hidden risks (buried in fine print, cross-references)

=== REQUIRED OUTPUT FORMAT ===

# COMPREHENSIVE RISK ASSESSMENT

## 🔴 CRITICAL RISKS (Immediate Attention Required)

For EACH critical risk, provide:

**Risk #1: [Risk Name]**
- **Severity**: Critical/High
- **Location**: Quote the exact contract language
- **Description**: Detailed explanation of the risk
- **Commercial Impact**: 
  - Financial: [Potential cost/liability]
  - Operational: [How it affects business]
  - Legal: [Enforceability concerns]
- **Real-World Example**: [How this could play out in practice]
- **Recommendation**: [Specific action to take]
- **Negotiation Strategy**: [How to address this]

[Repeat for each critical risk]

## 🟡 MODERATE RISKS (Review Recommended)

**Risk #1: [Risk Name]**
- **Location**: [Contract section/language]
- **Concern**: [What's concerning]
- **Impact**: [Why it matters]
- **Recommendation**: [What to do]

[Continue for all moderate risks]

## ⚠️ UNUSUAL PROVISIONS (Worth Noting)

- **Provision**: [What's unusual]
- **Standard Practice**: [What's typically seen]
- **Why It Matters**: [Potential implications]

## 📊 RISK SUMMARY

### By Category:
- **Financial Risks**: [Count and summary]
- **Legal Risks**: [Count and summary]
- **Operational Risks**: [Count and summary]
- **Reputational Risks**: [If applicable]

### By Party:
- **Risks to Party A**: [List]
- **Risks to Party B**: [List]
- **Shared Risks**: [List]

## 🎯 PRIORITIZED ACTION PLAN

### Immediate (Within 24 hours):
1. [Specific action]
2. [Next action]

### Short-term (Within 1 week):
1. [Action]
2. [Action]

### Before Signing:
1. [Critical review item]
2. [Must-negotiate point]

## 💡 EXPERT INSIGHTS

### What Stands Out:
- [Unique observation about this contract]
- [Comparison to industry standards]
- [Red flags that need attention]

### What's Missing:
- [Standard protections that aren't present]
- [Clauses that should be included]
- [Gaps in coverage]

### Enforceability Concerns:
- [Terms that may not be legally enforceable]
- [Jurisdiction-specific issues]
- [Potential legal challenges]

---

⚠️ **IMPORTANT**: This risk analysis is AI-generated for demonstration purposes. It identifies patterns and potential concerns but does not replace professional legal review. Always consult qualified legal counsel before making decisions.

=== END OF RISK ANALYSIS ===

CRITICAL INSTRUCTIONS:
- Find risks that keyword matching would MISS
- Quote EXACT contract language for each risk
- Explain WHY each risk matters in business terms
- Provide SPECIFIC, ACTIONABLE recommendations
- Make this analysis IMPRESSIVE for a hackathon demo!
"""

    prompt = base_prompt + "\n\n" + task_instructions

    try:
        result = _call_gemini(prompt, api_key, temperature=0.2)  # Lower temperature for more focused analysis
        # Ensure we got a meaningful response
        if result and len(result.strip()) > 50:
            return result
        else:
            print(f"Warning: Gemini returned short/empty risk overview: {result[:50] if result else 'None'}")
            return None
    except GeminiError as e:
        print(f"Gemini API error in risk overview: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error in Gemini risk overview: {e}")
        return None
