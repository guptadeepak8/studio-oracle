import uuid
from fastapi import APIRouter, HTTPException
from models.decisions import CampaignDecisionsResponse
from services.decision_service import DecisionService

router = APIRouter(tags=["Decision Intelligence"])

@router.get("/api/campaigns/{content_id}/decisions", response_model=CampaignDecisionsResponse)
def get_campaign_decisions(content_id: str):
    """
    Retrieve pre-computed or live synthesized 6-tier Decision Intelligence artifacts.
    """
    try:
        uuid.UUID(content_id)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid campaign content_id format. Must be a valid UUID.")

    try:
        return DecisionService.get_or_investigate_decisions(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decision synthesis error: {str(e)}")

@router.post("/api/campaigns/{content_id}/decisions/investigate")
def trigger_agent_investigation(content_id: str):
    """
    Trigger an on-demand deep investigation by the dedicated Campaign Agent.
    """
    try:
        uuid.UUID(content_id)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid campaign content_id format. Must be a valid UUID.")
    try:
        decisions_resp = DecisionService.get_or_investigate_decisions(content_id)
        try:
            from core.pubsub import publish_campaign_event_sync
            publish_campaign_event_sync(str(content_id), "DECISIONS_UPDATED", {"content_id": content_id})
        except Exception:
            pass
        return {
            "status": "success",
            "message": f"Campaign investigation completed for {content_id}.",
            "data": decisions_resp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation failed: {str(e)}")

