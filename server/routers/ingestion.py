from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from models.requests import IngestRequest
from ingestion.youtube import ingest_youtube_data
from services.search_service import GoogleSearchService

router = APIRouter(tags=["Ingestion & Grounding"])

class SearchGroundingRequest(BaseModel):
    query: Optional[str] = None

@router.post("/api/ingest")
@router.post("/api/ingest-youtube")
def ingest_data(request: IngestRequest):
    try:
        res = ingest_youtube_data(
            request.content_id,
            request.query,
            limit=request.limit,
            max_comments_per_video=request.max_comments
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube ingestion error: {str(e)}")

@router.post("/api/campaigns/{content_id}/ingest-web-grounding")
@router.post("/api/campaigns/{content_id}/ingest-reddit")
def ground_campaign_web_search(content_id: str, request: SearchGroundingRequest):
    """
    Triggers real-time Google Search Grounding to pull live press reviews,
    box-office tracking, and critic consensus into ClickHouse.
    """
    try:
        res = GoogleSearchService.search_and_ground_campaign(content_id, request.query)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Search Grounding error: {str(e)}")
