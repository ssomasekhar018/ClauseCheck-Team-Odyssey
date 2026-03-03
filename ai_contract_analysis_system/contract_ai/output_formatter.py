"""
Output Formatter - Transforms internal analysis data to user-friendly presentation.

This module ensures:
- No "UNKNOWN" or internal jargon appears in the UI
- Clauses are summarized to 1-2 lines
- Risk types are mapped to user-friendly labels
- "OTHER" clauses are filtered out
- Output is structured for 60-second comprehension
"""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

from .models import Clause, ClauseType, RiskAssessment, RiskLevel, DocumentText
from .nlp_core import extract_parties


# Map internal clause types to user-friendly display names (key clauses list)
# Order reflects: Term & Duration, Compensation, Confidentiality, Termination, Penalty, Liability, Governing Law, Miscellaneous
# Plain-language names so anyone (including judges) can understand. No legal jargon.
CLAUSE_TYPE_DISPLAY_NAMES = {
    ClauseType.PAYMENT: "Compensation & Benefits",
    ClauseType.TERMINATION: "Termination",
    ClauseType.CONFIDENTIALITY: "Confidentiality",
    ClauseType.LIABILITY: "Liability / Indemnification",
    ClauseType.PENALTY: "Penalties and Sale or Merger of the Company",
    ClauseType.GOVERNING_LAW: "Governing Law & Jurisdiction",
    ClauseType.OTHER: "Miscellaneous / Entire Agreement",
}

# Names for risk cards: "X Clause" (one card per clause TYPE). Same plain language.
CLAUSE_RISK_CARD_NAMES = {
    ClauseType.PAYMENT: "Compensation & Benefits",
    ClauseType.TERMINATION: "Termination",
    ClauseType.CONFIDENTIALITY: "Confidentiality",
    ClauseType.LIABILITY: "Liability / Indemnification",
    ClauseType.PENALTY: "Penalties and Sale or Merger of the Company",
    ClauseType.GOVERNING_LAW: "Governing Law & Jurisdiction",
}

# Recommended clause order (matching: Compensation, Confidentiality, Termination, Penalty, Liability, Gov Law, Miscellaneous)
CLAUSE_GROUP_ORDER = [
    ClauseType.PAYMENT,
    ClauseType.CONFIDENTIALITY,
    ClauseType.TERMINATION,
    ClauseType.PENALTY,
    ClauseType.LIABILITY,
    ClauseType.GOVERNING_LAW,
    ClauseType.OTHER,
]

# Clause types to show in the curated list (includes Miscellaneous)
CURATED_CLAUSE_TYPES = {
    ClauseType.PAYMENT,
    ClauseType.TERMINATION,
    ClauseType.CONFIDENTIALITY,
    ClauseType.LIABILITY,
    ClauseType.PENALTY,
    ClauseType.GOVERNING_LAW,
    ClauseType.OTHER,
}


# One plain-language sentence per clause type so lawyers grasp what the clause is about at a glance.
PLAIN_LANGUAGE_TAKEAWAYS = {
    ClauseType.PAYMENT: "In plain terms: This clause describes what you are paid, when, and any benefits or bonuses.",
    ClauseType.TERMINATION: "In plain terms: This clause explains when and how the agreement can end, and what obligations continue after it ends.",
    ClauseType.CONFIDENTIALITY: "In plain terms: This clause describes what information you must keep secret, for how long, and the consequences of disclosure.",
    ClauseType.LIABILITY: "In plain terms: This clause describes who pays if something goes wrong and the extent of that responsibility.",
    ClauseType.PENALTY: "In plain terms: This clause covers when you may owe money or face other consequences if you breach, and what happens if the company is sold or merges.",
    ClauseType.GOVERNING_LAW: "In plain terms: This clause states which state's or country's laws apply and where any disputes must be resolved.",
}


@dataclass
class FormattedRisk:
    """User-friendly risk representation — one per CLAUSE TYPE, grouped"""
    clause_type_key: str  # e.g. "PAYMENT"
    level: str
    level_key: str
    clause_name: str    # e.g. "Compensation & Benefits Clause"
    reasons: List[str]
    plain_language_takeaway: str  # One sentence: what this clause is about, in plain language for lawyers
    in_this_contract_summary: str  # What this contract says (plain language) — links to why we flag these risks
    

