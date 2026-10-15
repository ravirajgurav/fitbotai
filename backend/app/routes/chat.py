import logging
from typing import List, Literal, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])
ai_service = AIService()

class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=10000)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: List[HistoryItem] = Field(default_factory=list)
    persona: Optional[Literal["hypertrophy", "hiit", "calisthenics", "science"]] = "hypertrophy"

class ChatResponse(BaseModel):
    reply: str
    model: str
    persona: Optional[str] = "hypertrophy"

class HealthResponse(BaseModel):
    status: str
    backend: str
    ai_provider: str
    model: str
    api_key_configured: bool
    message: Optional[str] = None

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """
    Returns real backend status and AI configuration without exposing secret keys.
    """
    info = ai_service.get_info()
    is_configured = info["configured"]

    return HealthResponse(
        status="ok" if is_configured else "degraded",
        backend="online",
        ai_provider=info["provider"],
        model=info["model"],
        api_key_configured=is_configured,
        message="FitBot AI backend is fully operational" if is_configured else "Backend running; AI API key required in .env",
    )

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Receives user query, history, and persona, consults the AI gym trainer prompt, and returns the AI reply.
    """
    clean_message = request.message.strip()
    if not clean_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat message cannot be empty.",
        )

    # Convert history items to dicts
    history_dicts = [{"role": h.role, "content": h.content} for h in request.history]
    active_persona = request.persona or "hypertrophy"

    try:
        reply = await ai_service.generate_response(clean_message, history_dicts, active_persona)
        return ChatResponse(
            reply=reply,
            model=ai_service.get_info()["model"],
            persona=active_persona,
        )
    except ValueError as val_err:
        logger.warning(f"Configuration error: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except RuntimeError as run_err:
        logger.error(f"AI Service runtime error: {run_err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(run_err),
        )
    except Exception as exc:
        logger.exception("Unexpected error in chat endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected server error occurred while generating your workout advice.",
        )
