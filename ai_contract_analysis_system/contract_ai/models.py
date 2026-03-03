from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import List


class ClauseType(Enum):
    PAYMENT = auto()
    TERMINATION = auto()
    CONFIDENTIALITY = auto()
    LIABILITY = auto()
    PENALTY = auto()
    GOVERNING_LAW = auto()
    OTHER = auto()


class RiskLevel(Enum):
    LOW = auto()
    MEDIUM = auto()
    HIGH = auto()


@dataclass
class DocumentText:
    source_name: str
    content: str
    num_pages: int | None = None
    source_type: str = "pdf"  # or "text"


@dataclass
class Clause:
    id: int
    type: ClauseType
    text: str
    start_char: int | None = None
    end_char: int | None = None
    page_hint: int | None = None


@dataclass
class RiskAssessment:
    clause_id: int
    level: RiskLevel
    reasons: List[str]


@dataclass
class AnalysisResult:
    document: DocumentText
    clauses: List[Clause]
    risks: List[RiskAssessment]
    summary: str
    disclaimer: str