@dataclass 
class ContractOverview:
    """Executive summary of the contract"""
    filename: str
    overall_risk_level: str  # "Low", "Medium", "High"
    total_clauses: int
    risk_count: int
    high_risk_count: int
    medium_risk_count: int


@dataclass
class ClauseGroup:
    """Clauses grouped by type for contiguous display"""
    type_name: str
    type_key: str
    clauses: List[Dict[str, Any]]  # [{"id", "summary"}, ...]


@dataclass
class FormattedOutput:
    """Complete user-friendly output structure"""
    overview: ContractOverview
    structured_overview: Dict[str, Any]
    summary_bullets: List[str]
    key_clauses_grouped: List[ClauseGroup]
    risk_highlights: List[FormattedRisk]
    disclaimer: str


def _map_reason_to_user_friendly(reason: str) -> Optional[str]:
    """Map internal heuristic messages to user-friendly explanations. Returns None to hide."""
    r = reason.lower()
    # Explicit mappings (order matters: more specific first)
    if "very long clause" in r or "complex or layered" in r or "long clause" in r:
        return "High complexity may hide obligations"
    if "confidential" in r:
        return "Broad confidentiality obligations covering business information."
    if "restrictive covenant" in r and ("scope" in r or "geographic" in r or "duration" in r or "present" in r):
        return "Limits future actions or employment"
    if "restrictive covenant" in r or "non-compete" in r or "non-solicitation" in r:
        return "Limits future actions or employment"
    if "unilateral modification" in r or "terms may change without" in r or "reserves the right" in r or "without notice" in r:
        return "Favors one party"
    if "high penalty" in r or "penalty rate" in r or "excessive" in r or "liquidated damages" in r and ("broad" in r or "unlimited" in r):
        return "Financial penalties may be excessive"
    if "moderate penalty" in r or "penalty" in r and "%" in r:
        return "Financial penalties may be excessive"
    if "survive" in r and "terminat" in r or "obligations continue" in r or "continue after termination" in r:
        return "Obligations continue after termination"
    if "broad discretion" in r or "one-sided" in r or "completely limits liability" in r or "sole discretion" in r:
        return "One-sided obligations favoring the company"
    if "indemnif" in r or "unlimited liability" in r or "all claims" in r:
        return "May expose to significant liability"
    if "automatic renewal" in r or "auto-renew" in r:
        return "Automatic renewal may extend the term"
    if "termination may be restricted" in r or "for cause" in r and "without cause" not in r:
        return "Termination allowed only for specific causes"
    if "vague" in r or "subjective" in r or "interpretation" in r:
        return "High complexity may hide obligations"
    if "ip assignment" in r or "work for hire" in r or "rights you're granting" in r:
        return "Ensure you understand what rights you are granting"
    if "references other documents" in r or "incorporated herein" in r:
        return "References other documents; ensure all materials are reviewed"
    # Catch-all for liability/discretion/penalty-ish
    if "limits liability" in r or "disclaims" in r:
        return "Favors one party"
    return None


def _build_structured_overview(
    document: DocumentText,
    clauses: List[Clause],
    risks: List[RiskAssessment],
    overall_risk: str,
) -> Dict[str, Any]:
    """Build Contract Type, Parties, Duration, Compensation, Overall Risk for executive overview."""
    content = (document.content or "")[:8000]
    content_lower = content.lower()
    out: Dict[str, Any] = {
        "contract_type": "—",
        "parties": [],
        "duration": "—",
        "compensation": "—",
        "overall_risk": overall_risk,
    }
    # Contract type
    for term in ["employment", "board agreement", "warrant", "license", "service agreement", "nda", "consulting", "loan", "lease"]:
        if term in content_lower:
            out["contract_type"] = term.replace("_", " ").title()
            break
    if out["contract_type"] == "—" and "agreement" in content_lower:
        out["contract_type"] = "Agreement"
    # Parties
    parties = extract_parties(document.content or "")
    out["parties"] = parties if parties else ["—"]
    # Duration
    for pat in [
        r"effective\s+until\s+([^.\n]+?)(?:\.|$)",
        r"term\s+of\s+(\d+\s*(?:years?|months?|days?))",
        r"termination\s+date[:\s]+([^.\n]+?)(?:\.|$)",
        r"through\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
        r"(\d{1,2}/\d{1,2}/\d{2,4})\s+to\s+(\d{1,2}/\d{1,2}/\d{2,4})",
    ]:
        m = re.search(pat, content, re.IGNORECASE)
        if m:
            out["duration"] = m.group(1).strip() if m.lastindex >= 1 else m.group(0).strip()
            break
    # Compensation from PAYMENT clauses
    pay = [c for c in clauses if c.type == ClauseType.PAYMENT]
    if pay:
        t = pay[0].text
        amt = re.findall(r"\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?\s*%", t)
        if amt:
            out["compensation"] = ", ".join(amt[:2])
        else:
            out["compensation"] = _summarize_clause_text(pay[0].text, 80)
    return out


