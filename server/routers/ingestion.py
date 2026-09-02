import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from models.requests import IngestRequest
from ingestion.youtube import ingest_youtube_data
from ingestion.reddit import ingest_reddit_data
from services.campaign_service import CampaignService

router = APIRouter(tags=["Ingestion Pipelines"])

class RedditIngestRequest(BaseModel):
    query: Optional[str] = None

@router.post("/api/ingest")
@router.post("/api/ingest-youtube")
def ingest_data(request: IngestRequest):
    """Trigger on-demand YouTube comment ingestion and Gemini classification."""
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

@router.post("/api/campaigns/{content_id}/ingest-reddit")
def ingest_reddit_campaign_data(content_id: str, request: RedditIngestRequest):
    """Trigger Reddit audience discussion scraping and sentiment analysis."""
    try:
        camp = CampaignService.get_campaign_by_id(content_id)
        if not camp:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        query = request.query or (camp["target_terms"][0] if camp.get("target_terms") else camp["title"])
        res = ingest_reddit_data(content_id, query)
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reddit ingestion error: {str(e)}")
