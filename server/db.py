import sqlite3
from ingestion.youtube import get_clickhouse_client

def init_sqlite_db():
    conn = sqlite3.connect("sessions.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaign_statuses (
            content_id TEXT PRIMARY KEY,
            status TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def get_campaign_status(content_id: str) -> str:
    init_sqlite_db()
    conn = sqlite3.connect("sessions.db")
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM campaign_statuses WHERE content_id = ?", (content_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else "active"

def set_campaign_status(content_id: str, status: str):
    init_sqlite_db()
    conn = sqlite3.connect("sessions.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO campaign_statuses (content_id, status)
        VALUES (?, ?)
        ON CONFLICT(content_id) DO UPDATE SET status = excluded.status
    """, (content_id, status))
    conn.commit()
    conn.close()

def delete_campaign_records(content_id: str):
    client = get_clickhouse_client()
    
    # 1. Safe cascading ClickHouse mutations
    client.command(f"ALTER TABLE studio_oracle.content DELETE WHERE content_id = '{content_id}'")
    client.command(f"ALTER TABLE studio_oracle.audience_posts DELETE WHERE content_id = '{content_id}'")
    client.command(f"ALTER TABLE studio_oracle.audience_comments DELETE WHERE content_id = '{content_id}'")
    
    # 2. SQLite status deletion
    init_sqlite_db()
    conn = sqlite3.connect("sessions.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM campaign_statuses WHERE content_id = ?", (content_id,))
    conn.commit()
    conn.close()

def fetch_movies() -> list[dict]:
    """
    Retrieve all movie/series campaign records from ClickHouse database,
    joining their persistent tracking status from SQLite.
    """
    client = get_clickhouse_client()
    query = (
        "SELECT content_id, content_type, title, description, release_date, target_terms "
        "FROM studio_oracle.content ORDER BY created_at DESC"
    )
    rows = client.query(query).result_rows
    movies = []
    for r in rows:
        content_id = str(r[0])
        movies.append({
            "content_id": content_id,
            "content_type": r[1],
            "title": r[2],
            "description": r[3],
            "release_date": str(r[4]) if r[4] else None,
            "target_terms": r[5],
            "status": get_campaign_status(content_id)
        })
    return movies

def fetch_movie_by_id(content_id: str) -> dict | None:
    """
    Retrieve a specific movie/campaign metadata by content_id from ClickHouse.
    """
    client = get_clickhouse_client()
    query = (
        f"SELECT content_id, content_type, title, description, release_date, target_terms "
        f"FROM studio_oracle.content WHERE content_id = '{content_id}' LIMIT 1"
    )
    rows = client.query(query).result_rows
    if not rows:
        return None
    r = rows[0]
    return {
        "content_id": str(r[0]),
        "content_type": r[1],
        "title": r[2],
        "description": r[3],
        "release_date": str(r[4]) if r[4] else None,
        "target_terms": r[5]
    }

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