def _build_summary_bullets(
    structured_overview: Dict[str, Any],
    clauses: List[Clause],
    risk_type_keys: set,
    formatted_risks: List[FormattedRisk],
) -> List[str]:
    """Build 5–7 bullet points for Contract Summary with contract-specific examples."""
    so = structured_overview
    parties = so.get("parties") or []
    parties_str = ", ".join(parties) if parties and parties != ["—"] else "the identified parties"
    ct = so.get("contract_type") or "contract"
    comp = so.get("compensation") or "—"
    dur = so.get("duration") or "—"
    risk = so.get("overall_risk") or "Low"

    risk_lookup = {r.clause_type_key: r for r in formatted_risks}

    bullets: List[str] = []
    bullets.append(f"This is a {ct} agreement between {parties_str}.")
    if comp and comp != "—":
        bullets.append(f"The agreement provides {comp}.")
    else:
        bullets.append("Compensation terms are defined in the contract.")
    if dur and dur != "—":
        bullets.append(f"The agreement remains effective until {dur}, unless terminated earlier under defined conditions.")
    else:
        bullets.append("The term and duration are set out in the contract.")

    has_conf = any(c.type == ClauseType.CONFIDENTIALITY for c in clauses) or "CONFIDENTIALITY" in risk_type_keys
    if has_conf:
        conf = risk_lookup.get("CONFIDENTIALITY")
        if conf and conf.reasons:
            examples = "; ".join(conf.reasons[:3])
            bullets.append(f"Strict confidentiality, non-competition, and non-solicitation obligations may apply during and after the term. Examples from this contract: {examples}.")
        else:
            bullets.append("Strict confidentiality, non-competition, and non-solicitation obligations may apply during and after the term.")

    has_restrict = "PENALTY" in risk_type_keys or "TERMINATION" in risk_type_keys or "LIABILITY" in risk_type_keys
    if has_restrict:
        restrict_types = ["PENALTY", "TERMINATION", "LIABILITY"]
        parts: List[str] = []
        for key in restrict_types:
            r = risk_lookup.get(key)
            if not r or not r.reasons:
                continue
            first = r.reasons[0]
            parts.append(f"The {r.clause_name}: {first}")
        if parts:
            bullets.append(". ".join(parts))
        else:
            bullets.append("Certain clauses may restrict resignation, share sales, and post-termination activities.")

    risk_phrase = risk.lower().replace("-", " ")
    bullets.append(f"Overall, the contract presents {risk_phrase} risk.")
    return bullets[:7]


def _summarize_clause_text(text: str, max_length: int = 150) -> str:
    """Summarize clause text to 1-2 lines."""
    # Clean up whitespace
    text = " ".join(text.split())

    if len(text) <= max_length:
        return text

    # Find a good break point (end of sentence or phrase)
    truncated = text[:max_length]

    # Try to break at sentence end
    for punct in [". ", "! ", "? "]:
        last_punct = truncated.rfind(punct)
        if last_punct > max_length // 2:
            return truncated[: last_punct + 1].strip()

    # Try to break at comma or semicolon
    for punct in [", ", "; ", " - "]:
        last_punct = truncated.rfind(punct)
        if last_punct > max_length // 2:
            return truncated[:last_punct].strip() + "..."

    # Fall back to word boundary
    last_space = truncated.rfind(" ")
    if last_space > max_length // 2:
        return truncated[:last_space].strip() + "..."

    return truncated.strip() + "..."


