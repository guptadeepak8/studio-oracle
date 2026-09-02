from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.requests import ChatRequest
from services.chat_service import chat_service

router = APIRouter(tags=["AI Agent Chat"])

@router.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    """Synchronous chat endpoint with session and campaign scoping."""
    try:
        response_text = chat_service.execute_chat(
            user_id=request.user_id,
            session_id=request.session_id,
            message=request.message,
            content_id=request.content_id
        )
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/chat/stream")
def chat_stream_endpoint(request: ChatRequest):
    """SSE Streaming chat endpoint with session and campaign scoping."""
    try:
        return StreamingResponse(
            chat_service.stream_chat(
                user_id=request.user_id,
                session_id=request.session_id,
                message=request.message,
                content_id=request.content_id
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
