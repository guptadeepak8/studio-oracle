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



