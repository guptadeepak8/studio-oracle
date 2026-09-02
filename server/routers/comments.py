from fastapi import APIRouter, HTTPException
from services.campaign_service import CampaignService

router = APIRouter(tags=["Audience Comments & Evidence"])

@router.get("/api/comments/{content_id}")
def get_comments(content_id: str):
    """Retrieve comments for a specific campaign content UUID from ClickHouse."""
    try:
        return CampaignService.get_comments(content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comments query error: {str(e)}")

@router.get("/api/comments/detail/{comment_id}")
def get_comment_detail(comment_id: str):
    """Retrieve raw ClickHouse comment metadata and verbatim text for Evidence Drawer."""
    try:
        detail = CampaignService.get_comment_detail(comment_id)
        if not detail:
            raise HTTPException(status_code=404, detail="Comment evidence record not found")
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error fetching comment: {str(e)}")

