import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from core.config import settings
from core.database import get_clickhouse_client
from services.campaign_service import CampaignService
from ingestion.youtube import ingest_youtube_data

# Import modular routers
from routers import (
    campaigns_router,
    decisions_router,
    comments_router,
    ingestion_router,
    chat_router,
    benchmark_router,
)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-performance autonomous decision intelligence engine for entertainment marketing.",
    version=settings.VERSION,
)

# 1. High-Performance Gzip Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 2. CORS configuration for production & local frontends
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

# Health & Readiness Probes
@app.get("/health")
@app.get("/health/live")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/health/ready")
def readiness():
    """Readiness probe verifying ClickHouse database connectivity."""
    try:
        client = get_clickhouse_client()
        client.ping()
        return {"status": "ready", "clickhouse": "connected"}
    except Exception as e:
        return {"status": "degraded", "clickhouse_notice": str(e)}

# Register Feature Routers
app.include_router(campaigns_router)
app.include_router(decisions_router)
app.include_router(comments_router)
app.include_router(ingestion_router)
app.include_router(chat_router)
app.include_router(benchmark_router)

# Periodic Background Surveillance Worker
async def periodic_campaign_sync():
    """
    Background worker that runs every 1 hour (3600s) to automatically
    fetch and sync the latest audience feedback for all active campaigns.
    """
    while True:
        try:
            await asyncio.sleep(3600)
            print("Executing scheduled 1-hour active campaign audience feedback sync...")
            movies = await asyncio.to_thread(CampaignService.get_all_campaigns)
            for m in movies:
                if m.get("status") == "active" and m.get("target_terms"):
                    query = m["target_terms"][0]
                    print(f"Auto-syncing feedback for '{m['title']}'...")
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
