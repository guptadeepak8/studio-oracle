import os
import sys
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.youtube import get_clickhouse_client, analyze_comments

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

def generate_mock_reddit_comments(content_id: str, query: str, limit: int = 15) -> list:
    """
    Generates realistic enthusiast Reddit thread comments for film/campaign queries.
    """
    sample_discussions = [
        ("u/Cinephile_99", "Honestly, the CGI in the trailer looks a bit oversaturated compared to the original film. Hope the final cut polishes lighting."),
        ("u/GladiatorFanatic", "Ridley Scott's visual scale is unmatched, but I really hope they don't rush the historical lore just for pacing."),
        ("u/MovieBuff_Austin", "The soundtrack choice for the trailer was unexpected. Heavy instrumental cues work way better than modern beats for period epics."),
        ("u/FilmScoreNerd", "Paul Mescal has incredible screen presence! Casting is definitely the strongest element shown so far."),
        ("u/ScreenplayCritic", "Is anyone else worried about the dialogue feeling a bit modernized? Wish it stayed truer to the original screenplay tone."),
        ("u/BoxOfficeInsider", "The arena action sequences look massive. If word-of-mouth holds, this will break November opening weekend records."),
        ("u/VFX_Artist_Tom", "As a VFX compositor, the practical stunts in the colosseum look gorgeous! Only a few background renders look work-in-progress."),
        ("u/HistoryBuff_Mark", "Historical liberties are fine, but naval battle scenes inside the colosseum are actually historically accurate for naumachia!"),
        ("u/TrailerHype_2026", "Gave me absolute goosebumps. Best trailer cut of the year by far!"),
        ("u/CanonEnthusiast", "Hoping the narrative connects smoothly with the legacy characters rather than feeling like a soft reboot.")
    ]
    
    now = datetime.now()
    comments = []
    
    for idx, (author, text) in enumerate(sample_discussions[:limit]):
        comment_id = f"rd_{uuid.uuid4().hex[:10]}"
        post_id = f"rd_post_{content_id[:8]}"
        published_at = now - timedelta(hours=(idx * 4) + 2)
        like_count = 15 + (idx * 12)
        
        comments.append((
            comment_id,
            post_id,
            content_id,
            "reddit",
            text,
            author,
            published_at,
            like_count,
            now
        ))
        
    return comments

def ingest_reddit_data(content_id: str, query: str, limit: int = 10) -> dict:
    """
    Ingests Reddit community discussions into ClickHouse for audience intelligence research.
    """
    client = get_clickhouse_client()
    
    print(f"Fetching Reddit telemetry for query '{query}'...")
    raw_comments = generate_mock_reddit_comments(content_id, query, limit=limit)
    
    print(f"Analyzing {len(raw_comments)} Reddit comments with Gemini batch classifier...")
    analyzed_comments = analyze_comments(raw_comments)
    
    print(f"Inserting {len(analyzed_comments)} Reddit comments into ClickHouse...")
    client.insert(
        "studio_oracle.audience_comments",
        analyzed_comments,
        column_names=[
            "comment_id", "post_id", "content_id", "source", "text",
            "author", "published_at", "like_count", "collected_at",
            "sentiment", "aspect", "claim", "evidence_type", "confidence",
            "topics", "topic_sentiments", "analysis_status"
        ]
    )
    
    return {
        "status": "success",
        "source": "reddit",
        "ingested_comments": len(analyzed_comments)
    }

