from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from google.adk import Runner
from google.genai import types
from google.adk.sessions.sqlite_session_service import SqliteSessionService

from agent import app as agent_app
from ingestion.youtube import ingest_youtube_data
from models import ChatRequest, IngestRequest
import db

app = FastAPI(title="StudioOracle API")

# Enable CORS for the Next.js frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the persistent SQLite session service and runner for the ADK agent
session_service = SqliteSessionService(db_path="sessions.db")
runner = Runner(
    app=agent_app,
    session_service=session_service,
    auto_create_session=True,
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/movies")
def get_movies():
    """
    Retrieve all movie/series content records from ClickHouse.
    """
    try:
        return db.fetch_movies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/comments/{content_id}")
def get_comments(content_id: str):
    """
    Retrieve audience feedback comments for a specific movie UUID from ClickHouse.
    """
    try:
        return db.fetch_comments(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Standard synchronous chat response from the StudioOracle ADK agent.
    Deduplicates intermediate progress chunks and aggregates the final text response.
    """
    try:
        new_msg = types.Content(parts=[types.Part.from_text(text=request.message)], role="user")
        events = runner.run_async(
            user_id=request.user_id,
            session_id=request.session_id,
            new_message=new_msg
        )
        
        response_text = ""
        accumulated_partials = ""
        async for event in events:
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        if event.partial:
                            accumulated_partials += part.text
                        else:
                            # Final full response is stored in response_text
                            response_text = part.text
        
        # Use final response if available; fallback to accumulated partial chunks
        final_response = response_text if response_text else accumulated_partials
        
        return {
            "status": "success",
            "response": final_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events (SSE) to deliver agent tokens in real time.
    Safely handles both progressive chunks and final aggregated full-text responses without duplication.
    """
    async def event_generator():
        try:
            new_msg = types.Content(parts=[types.Part.from_text(text=request.message)], role="user")
            yielded_text = ""
            async for event in runner.run_async(
                user_id=request.user_id,
                session_id=request.session_id,
                new_message=new_msg
            ):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            if event.partial:
                                # Progressive stream chunk
                                yield f"data: {part.text}\n\n"
                                yielded_text += part.text
                            else:
                                # Final complete response event
                                full_text = part.text
                                if yielded_text and full_text.startswith(yielded_text):
                                    remaining = full_text[len(yielded_text):]
                                    if remaining:
                                        yield f"data: {remaining}\n\n"
                                elif not yielded_text:
                                    # Fallback when progressive streaming was disabled/inactive
                                    yield f"data: {full_text}\n\n"
                                    yielded_text = full_text
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/ingest")
def ingest(request: IngestRequest):
    """
    Manually trigger YouTube comment ingestion for a given content UUID.
    """
    try:
        res = ingest_youtube_data(request.content_id, request.query, request.limit)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
