import asyncio
import json
import httpx
import uuid

async def test_sse_stream():
    test_campaign_id = "test-campaign-" + uuid.uuid4().hex[:6]
    stream_url = f"http://127.0.0.1:8000/api/campaigns/{test_campaign_id}/stream"
    publish_url = f"http://127.0.0.1:8000/api/campaigns/{test_campaign_id}/test-event"
    
    received_events = []
    print(f"[*] Starting End-to-End SSE Test for campaign: {test_campaign_id}")
    print(f"[*] 1. Connecting to SSE Stream: {stream_url}")

    async def sse_listener():
        async with httpx.AsyncClient(timeout=10.0) as client:
            async with client.stream("GET", stream_url) as response:
                assert response.status_code == 200, f"Expected 200, got {response.status_code}"
                assert "text/event-stream" in response.headers.get("content-type", "")
                print("[+] SSE Stream Connected (HTTP 200 text/event-stream).")

                buffer = ""
                async for chunk in response.aiter_text():
                    buffer += chunk
                    while "\n\n" in buffer:
                        event_block, buffer = buffer.split("\n\n", 1)
                        lines = event_block.strip().split("\n")
                        event_type = None
                        event_data = None
                        for line in lines:
                            if line.startswith("event:"):
                                event_type = line.replace("event:", "").strip()
                            elif line.startswith("data:"):
                                event_data = json.loads(line.replace("data:", "").strip())
                        
                        if event_type and event_data:
                            print(f"[+] Received Live Event from SSE Stream: event='{event_type}', payload={event_data}")
                            received_events.append({"event": event_type, "data": event_data})
                            if len(received_events) >= 2:
                                return

    listener_task = asyncio.create_task(sse_listener())

    # Wait 1s for SSE listener to establish connection with server
    await asyncio.sleep(1.0)

    async with httpx.AsyncClient(timeout=5.0) as client:
        # Publish Event 1: INGESTION_COMPLETED
        print(f"[*] 2. Triggering INGESTION_COMPLETED via {publish_url}...")
        res1 = await client.post(publish_url, json={
            "event": "INGESTION_COMPLETED",
            "data": {"ingested_comments": 1000, "status": "done"}
        })
        assert res1.status_code == 200, f"Failed to publish: {res1.text}"

        await asyncio.sleep(0.5)

        # Publish Event 2: DECISIONS_UPDATED
        print(f"[*] 3. Triggering DECISIONS_UPDATED via {publish_url}...")
        res2 = await client.post(publish_url, json={
            "event": "DECISIONS_UPDATED",
            "data": {"directives_count": 3, "status": "updated"}
        })
        assert res2.status_code == 200, f"Failed to publish: {res2.text}"

    # Wait for listener to receive all events
    try:
        await asyncio.wait_for(listener_task, timeout=5.0)
    except asyncio.TimeoutError:
        print("[-] Timed out waiting for SSE events.")

    print("\n==========================================")
    print(f"SSE TEST RESULTS: {len(received_events)}/2 events verified")
    assert len(received_events) == 2, f"Expected 2 events, got {len(received_events)}"
    assert received_events[0]["event"] == "INGESTION_COMPLETED"
    assert received_events[0]["data"]["data"]["ingested_comments"] == 1000
    assert received_events[1]["event"] == "DECISIONS_UPDATED"
    assert received_events[1]["data"]["data"]["directives_count"] == 3
    print("ALL SSE EVENTS STREAMED & VERIFIED IN REAL TIME SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(test_sse_stream())