def _clean_summary_for_display(s: str) -> str:
    """Ensure clause summary has clear grammar: capitalized, ends with punctuation."""
    s = s.strip()
    if not s:
        return s
    if len(s) > 1:
        s = s[0].upper() + s[1:]
    else:
        s = s.upper()
    if s and s[-1] not in ".!?…" and not s.endswith("..."):
        s = s + "."
    return s


def _plain_language_paraphrase(text: str, ctype: ClauseType) -> str:
    """
    One plain-language sentence: what this contract's clause says or does.
    Used to show "In this contract they had mentioned like this, so this particular risk will come."
    No raw legal text — only a paraphrase lawyers can understand at a glance.
    """
    t = (text or "")[:2000].lower()

    if ctype == ClauseType.PENALTY:
        if "change of control" in t or "change in control" in t:
            return "the clause ties your obligations to a 'change of control' or when the company is sold or merges, and sets out consequences if you breach."
        if "liquidated" in t or ("penalty" in t and ("%" in text or "percent" in t)):
            return "the clause sets out financial penalties or a percentage you may owe if you breach."
        if "breach" in t:
            return "the clause sets out consequences if you breach, and may refer to what happens if the company is sold or merges."
        return "the clause sets out when you may owe money or face other consequences, and what happens if the company is sold or merges."

    if ctype == ClauseType.TERMINATION:
        if "for cause" in t and "without cause" not in t:
            return "the clause allows the agreement to be ended only for certain reasons ('for cause'), not at will."
        if "survive" in t or "surviving" in t:
            return "the clause explains when the agreement can end and which obligations continue after it ends."
        if "automatically" in t or "auto-renew" in t or "auto renew" in t:
            return "the clause may allow the agreement to renew automatically unless you take steps to end it."
        return "the clause explains when and how the agreement can end."

    if ctype == ClauseType.CONFIDENTIALITY:
        if "non-compete" in t or "non-competing" in t or "non-solicit" in t:
            return "the clause requires you to keep information secret and may restrict who you can work for or solicit after the term."
        if "confidential" in t or "non-disclosure" in t:
            return "the clause requires you to keep certain information confidential during and after the term."
        return "the clause requires you to keep certain information secret and describes the consequences of disclosure."

    if ctype == ClauseType.LIABILITY:
        if "indemnif" in t:
            return "the clause may require you to pay for certain claims or losses suffered by the other party."
        if "limit" in t and ("liab" in t or "damages" in t):
            return "the clause limits one party's responsibility for losses or damages."
        return "the clause describes who is responsible if something goes wrong and the extent of that responsibility."

    if ctype == ClauseType.PAYMENT:
        if "$" in text or "%" in text or "percent" in t:
            return "the clause specifies the amounts you are paid, when, and any bonuses or benefits."
        return "the clause describes your pay, when it is paid, and any benefits or bonuses."

    if ctype == ClauseType.GOVERNING_LAW:
        if "governed" in t or "laws of" in t:
            return "the clause states which state's or country's laws apply to the agreement."
        if "jurisdiction" in t:
            return "the clause specifies where any disputes must be resolved."
        return "the clause specifies which laws apply and where disputes are resolved."

    return "the clause covers matters that may pose the risks identified below."


