import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from core.config import settings
from core.database import get_clickhouse_client
from services.campaign_service import CampaignService
from ingestion.youtube import ingest_youtube_data

from routers import (
    campaigns_router,
    decisions_router,
    comments_router,
    ingestion_router,
    chat_router,
    benchmark_router,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous decision intelligence engine for entertainment marketing.",
    version=settings.VERSION,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
@app.get("/health/live")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/health/ready")
def readiness():
    try:
        client = get_clickhouse_client()
        client.ping()
        return {"status": "ready", "clickhouse": "connected"}
    except Exception as e:
        return {"status": "degraded", "clickhouse_notice": str(e)}

app.include_router(campaigns_router)
app.include_router(decisions_router)
app.include_router(comments_router)
app.include_router(ingestion_router)
app.include_router(chat_router)
app.include_router(benchmark_router)

async def periodic_campaign_sync():
    while True:
        try:
            await asyncio.sleep(3600)
            movies = await asyncio.to_thread(CampaignService.get_all_campaigns)
            for m in movies:
                if m.get("status") == "active" and m.get("target_terms"):
                    query = m["target_terms"][0]
                    await asyncio.to_thread(
                        ingest_youtube_data,
                        m["content_id"],
                        query,
                        limit=2,
                        max_comments_per_video=300
                    )
        except Exception as loop_err:
            print(f"Periodic sync notice: {loop_err}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_campaign_sync())
