from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any
from models.requests import CampaignCreateRequest, CampaignStatusRequest
from services.campaign_service import CampaignService
from tools.movie import create_content_record
from ingestion.youtube import ingest_youtube_data

router = APIRouter(tags=["Campaigns"])

@router.get("/api/movies")
@router.get("/api/campaigns")
def get_campaigns() -> List[Dict[str, Any]]:
    try:
        return CampaignService.get_all_campaigns()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/api/campaigns")
def create_campaign(request: CampaignCreateRequest, background_tasks: BackgroundTasks):
    try:
        content_id = create_content_record(
            title=request.title,
            content_type=request.content_type,
            description=request.description,
            release_date=request.release_date,
            target_terms=request.target_terms
        )
        CampaignService.set_status(content_id, "active")

        # If user explicitly requested 100k benchmark scale:
        if request.initial_volume and request.initial_volume >= 10000:
            from benchmark_100k import seed_100k_for_campaign
            background_tasks.add_task(seed_100k_for_campaign, content_id, request.initial_volume)
        else:
            initial_query = request.target_terms[0] if (request.target_terms and len(request.target_terms) > 0) else request.title
            vol = min(max(request.initial_volume or 1000, 100), 2500)
            background_tasks.add_task(ingest_youtube_data, content_id, initial_query, limit=3, max_comments_per_video=vol)

        # Ingest live Google Search Press Grounding alongside YouTube
        from services.search_service import GoogleSearchService
        background_tasks.add_task(GoogleSearchService.search_and_ground_campaign, content_id)

        return {
            "status": "success",
            "content_id": content_id,
            "message": f"Campaign '{request.title}' successfully registered."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register campaign: {str(e)}")

@router.delete("/api/campaigns/{content_id}")
def delete_campaign(content_id: str):
    try:
        CampaignService.delete_campaign(content_id)
        return {
            "status": "success",
            "message": f"Campaign {content_id} and all related data purged."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete campaign: {str(e)}")

@router.get("/api/campaigns/{content_id}/status")
def get_campaign_status(content_id: str):
    try:
        return {"content_id": content_id, "status": CampaignService.get_status(content_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/campaigns/{content_id}/status")
def update_campaign_status(content_id: str, request: CampaignStatusRequest):
    try:
        if request.status not in ["active", "stopped"]:
            raise HTTPException(status_code=400, detail="Status must be 'active' or 'stopped'")
        CampaignService.set_status(content_id, request.status)
        return {"status": "success", "content_id": content_id, "new_status": request.status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/campaigns/{content_id}/analytics")
def get_campaign_analytics(content_id: str):
    try:
        return CampaignService.get_analytics(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics query error: {str(e)}")

@router.get("/api/campaigns/{content_id}/platforms")
def get_campaign_platforms(content_id: str):
    try:
        return CampaignService.get_platform_breakdown(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Platform query error: {str(e)}")

@router.get("/api/campaigns/{content_id}/drops")
def get_campaign_drops(content_id: str):
    try:
        return CampaignService.get_drops(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drops query error: {str(e)}")

@router.get("/api/campaigns/{content_id}/timeline")
def get_campaign_timeline(content_id: str):
    try:
        return CampaignService.get_timeline(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline query error: {str(e)}")

@router.get("/api/campaigns/{content_id}/pulse")
def get_campaign_pulse(content_id: str):
    try:
        analytics = CampaignService.get_analytics(content_id)
        sentiment = analytics.get("sentiment", {})
        pos_pct = sentiment.get("posPercent", 0)
        neg_pct = sentiment.get("negPercent", 0)
        themes = analytics.get("themes", [])
        
        if pos_pct == 0 and neg_pct == 0:
            return {"pulseSummary": "Awaiting audience reactions from video drops."}
            
        top_theme = themes[0]["name"] if themes else "General Reception"
        summary = f"Audience reception is {pos_pct}% positive, with major discussion focused on #{top_theme}."
        return {"pulseSummary": summary}
    except Exception:
        return {"pulseSummary": "Awaiting audience reactions from video drops."}
