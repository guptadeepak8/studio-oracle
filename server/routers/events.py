import json
import asyncio
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from core.pubsub import subscribe_campaign_events

router = APIRouter(prefix="/api/campaigns", tags=["events"])

@router.get("/{campaign_id}/stream")
async def stream_campaign_events(campaign_id: str, request: Request):
    """
    Server-Sent Events (SSE) endpoint for real-time campaign updates.
    Streams events (INGESTION_STARTED, INGESTION_PROGRESS, INGESTION_COMPLETED, DECISIONS_UPDATED, HEARTBEAT).
    """
    async def event_generator():
        try:
            async for event in subscribe_campaign_events(campaign_id):
                if await request.is_disconnected():
                    break
                event_name = event.get("event", "message")
                data_str = json.dumps(event)
                yield f"event: {event_name}\ndata: {data_str}\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.post("/{campaign_id}/test-event")
async def publish_test_event(campaign_id: str, request: Request):
    """
    HTTP endpoint to publish a test event to all SSE subscribers of a campaign.
    """
    from core.pubsub import publish_campaign_event
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    
    event_type = body.get("event", "INGESTION_COMPLETED")
    event_data = body.get("data", {"status": "test_delivered"})
    await publish_campaign_event(campaign_id, event_type, event_data)
    return {"status": "published", "event": event_type, "campaign_id": campaign_id}


