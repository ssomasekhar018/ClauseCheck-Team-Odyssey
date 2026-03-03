from __future__ import annotations

from typing import List

from .models import AnalysisResult, Clause, ClauseType, RiskAssessment, RiskLevel
from .nlp_core import extract_parties


def _summarize_payments(clauses: List[Clause]) -> str:
    payments = [c.text for c in clauses if c.type == ClauseType.PAYMENT]
    if not payments:
        return "Payment terms: Not clearly identified in the contract. Review the full document for payment obligations, schedules, and methods."
    
    # Extract key payment information
    payment_summary = []
    for payment in payments[:5]:  # Top 5 payment clauses
        # Try to extract amounts, dates, percentages
        import re
        amounts = re.findall(r'\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:dollars?|USD)', payment, re.IGNORECASE)
        percentages = re.findall(r'\d+(?:\.\d+)?%', payment)
        dates = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b', payment, re.IGNORECASE)
        
        summary_parts = []
        if amounts:
            summary_parts.append(f"Amount: {', '.join(amounts[:2])}")
        if percentages:
            summary_parts.append(f"Rate: {', '.join(percentages[:2])}")
        if dates:
            summary_parts.append(f"Date: {', '.join(dates[:1])}")
        
        if summary_parts:
            payment_summary.append(f"{payment[:100]}... ({'; '.join(summary_parts)})")
        else:
            payment_summary.append(f"{payment[:150]}...")
    
    if len(payments) == 1:
        return f"Payment terms identified: {payment_summary[0] if payment_summary else payments[0][:200]}"
    return f"Payment-related clauses ({len(payments)} found):\n" + "\n".join(f"- {p}" for p in payment_summary)


def _summarize_termination(clauses: List[Clause]) -> str:
    terms = [c.text for c in clauses if c.type == ClauseType.TERMINATION]
    if not terms:
        return "Termination conditions: Not clearly identified. Review the full contract for termination rights, notice periods, and conditions."
    
    termination_summary = []
    for term in terms[:5]:
        # Check for key termination concepts
        has_notice = "notice" in term.lower()
        has_cause = any(phrase in term.lower() for phrase in ["for cause", "breach", "default", "material breach"])
        has_autorenew = any(phrase in term.lower() for phrase in ["automatic", "auto-renew", "renewal"])
        
        features = []
        if has_notice:
            features.append("Notice required")
        if has_cause:
            features.append("Cause-based")
        if has_autorenew:
            features.append("Auto-renewal")
        
        if features:
            termination_summary.append(f"{term[:120]}... ({'; '.join(features)})")
        else:
            termination_summary.append(f"{term[:150]}...")
    
    return f"Termination provisions ({len(terms)} found):\n" + "\n".join(f"- {t}" for t in termination_summary)


def _summarize_major_risks(risks: List[RiskAssessment], clauses_by_id: dict[int, Clause]) -> str:
    high_risks = [r for r in risks if r.level == RiskLevel.HIGH]
    med_risks = [r for r in risks if r.level == RiskLevel.MEDIUM]

    lines: list[str] = []
    if high_risks:
        lines.append("Higher-risk clauses detected:")
        for r in high_risks[:5]:
            clause = clauses_by_id.get(r.clause_id)
            snippet = (clause.text[:200] + "...") if clause else "(clause text unavailable)"
            lines.append(f"- HIGH: {snippet}  — Reason: {r.reasons[0]}")

    if med_risks:
        lines.append("Medium-risk clauses detected:")
        for r in med_risks[:5]:
            clause = clauses_by_id.get(r.clause_id)
            snippet = (clause.text[:200] + "...") if clause else "(clause text unavailable)"
            lines.append(f"- MEDIUM: {snippet}  — Reason: {r.reasons[0]}")

    if not lines:
        return "The heuristics did not flag any clauses as medium or high risk. This does not mean the contract is free of risk."

    return "\n".join(lines)


def summarize_contract(text: str, clauses: List[Clause], risks: List[RiskAssessment]) -> str:
    """Generate a concise, simple-English summary of the contract.

    This summary is intentionally high-level and explanatory, not
    prescriptive. It should always be read together with the full
    contract and professional legal advice.
    """

    parties = extract_parties(text)
    clauses_by_id = {c.id: c for c in clauses}

    parts: list[str] = []

    if parties:
        parts.append("Parties involved (heuristic): " + ", ".join(parties))
    else:
        parts.append("Parties: The system could not confidently identify the parties using its simple rules.")

    parts.append(_summarize_payments(clauses))
    parts.append(_summarize_termination(clauses))
    parts.append(_summarize_major_risks(risks, clauses_by_id))

    parts.append(
        "Note: This summary is automatically generated by an AI system using heuristic rules. "
        "It may miss important details and should not be relied upon as legal advice."
    )

    return "\n\n".join(parts)
