from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field("default_session", max_length=100)
    user_id: str = Field("default_user", max_length=100)
    content_id: Optional[str] = None

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Message cannot be empty or whitespace only.")
        return clean

class IngestRequest(BaseModel):
    content_id: str = Field(..., min_length=1)
    query: str = Field(..., min_length=2, max_length=300)
    limit: int = Field(3, ge=1, le=10)
    max_comments: int = Field(500, ge=10, le=5000)

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        clean = v.strip()
        if clean.lower().startswith("http://"):
            raise ValueError("Insecure HTTP URLs are not allowed. Please use secure https:// URLs.")
        return clean

class CampaignCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    content_type: str = Field("movie", pattern=r"^(movie|show|franchise)$")
    description: str = Field(..., min_length=5, max_length=2000)
    release_date: Optional[str] = None
    target_terms: Optional[List[str]] = None

    @field_validator("title", "description")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Field cannot be empty or whitespace only.")
        return clean

    @field_validator("target_terms")
    @classmethod
    def validate_target_terms(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if not v:
            return v
        cleaned_terms = []
        for term in v:
            c = term.strip()
            if not c:
                continue
            if c.lower().startswith("http://"):
                raise ValueError(f"Insecure HTTP URL '{c}' is not allowed. Only HTTPS URLs (https://...) or search keywords are permitted.")
            cleaned_terms.append(c)
        if not cleaned_terms:
            raise ValueError("At least one non-empty target keyword or HTTPS URL is required.")
        return cleaned_terms

class CampaignStatusRequest(BaseModel):
    status: str = Field(..., pattern=r"^(active|stopped)$")
