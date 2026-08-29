from ingestion.youtube import get_clickhouse_client

def fetch_movies() -> list[dict]:
    """
    Retrieve all movie/series content records from ClickHouse database.
    """
    client = get_clickhouse_client()
    query = (
        "SELECT content_id, content_type, title, description, release_date, target_terms "
        "FROM studio_oracle.content ORDER BY created_at DESC"
    )
    rows = client.query(query).result_rows
    movies = []
    for r in rows:
        movies.append({
            "content_id": str(r[0]),
            "content_type": r[1],
            "title": r[2],
            "description": r[3],
            "release_date": str(r[4]) if r[4] else None,
            "target_terms": r[5]
        })
    return movies

def fetch_comments(content_id: str) -> list[dict]:
    """
    Retrieve audience feedback comments for a specific movie UUID from ClickHouse.
    """
    client = get_clickhouse_client()
    query = (
        f"SELECT comment_id, post_id, source, text, author, published_at, like_count "
        f"FROM studio_oracle.audience_comments "
        f"WHERE content_id = '{content_id}' ORDER BY published_at DESC"
    )
    rows = client.query(query).result_rows
    comments = []
    for r in rows:
        comments.append({
            "comment_id": r[0],
            "post_id": r[1],
            "source": r[2],
            "text": r[3],
            "author": r[4],
            "published_at": str(r[5]),
            "like_count": r[6]
        })
    return comments
