from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from google.adk import Runner
from google.genai import types
from google.adk.sessions.in_memory_session_service import InMemorySessionService

from agent import root_agent
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

# Initialize the global session service and runner for the ADK agent
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name="studio_oracle",
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
    """
    try:
        new_msg = types.Content(parts=[types.Part.from_text(text=request.message)], role="user")
        events = runner.run(
            user_id=request.user_id,
            session_id=request.session_id,
            new_message=new_msg
        )
        
        response_text = ""
        for event in events:
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        response_text += part.text
        
        return {
            "status": "success",
            "response": response_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events (SSE) to deliver agent tokens in real time.
    """
    async def event_generator():
        try:
            new_msg = types.Content(parts=[types.Part.from_text(text=request.message)], role="user")
            async for event in runner.run_async(
                user_id=request.user_id,
                session_id=request.session_id,
                new_message=new_msg
            ):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            yield f"data: {part.text}\n\n"
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
