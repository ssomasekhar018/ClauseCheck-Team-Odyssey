from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict
from contextlib import asynccontextmanager
import uuid
import json
import logging
import os
import tempfile
import shutil
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from app.database import init_db, get_db
from app.models import Case, Conversation, Message
from app.schemas import CaseCreate, CaseResponse, HelpRequest, AnalysisResponse, HelpResponse
from app.agents.opposing_counsel import OpposingCounselAgent
from app.agents.observer import ObserverAgent
from app.agents.analyzer import AnalyzerAgent
from app.agents.document_extractor import DocumentExtractorAgent
from app.utils.document_parser import extract_text_from_file

# Initialize database and AI agents on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (if needed)

# Initialize FastAPI app with lifespan
app = FastAPI(title="Law Simulation API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI agents
opposing_agent = OpposingCounselAgent()
observer_agent = ObserverAgent()
analyzer_agent = AnalyzerAgent()
document_extractor = DocumentExtractorAgent()

# In-memory storage for active sessions (in production, use Redis)
active_sessions: Dict[str, Dict] = {}


def _restore_session_from_db(session_id: str, db: Session) -> Dict | None:
    try:
        conversation = db.query(Conversation).filter(Conversation.session_id == session_id).first()
        if not conversation:
            return None
        case = db.query(Case).filter(Case.id == conversation.case_id).first()
        msgs = (
            db.query(Message)
            .filter(Message.conversation_id == conversation.id)
            .order_by(Message.timestamp.asc())
            .all()
        )
        return {
            "case_id": case.id,
            "conversation_id": conversation.id,
            "case_details": {
                "case_type": case.case_type,
                "facts": case.facts,
                "charges": case.charges,
                "evidence": case.evidence,
            },
            "messages": [{"role": m.role, "content": m.content} for m in msgs],
        }
    except Exception as e:
        logger.error(f"Failed to restore session {session_id} from DB: {e}")
        return None


@app.post("/api/case/create", response_model=CaseResponse)
async def create_case(case_data: CaseCreate, db: Session = Depends(get_db)):
    """Create a new case and simulation session"""
    try:
        # Validate input data
        if not case_data.facts or not case_data.charges:
            raise HTTPException(status_code=400, detail="Case facts and charges are required")
            
        # Create case in database
        new_case = Case(
            case_type=case_data.case_type,
            facts=case_data.facts,
            charges=case_data.charges,
            evidence=case_data.evidence
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        
        # Create conversation session
        session_id = str(uuid.uuid4())
        new_conversation = Conversation(
            case_id=new_case.id,
            session_id=session_id
        )
        db.add(new_conversation)
        db.commit()
        db.refresh(new_conversation)
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating case: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating case")
    
    # Store in active sessions
    active_sessions[session_id] = {
        "case_id": new_case.id,
        "conversation_id": new_conversation.id,
        "case_details": {
            "case_type": case_data.case_type,
            "facts": case_data.facts,
            "charges": case_data.charges,
            "evidence": case_data.evidence
        },
        "messages": []
    }
    
    return CaseResponse(
        id=new_case.id,
        case_type=new_case.case_type,
        facts=new_case.facts,
        charges=new_case.charges,
        evidence=new_case.evidence,
        session_id=session_id
    )


@app.post("/api/document/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document and extract case details from it"""
    
    # Validate file type
    allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Create temporary file to save uploaded document
    temp_file = None
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        logger.info(f"Processing uploaded file: {file.filename} ({file_extension})")
        
        # Extract text from document
        document_text = extract_text_from_file(temp_file_path, file_extension)
        
        if not document_text or len(document_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Document appears to be empty or too short. Please ensure the document contains readable text."
            )
        
        logger.info(f"Extracted {len(document_text)} characters from document")
        
        # Extract case details using AI
        extracted_details = await document_extractor.extract_case_details(document_text)
        
        logger.info("Case details extracted successfully from document")
        
        return {
            "success": True,
            "case_details": extracted_details,
            "document_text_preview": document_text[:500] + "..." if len(document_text) > 500 else document_text
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp file {temp_file_path}: {str(e)}")


@app.websocket("/ws/simulation/{session_id}")
async def simulation_websocket(websocket: WebSocket, session_id: str, db: Session = Depends(get_db)):
    """WebSocket for real-time courtroom simulation"""
    # Ensure session exists; try to restore from DB if missing (handles server reloads)
    if session_id not in active_sessions:
        restored = _restore_session_from_db(session_id, db)
        if restored:
            active_sessions[session_id] = restored
        else:
            # Accept then close with error so the client gets a clean signal
            await websocket.accept()
            await websocket.send_json({"error": "Session not found"})
            await websocket.close(code=4404)
            return

    try:
        await websocket.accept()
    except Exception as e:
        logger.error(f"WebSocket accept failed: {e}")
        try:
            await websocket.close(code=1011)
        finally:
            return

    session_data = active_sessions[session_id]
    
    # Validate session
    if session_id not in active_sessions:
        await websocket.send_json({"error": "Invalid session ID"})
        await websocket.close()
        return
    
    session_data = active_sessions[session_id]
    
    try:
        # Send initial greeting from opposing counsel
        initial_message = """Your Honor, may it please the Court. I appear for the prosecution/opposition in this matter and am ready to proceed.

I shall place my submissions in due course, with reference to the applicable provisions (IPC, CrPC, Evidence Act, Constitution) and relevant precedents. I request the Court's leave to commence."""
        
        # Save to database
        db_message = Message(
            conversation_id=session_data["conversation_id"],
            role="opponent",
            content=initial_message
        )
        db.add(db_message)
        db.commit()
        
        session_data["messages"].append({
            "role": "opponent",
            "content": initial_message
        })
        
        await websocket.send_json({
            "type": "message",
            "role": "opponent",
            "content": initial_message
        })
        
        # Listen for lawyer messages
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "lawyer_message":
                lawyer_message = message_data.get("content")
                
                # Save lawyer message
                db_message = Message(
                    conversation_id=session_data["conversation_id"],
                    role="lawyer",
                    content=lawyer_message
                )
                db.add(db_message)
                db.commit()
                
                session_data["messages"].append({
                    "role": "lawyer",
                    "content": lawyer_message
                })
                
                # Get opponent response
                logger.info(f"Getting response from opposing counsel for session {session_id}")
                opponent_response = await opposing_agent.respond(
                    case_details=session_data["case_details"],
                    conversation_history=session_data["messages"],
                    lawyer_message=lawyer_message
                )
                logger.info(f"Opponent response received: {opponent_response[:50]}...")
                
                # Save opponent message
                db_message = Message(
                    conversation_id=session_data["conversation_id"],
                    role="opponent",
                    content=opponent_response
                )
                db.add(db_message)
                db.commit()
                
                session_data["messages"].append({
                    "role": "opponent",
                    "content": opponent_response
                })
                
                # Send to client
                await websocket.send_json({
                    "type": "message",
                    "role": "opponent",
                    "content": opponent_response
                })
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket for session {session_id}: {str(e)}", exc_info=True)
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass


@app.post("/api/help", response_model=HelpResponse)
async def get_help(help_request: HelpRequest):
    """Get assistance from the observer/mentor AI"""
    
    if help_request.session_id not in active_sessions:
        logger.warning(f"Help requested for invalid session: {help_request.session_id}")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = active_sessions[help_request.session_id]
    
    try:
        logger.info(f"Help requested - Type: {help_request.help_type}, Session: {help_request.session_id}")
        help_response_text = await observer_agent.provide_help(
            case_details=session_data["case_details"],
            conversation_history=session_data["messages"],
            help_type=help_request.help_type,
            custom_query=help_request.custom_query
        )
        
        logger.info(f"Help response generated successfully")
        
        # Parse response if it's "understand" type (should have EXPLANATION and READY_RESPONSE)
        explanation = help_response_text
        ready_response = None
        
        if help_request.help_type == "understand":
            # Try to parse the structured response
            if "READY_RESPONSE:" in help_response_text:
                parts = help_response_text.split("READY_RESPONSE:")
                if len(parts) == 2:
                    explanation_part = parts[0]
                    # Remove "EXPLANATION:" if present
                    if "EXPLANATION:" in explanation_part:
                        explanation = explanation_part.split("EXPLANATION:")[-1].strip()
                    else:
                        explanation = explanation_part.strip()
                    ready_response = parts[1].strip()
            # If no structured format, try to extract a ready response from the explanation
            elif len(help_response_text) > 100:
                # For non-structured responses, use the explanation as-is
                # and generate a simple ready response
                explanation = help_response_text
                ready_response = "Thank you for that clarification, Your Honor. I'd like to address the substance of the case now."
        
        return HelpResponse(
            content=explanation,
            ready_response=ready_response
        )
    
    except Exception as e:
        logger.error(f"Error in help endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/{session_id}", response_model=AnalysisResponse)
async def analyze_case(session_id: str, db: Session = Depends(get_db)):
    """Analyze the case and provide win probability and cons"""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = active_sessions[session_id]
    
    try:
        win_prob, cons = await analyzer_agent.analyze_case(
            case_details=session_data["case_details"],
            conversation_history=session_data["messages"]
        )
        
        # Update database
        conversation = db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).first()
        
        if conversation:
            conversation.win_probability = win_prob
            conversation.case_cons = "\n".join(cons)
            db.commit()
        
        return AnalysisResponse(
            win_probability=win_prob,
            case_cons=cons
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Law Simulation API is running"}


if __name__ == "__main__":
    import uvicorn
    # Use port 8000 to match frontend configuration and user requirement
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
