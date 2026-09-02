from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"
    user_id: str = "default_user"
    content_id: Optional[str] = None

class IngestRequest(BaseModel):
    content_id: str
    query: str
    limit: int = 3
    max_comments: int = 500

class CampaignCreateRequest(BaseModel):
    title: str
    content_type: str = "movie"
    description: str
    release_date: Optional[str] = None
    target_terms: Optional[List[str]] = None

class CampaignStatusRequest(BaseModel):
    status: str