def format_for_display(
    document: DocumentText,
    clauses: List[Clause],
    risks: List[RiskAssessment],
    disclaimer: str
) -> FormattedOutput:
    """
    Transform internal analysis data into clean, user-friendly output.
    
    This is the main entry point for output formatting.
    """
    
    # Build clause lookup
    clause_lookup = {c.id: c for c in clauses}
    
    # Group risks by CLAUSE TYPE — one card per type, highest severity, merged reasons
    by_type: Dict[ClauseType, List[RiskAssessment]] = defaultdict(list)
    for r in risks:
        clause = clause_lookup.get(r.clause_id)
        if not clause or clause.type == ClauseType.OTHER:
            continue
        by_type[clause.type].append(r)

    formatted_risks = []
    for ctype, group in by_type.items():
        level = max(group, key=lambda r: (r.level.value, 0))
        level_str = level.level.name.capitalize()
        level_key = level.level.name
        clause_name = CLAUSE_RISK_CARD_NAMES.get(ctype)
        if not clause_name:
            continue
        clause_name = clause_name + " Clause"
        seen: set = set()
        reasons_list: List[str] = []
        for r in group:
            for raw in r.reasons or []:
                mapped = _map_reason_to_user_friendly(raw)
                if mapped and mapped not in seen:
                    seen.add(mapped)
                    reasons_list.append(mapped)
        if not reasons_list:
            reasons_list.append("Review this clause carefully.")
        takeaway = PLAIN_LANGUAGE_TAKEAWAYS.get(ctype, "In plain terms: Review this clause carefully.")
        # "In this contract they had mentioned like this, so this particular risk will come"
        first_clause = clause_lookup.get(group[0].clause_id) if group else None
        if first_clause and first_clause.text:
            paraphrase = _plain_language_paraphrase(first_clause.text, ctype)
            in_this_contract_summary = f"In this contract, {paraphrase} That is why we have identified the risks below."
        else:
            in_this_contract_summary = "In this contract, the clause covers matters that may pose the risks identified below."
        formatted_risks.append(FormattedRisk(
            clause_type_key=ctype.name,
            level=level_str,
            level_key=level_key,
            clause_name=clause_name,
            reasons=reasons_list,
            plain_language_takeaway=takeaway,
            in_this_contract_summary=in_this_contract_summary,
        ))

    risk_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    formatted_risks.sort(key=lambda r: risk_order.get(r.level_key, 3))

    high_count = sum(1 for r in risks if r.level == RiskLevel.HIGH)
    medium_count = sum(1 for r in risks if r.level == RiskLevel.MEDIUM)
    if high_count >= 2:
        overall_risk = "High"
    elif high_count >= 1 or medium_count >= 3:
        overall_risk = "Medium"
    elif medium_count >= 1:
        overall_risk = "Low-Medium"
    else:
        overall_risk = "Low"

    overview = ContractOverview(
        filename=document.source_name,
        overall_risk_level=overall_risk,
        total_clauses=sum(1 for c in clauses if c.type in CURATED_CLAUSE_TYPES),
        risk_count=len(formatted_risks),
        high_risk_count=high_count,
        medium_risk_count=medium_count,
    )
    structured_overview = _build_structured_overview(document, clauses, risks, overall_risk)

    # Clause list grouped by type (recommended order: Term & Duration first, then Compensation, etc.)
    key_clauses_grouped: List[ClauseGroup] = []
    dur_val = structured_overview.get("duration") or "—"
    if dur_val != "—":
        key_clauses_grouped.append(ClauseGroup(
            type_name="Term & Duration",
            type_key="TERM_AND_DURATION",
            clauses=[{"id": -1, "summary": _clean_summary_for_display(f"The agreement is effective until {dur_val}.")}],
        ))
    for ctype in CLAUSE_GROUP_ORDER:
        group_clauses = [c for c in clauses if c.type == ctype]
        if not group_clauses:
            continue
        type_name = CLAUSE_TYPE_DISPLAY_NAMES.get(ctype)
        if not type_name:
            continue
        key_clauses_grouped.append(ClauseGroup(
            type_name=type_name,
            type_key=ctype.name,
            clauses=[
                {"id": c.id, "summary": _clean_summary_for_display(_summarize_clause_text(c.text))}
                for c in group_clauses
            ],
        ))

    risk_type_keys = {t.name for t in by_type}
    summary_bullets = _build_summary_bullets(structured_overview, clauses, risk_type_keys, formatted_risks)

    return FormattedOutput(
        overview=overview,
        structured_overview=structured_overview,
        summary_bullets=summary_bullets,
        key_clauses_grouped=key_clauses_grouped,
        risk_highlights=formatted_risks,
        disclaimer=disclaimer,
    )


def formatted_output_to_dict(output: FormattedOutput) -> Dict[str, Any]:
    """Convert FormattedOutput to dictionary for JSON serialization"""
    return {
        "overview": asdict(output.overview),
        "structured_overview": output.structured_overview,
        "summary_bullets": output.summary_bullets,
        "key_clauses_grouped": [asdict(g) for g in output.key_clauses_grouped],
        "risk_highlights": [asdict(r) for r in output.risk_highlights],
        "disclaimer": output.disclaimer,
    }
