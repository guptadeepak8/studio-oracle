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
from models import ChatRequest, IngestRequest, CampaignCreateRequest, CampaignStatusRequest
from tools.movie import create_content_record
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

# Initialize persistent session service
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
    Retrieve all campaign content records from ClickHouse combined with SQLite status.
    """
    try:
        return db.fetch_movies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/comments/{content_id}")
def get_comments(content_id: str):
    """
    Retrieve comments for a specific campaign content UUID from ClickHouse.
    """
    try:
        return db.fetch_comments(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/campaigns")
def create_campaign(request: CampaignCreateRequest):
    """
    Directly register a new campaign content record in ClickHouse.
    """
    try:
        content_id = create_content_record(
            title=request.title,
            content_type=request.content_type,
            description=request.description,
            release_date=request.release_date,
            target_terms=request.target_terms
        )
        # Initialize SQLite tracking status as active
        db.set_campaign_status(content_id, "active")
        return {
            "status": "success",
            "content_id": content_id,
            "title": request.title
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/campaigns/{content_id}/status")
def update_campaign_status(content_id: str, request: CampaignStatusRequest):
    """
    Update a campaign's tracking status in SQLite.
    """
    if request.status not in ["active", "stopped", "collecting"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    try:
        db.set_campaign_status(content_id, request.status)
        return {
            "status": "success",
            "content_id": content_id,
            "campaign_status": request.status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/campaigns/{content_id}")
def delete_campaign(content_id: str):
    """
    Safe cascading delete of a campaign and all its associated ClickHouse audience logs.
    """
    try:
        db.delete_campaign_records(content_id)
        return {
            "status": "success",
            "content_id": content_id,
            "message": "Campaign and associated audience feedback deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Standard synchronous chat response from the StudioOracle ADK agent.
    """
    try:
        message_text = request.message
        if request.content_id:
            movie = db.fetch_movie_by_id(request.content_id)
            if movie:
                message_text = (
                    f"[SYSTEM INSTRUCTION: You are restricted to the campaign for '{movie['title']}' "
                    f"(content_id: '{movie['content_id']}', type: '{movie['content_type']}'). "
                    f"All database queries and analysis MUST filter strictly by content_id = '{movie['content_id']}'. "
                    f"Do not mix context with other films.]\n\n{request.message}"
                )
        new_msg = types.Content(parts=[types.Part.from_text(text=message_text)], role="user")
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
                          response_text = part.text
        
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
    Streaming chat endpoint using Server-Sent Events (SSE).
    """
    async def event_generator():
        try:
            message_text = request.message
            if request.content_id:
                movie = db.fetch_movie_by_id(request.content_id)
                if movie:
                    message_text = (
                        f"[SYSTEM INSTRUCTION: You are restricted to the campaign for '{movie['title']}' "
                        f"(content_id: '{movie['content_id']}', type: '{movie['content_type']}'). "
                        f"All database queries and analysis MUST filter strictly by content_id = '{movie['content_id']}'. "
                        f"Do not mix context with other films.]\n\n{request.message}"
                    )
            new_msg = types.Content(parts=[types.Part.from_text(text=message_text)], role="user")
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
                                yield f"data: {part.text}\n\n"
                                yielded_text += part.text
                            else:
                                full_text = part.text
                                if yielded_text and full_text.startswith(yielded_text):
                                    remaining = full_text[len(yielded_text):]
                                    if remaining:
                                        yield f"data: {remaining}\n\n"
                                elif not yielded_text:
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
