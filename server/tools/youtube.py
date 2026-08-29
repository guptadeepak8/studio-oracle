from google.adk.tools import FunctionTool
from ingestion.youtube import ingest_youtube_data

def ingest_youtube_feedback(content_id: str, query: str, limit: int = 3) -> str:
    """
    Search YouTube videos matching a query and ingest their comments into the ClickHouse database.
    This fetches comments/posts for film or streaming content to perform audience sentiment research.
    
    Args:
        content_id: The UUID of the content/movie/series in the database.
        query: The search query (e.g. 'Gladiator II Trailer').
        limit: Number of videos to fetch comments for (default 3).
        
    Returns:
        A string summarizing the ingestion results.
    """
    result = ingest_youtube_data(content_id, query, limit)
    return f"Successfully ingested {result.get('ingested_posts', 0)} posts and {result.get('ingested_comments', 0)} comments from YouTube ({result.get('source', 'mock')} source)."

ingest_youtube_tool = FunctionTool(ingest_youtube_feedback)

