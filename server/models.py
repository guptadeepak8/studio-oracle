from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"
    user_id: str = "default_user"

class IngestRequest(BaseModel):
    content_id: str
    query: str
    limit: int = 3
