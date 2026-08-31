from google.adk.tools import FunctionTool
from ingestion.reddit import ingest_reddit_data

def ingest_reddit_feedback(content_id: str, query: str, limit: int = 10) -> str:
    """
    Ingest Reddit enthusiast discussions and forum feedback for a movie or campaign into ClickHouse.
    
    Args:
        content_id: The campaign UUID in ClickHouse.
        query: Search query (e.g. 'Gladiator II Reddit discussions').
        limit: Max number of comments to ingest (default 10).
        
    Returns:
        Summary of ingestion results.
    """
    result = ingest_reddit_data(content_id, query, limit=limit)
    return f"Successfully ingested {result.get('ingested_comments', 0)} Reddit community comments into ClickHouse for campaign '{content_id}'."

ingest_reddit_tool = FunctionTool(ingest_reddit_feedback)

