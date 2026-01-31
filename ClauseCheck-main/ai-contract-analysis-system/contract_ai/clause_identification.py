from __future__ import annotations

from typing import List

from .models import Clause, ClauseType
from .nlp_core import split_into_sentences


CLAUSE_KEYWORDS = {
    ClauseType.PAYMENT: [
        "payment", "fee", "fees", "compensation", "invoice", "billing", "remuneration",
        "salary", "wage", "price", "cost", "charge", "amount due", "payable", "reimbursement",
        "royalty", "commission", "installment", "down payment", "advance payment"
    ],
    ClauseType.TERMINATION: [
        "termination", "terminate", "expiry", "expire", "suspension", "cancel", "cancellation",
        "end of term", "expiration", "discontinue", "cease", "withdraw", "revoke", "rescind"
    ],
    ClauseType.CONFIDENTIALITY: [
        "confidential", "confidentiality", "non-disclosure", "nda", "proprietary", "trade secret",
        "non-compete", "non-solicitation", "privacy", "data protection", "restricted information"
    ],
    ClauseType.LIABILITY: [
        "liability", "liable", "damages", "limitation of liability", "indemnification", "indemnify",
        "hold harmless", "warranty", "guarantee", "warrant", "defect", "negligence", "tort",
        "consequential damages", "punitive damages", "liquidated damages"
    ],
    ClauseType.PENALTY: [
        "penalty", "penalties", "liquidated damages", "fine", "late fee", "default", "breach",
        "forfeiture", "sanction", "punishment", "penal", "penalize", "penalization"
    ],
    ClauseType.GOVERNING_LAW: [
        "governing law", "jurisdiction", "venue", "choice of law", "applicable law", "legal system",
        "courts of", "dispute resolution", "arbitration", "mediation", "legal proceedings"
    ],
}


def _guess_clause_type(sentence: str) -> ClauseType:
    lowered = sentence.lower()
    for ctype, keywords in CLAUSE_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            return ctype
    return ClauseType.OTHER


def identify_clauses(text: str) -> List[Clause]:
    """Identify clauses from raw contract text using improved heuristics.

    Groups related sentences into meaningful clauses for better analysis.
    """

    sentences = split_into_sentences(text)
    clauses: list[Clause] = []

    if not sentences:
        return clauses

    # Group sentences into clauses based on context
    current_clause_sentences = []
    current_clause_type = ClauseType.OTHER
    clause_id = 1
    offset = 0

    for i, sent in enumerate(sentences):
        if not sent.strip():
            continue

        sent_type = _guess_clause_type(sent)
        
        # Start a new clause if:
        # 1. We hit a new clause type and have accumulated sentences
        # 2. Current sentence is significantly different from accumulated type
        # 3. Sentence starts with clause markers (numbered, "WHEREAS", etc.)
        should_start_new = False
        
        if current_clause_sentences:
            # Check if this sentence belongs to current clause or starts new one
            sent_lower = sent.lower().strip()
            
            # Clause markers that indicate new clause
            clause_markers = [
                "whereas", "now therefore", "in consideration", "the parties agree",
                "section", "article", "clause", "paragraph", "subsection"
            ]
            
            # If sentence has strong clause marker, start new
            if any(marker in sent_lower[:50] for marker in clause_markers):
                should_start_new = True
            # If type changed significantly, start new
            elif sent_type != current_clause_type and sent_type != ClauseType.OTHER:
                should_start_new = True
            # If accumulated clause is getting too long (>500 chars), start new
            elif sum(len(s) for s in current_clause_sentences) > 500:
                should_start_new = True
        else:
            # First sentence, just set the type
            current_clause_type = sent_type

        if should_start_new and current_clause_sentences:
            # Save current clause
            clause_text = " ".join(current_clause_sentences).strip()
            start_idx = text.find(current_clause_sentences[0], offset)
            if start_idx == -1:
                start_idx = offset
            end_idx = start_idx + len(clause_text)
            
            clauses.append(
                Clause(
                    id=clause_id,
                    type=current_clause_type,
                    text=clause_text,
                    start_char=start_idx,
                    end_char=end_idx,
                    page_hint=None,
                )
            )
            clause_id += 1
            offset = end_idx
            current_clause_sentences = []
            current_clause_type = sent_type

        # Add sentence to current clause
        current_clause_sentences.append(sent.strip())
        if sent_type != ClauseType.OTHER:
            current_clause_type = sent_type

    # Don't forget the last clause
    if current_clause_sentences:
        clause_text = " ".join(current_clause_sentences).strip()
        start_idx = text.find(current_clause_sentences[0], offset)
        if start_idx == -1:
            start_idx = offset
        end_idx = start_idx + len(clause_text)
        
        clauses.append(
            Clause(
                id=clause_id,
                type=current_clause_type,
                text=clause_text,
                start_char=start_idx,
                end_char=end_idx,
                page_hint=None,
            )
        )

    return clauses
