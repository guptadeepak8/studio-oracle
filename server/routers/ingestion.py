from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from models.requests import IngestRequest
from ingestion.youtube import ingest_youtube_data, search_youtube_trailers
from services.search_service import GoogleSearchService

router = APIRouter(tags=["Ingestion & Grounding"])

class SearchGroundingRequest(BaseModel):
    query: Optional[str] = None

@router.get("/api/youtube/search-trailers")
def search_trailers(q: str = Query(..., min_length=1, max_length=200), limit: int = Query(6, ge=1, le=10)):
    """
    Searches YouTube Data API v3 for official movie trailers and promotional video teasers.
    """
    try:
        results = search_youtube_trailers(q, limit=limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube trailer search error: {str(e)}")

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
