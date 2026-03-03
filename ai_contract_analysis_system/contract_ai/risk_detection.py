from __future__ import annotations

from typing import List

from .models import Clause, RiskAssessment, RiskLevel, ClauseType


def assess_risk_for_clause(clause: Clause) -> RiskAssessment:
    """Assign a heuristic risk level and reasons for a single clause.

    Enhanced risk detection with more comprehensive patterns.
    """

    text = clause.text.lower()
    reasons: list[str] = []
    level = RiskLevel.LOW

    # HIGH RISK PATTERNS
    
    # One-sided obligations / broad discretions
    high_risk_phrases = [
        "sole discretion", "without liability", "at its sole discretion",
        "unlimited liability", "no liability", "disclaims all liability",
        "as is", "where is", "with all faults"
    ]
    if any(phrase in text for phrase in high_risk_phrases):
        level = RiskLevel.HIGH
        reasons.append("Clause grants one party broad discretion or completely limits liability - may be one-sided.")

    # Broad indemnity
    if "indemnify" in text:
        if any(phrase in text for phrase in ["any and all", "all claims", "all damages", "all losses", "all costs"]):
            level = max(level, RiskLevel.HIGH, key=lambda x: x.value)
            reasons.append("Very broad indemnity language detected - may expose party to unlimited liability.")
        elif "indemnify" in text:
            level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
            reasons.append("Indemnification clause present - review scope and limitations carefully.")

    # Automatic renewal / difficult termination
    if clause.type == ClauseType.TERMINATION:
        if any(phrase in text for phrase in ["automatic renewal", "auto-renew", "unless terminated", "deemed renewed"]):
            level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
            reasons.append("Automatic renewal clause - ensure clear termination process exists.")
        if "without cause" not in text and "for cause" in text:
            level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
            reasons.append("Termination may be restricted to specific causes only.")

    # Excessive penalties / liquidated damages
    if clause.type in {ClauseType.PAYMENT, ClauseType.PENALTY}:
        if "%" in text and any(term in text for term in ["penalty", "late fee", "interest", "default"]):
            # Check for high percentages
            import re
            percentages = re.findall(r'(\d+(?:\.\d+)?)%', text)
            if percentages:
                max_pct = max(float(p) for p in percentages)
                if max_pct > 10:
                    level = max(level, RiskLevel.HIGH, key=lambda x: x.value)
                    reasons.append(f"High penalty rate detected ({max_pct}%) - may be excessive.")
                elif max_pct > 5:
                    level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
                    reasons.append(f"Moderate penalty rate ({max_pct}%) - review for reasonableness.")
        if "liquidated damages" in text and any(phrase in text for phrase in ["unlimited", "all damages", "consequential"]):
            level = max(level, RiskLevel.HIGH, key=lambda x: x.value)
            reasons.append("Broad liquidated damages clause - may not be enforceable if excessive.")

    # Non-compete / restrictive covenants
    if any(term in text for term in ["non-compete", "non-solicitation", "non-disparagement"]):
        if any(phrase in text for phrase in ["unlimited", "anywhere", "any time", "perpetual"]):
            level = max(level, RiskLevel.HIGH, key=lambda x: x.value)
            reasons.append("Overly broad restrictive covenant - may be unenforceable or unreasonable.")
        else:
            level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
            reasons.append("Restrictive covenant present - review scope, duration, and geographic limits.")

    # Intellectual property assignments
    if any(term in text for term in ["work for hire", "assignment", "all rights", "exclusive rights"]):
        if "intellectual property" in text or "ip" in text:
            level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
            reasons.append("IP assignment clause - ensure you understand what rights you're granting.")

    # MEDIUM RISK PATTERNS

    # Ambiguous / vague language
    vague_terms = [
        "reasonable efforts", "best efforts", "material", "as soon as practicable",
        "substantial", "significant", "adequate", "satisfactory", "appropriate"
    ]
    vague_count = sum(1 for term in vague_terms if term in text)
    if vague_count >= 2:
        level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
        reasons.append(f"Multiple vague/subjective terms ({vague_count}) - may lead to disputes over interpretation.")

    # Unilateral modification rights
    if any(phrase in text for phrase in ["may modify", "reserves the right to", "at any time", "without notice"]):
        level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
        reasons.append("Unilateral modification rights - terms may change without your consent.")

    # Very long or complex clauses
    if len(clause.text) > 800:
        level = max(level, RiskLevel.MEDIUM, key=lambda x: x.value)
        reasons.append("Very long clause - may contain complex or layered obligations that need careful review.")

    # Cross-references to other documents - only flag if no other risks found
    if level == RiskLevel.LOW and not reasons:
        if any(phrase in text for phrase in ["as defined in", "incorporated herein", "attached hereto", "exhibit"]):
            reasons.append("References other documents - ensure all referenced materials are reviewed.")

    # Only add generic reason if we found NO risks at all
    # If we found any risk (even LOW), don't add the generic message
    if not reasons:
        # No risks found - return None will be filtered out
        return None

    return RiskAssessment(clause_id=clause.id, level=level, reasons=reasons)


def assess_risks(clauses: List[Clause]) -> List[RiskAssessment]:
    """Assess risk for a list of clauses.
    
    Only returns risks that have actual concerns (filters out LOW risks with no specific issues).
    """

    all_risks = [assess_risk_for_clause(c) for c in clauses]
    # Filter out None values and LOW risks that are just generic "no risk detected"
    filtered_risks = []
    for risk in all_risks:
        if risk is None:
            continue
        # Only include if it's HIGH/MEDIUM, or LOW with specific reasons (not generic)
        if risk.level != RiskLevel.LOW:
            filtered_risks.append(risk)
        elif risk.reasons and any("No specific" not in r and "Standard review" not in r for r in risk.reasons):
            # LOW risk but has specific reason
            filtered_risks.append(risk)
    
    return filtered_risks
