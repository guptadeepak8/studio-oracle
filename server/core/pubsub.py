import os
import json
import asyncio
from typing import Dict, Set, AsyncGenerator, Any
from datetime import datetime

# In-memory subscriber registry: campaign_id -> Set[asyncio.Queue]
_subscribers: Dict[str, Set[asyncio.Queue]] = {}
_lock = asyncio.Lock()

async def publish_campaign_event(campaign_id: str, event_type: str, data: Dict[str, Any] | None = None) -> None:
    """
    Publish a real-time event for a specific campaign.
    Delivers to all active SSE client queues and Redis channel if configured.
    """
    if data is None:
        data = {}
    
    payload = {
        "event": event_type,
        "campaign_id": str(campaign_id),
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }
    
    # 1. Deliver to in-memory SSE subscribers
    cid = str(campaign_id)
    async with _lock:
        queues = _subscribers.get(cid, set()).copy()
        # Also broadcast to global subscribers (e.g. all-campaigns overview)
        global_queues = _subscribers.get("*", set()).copy()
        target_queues = queues.union(global_queues)

    for q in target_queues:
        try:
            q.put_nowait(payload)
        except Exception:
            pass

    # 2. Publish to Redis if configured
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            import redis.asyncio as aioredis
            r = aioredis.from_url(redis_url)
            await r.publish(f"campaign:{cid}", json.dumps(payload))
            await r.close()
        except Exception as e:
            print(f"Redis publish warning: {e}")

def publish_campaign_event_sync(campaign_id: str, event_type: str, data: Dict[str, Any] | None = None) -> None:
    """Synchronous wrapper for publishing from background threads or workers."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(publish_campaign_event(campaign_id, event_type, data), loop)
        else:
            loop.run_until_complete(publish_campaign_event(campaign_id, event_type, data))
    except RuntimeError:
        # If called in a thread without a loop:
        try:
            new_loop = asyncio.new_event_loop()
            new_loop.run_until_complete(publish_campaign_event(campaign_id, event_type, data))
            new_loop.close()
        except Exception as err:
            print(f"Failed to publish event sync: {err}")

async def subscribe_campaign_events(campaign_id: str) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Subscribe to live events for a campaign. Yields event payloads as they arrive.
    """
    cid = str(campaign_id)
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    
    async with _lock:
        if cid not in _subscribers:
            _subscribers[cid] = set()
        _subscribers[cid].add(queue)

    try:
        while True:
            # Wait for next event with a periodic heartbeat to detect disconnected clients
            try:
                event = await asyncio.wait_for(queue.get(), timeout=15.0)
                yield event
            except asyncio.TimeoutError:
                # Send keep-alive heartbeat ping
                yield {
                    "event": "HEARTBEAT",
                    "campaign_id": cid,
                    "timestamp": datetime.utcnow().isoformat(),
                    "data": {"status": "alive"}
                }
    finally:
        async with _lock:
            if cid in _subscribers:
                _subscribers[cid].discard(queue)
                if not _subscribers[cid]:
                    _subscribers.pop(cid, None)

