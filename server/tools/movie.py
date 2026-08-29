import uuid
from datetime import datetime
from google.adk.tools import FunctionTool
from ingestion.youtube import get_clickhouse_client

def create_content_record(
    title: str,
    content_type: str,
    description: str,
    release_date: str = None,
    target_terms: list[str] = None
) -> str:
    """
    Create a new content record (e.g. movie, series) in the studio_oracle.content table.
    This generates a unique content_id (UUID) and stores the metadata.
    
    Args:
        title: The title of the movie or series.
        content_type: The type of content, e.g. 'movie' or 'series'.
        description: A short description/summary of the content.
        release_date: Optional release date in 'YYYY-MM-DD' format.
        target_terms: Optional list of keywords/terms to track (e.g. ['Gladiator II', 'Colosseum']).
        
    Returns:
        The generated content_id (UUID) as a string.
    """
    client = get_clickhouse_client()
    
    # Check if content with the same title already exists to prevent duplicate content records
    escaped_title = title.replace("'", "''")
    query = f"SELECT content_id FROM studio_oracle.content WHERE title = '{escaped_title}'"
    existing = client.query(query).result_rows
    if existing:
        return str(existing[0][0])
        
    content_id = uuid.uuid4()
    
    parsed_date = None
    if release_date:
        try:
            parsed_date = datetime.strptime(release_date, "%Y-%m-%d").date()
        except ValueError:
            pass
            
    terms = target_terms or [title]
    
    client.insert(
        "studio_oracle.content",
        [[
            content_id,
            content_type,
            title,
            description,
            parsed_date,
            "{}", # metadata JSON string
            terms,
            datetime.now()
        ]],
        column_names=[
            "content_id", "content_type", "title", "description",
            "release_date", "metadata", "target_terms", "created_at"
        ]
    )
    return str(content_id)

create_content_tool = FunctionTool(create_content_record)

