from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CaseCreate(BaseModel):
    case_type: str
    facts: str
    charges: str
    evidence: Optional[str] = None

class CaseResponse(BaseModel):
    id: int
    case_type: str
    facts: str
    charges: str
    evidence: Optional[str]
    session_id: str
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    role: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class HelpRequest(BaseModel):
    session_id: str
    help_type: str  # "understand" or "custom"
    custom_query: Optional[str] = None

class AnalysisResponse(BaseModel):
    win_probability: float
    case_cons: List[str]

class HelpResponse(BaseModel):
    content: str
    ready_response: Optional[str] = None