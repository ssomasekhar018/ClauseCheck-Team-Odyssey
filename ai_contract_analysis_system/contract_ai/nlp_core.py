from __future__ import annotations

from functools import lru_cache
from typing import List

try:
    import spacy  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    spacy = None


@lru_cache(maxsize=1)
def get_nlp():
    """Lazily load a small English spaCy model, if available.

    The system is designed to function even if spaCy or the model is not
    installed; in that case, simple rule-based fallbacks are used in other
    modules.
    """

    if spacy is None:
        return None

    try:
        return spacy.load("en_core_web_sm")
    except Exception:
        return None


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences using spaCy if available, else a simple split."""

    nlp = get_nlp()
    if nlp is None:
        # Very naive fallback
        return [s.strip() for s in text.split(".") if s.strip()]

    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if sent.text.strip()]


def extract_parties(text: str) -> List[str]:
    """Heuristically extract party names from the contract text.

    Uses spaCy NER when available and also looks for common introduction
    patterns like "This Agreement is between".
    """

    parties: list[str] = []

    nlp = get_nlp()
    if nlp is not None:
        doc = nlp(text[:4000])  # limit for performance
        orgs = {ent.text.strip() for ent in doc.ents if ent.label_ in {"ORG", "PERSON"}}
        parties.extend(sorted(orgs))

    # Simple pattern-based hints
    lowered = text.lower()
    marker = "this agreement is between"
    if marker in lowered:
        segment = text[lowered.index(marker) : lowered.index(marker) + 500]
        # crude split around "and"/"," to find candidate party strings
        for chunk in segment.split("and"):
            cleaned = chunk.replace("this agreement is between", "").strip(" .,:;\n")
            if 3 <= len(cleaned) <= 120 and cleaned not in parties:
                parties.append(cleaned)

    return parties[:5]
