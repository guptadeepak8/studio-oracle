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
        f"SELECT comment_id, post_id, source, text, author, published_at, like_count, sentiment, topics "
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
            "like_count": r[6],
            "sentiment": r[7],
            "topics": list(r[8]) if r[8] else []
        })
    return comments

def fetch_campaign_analytics(content_id: str) -> dict:
    client = get_clickhouse_client()
    
    # 1. Fetch sentiment counts
    sent_query = f"SELECT sentiment, count() FROM studio_oracle.audience_comments WHERE content_id = '{content_id}' GROUP BY sentiment"
    sent_rows = client.query(sent_query).result_rows
    
    sent_counts = {"positive": 0, "negative": 0, "neutral": 0}
    for r in sent_rows:
        sentiment = str(r[0]).lower()
        if sentiment in sent_counts:
            sent_counts[sentiment] = int(r[1])
            
    total_comments = sum(sent_counts.values())
    if total_comments > 0:
        pos_percent = round((sent_counts["positive"] / total_comments) * 100)
        neg_percent = round((sent_counts["negative"] / total_comments) * 100)
    else:
        pos_percent = 0
        neg_percent = 0
        
    sentiment_data = {
        "positive": sent_counts["positive"],
        "negative": sent_counts["negative"],
        "neutral": sent_counts["neutral"],
        "posPercent": pos_percent,
        "negPercent": neg_percent
    }
    
    # 2. Fetch theme stats
    theme_query = (
        f"SELECT topic, count() as total, "
        f"       countIf(topic_sentiments[topic] = 'positive') as pos_c, "
        f"       countIf(topic_sentiments[topic] = 'negative') as neg_c "
        f"FROM studio_oracle.audience_comments "
        f"ARRAY JOIN topics AS topic "
        f"WHERE content_id = '{content_id}' GROUP BY topic ORDER BY total DESC"
    )
    theme_rows = client.query(theme_query).result_rows
    themes = []
    for r in theme_rows:
        topic = str(r[0])
        total = int(r[1])
        pos_c = int(r[2])
        neg_c = int(r[3])
        
        pos_pct = round((pos_c / total) * 100) if total > 0 else 0
        neg_pct = round((neg_c / total) * 100) if total > 0 else 0
        
        themes.append({
            "name": topic,
            "count": total,
            "posPercent": pos_pct,
            "negPercent": neg_pct
        })
        
    # 3. Fetch conflicting signals
    conflict_query = (
        f"SELECT topic, "
        f"       argMax(text, like_count) FILTER (WHERE topic_sentiments[topic] = 'positive') as pos_text, "
        f"       argMax(author, like_count) FILTER (WHERE topic_sentiments[topic] = 'positive') as pos_author, "
        f"       argMax(text, like_count) FILTER (WHERE topic_sentiments[topic] = 'negative') as neg_text, "
        f"       argMax(author, like_count) FILTER (WHERE topic_sentiments[topic] = 'negative') as neg_author "
        f"FROM studio_oracle.audience_comments "
        f"ARRAY JOIN topics AS topic "
        f"WHERE content_id = '{content_id}' "
        f"GROUP BY topic "
        f"HAVING countIf(topic_sentiments[topic] = 'positive') > 0 "
        f"   AND countIf(topic_sentiments[topic] = 'negative') > 0"
    )
    conflict_rows = client.query(conflict_query).result_rows
    conflicts = []
    for r in conflict_rows:
        topic = str(r[0])
        pos_text = str(r[1] or "")
        pos_author = str(r[2] or "Anonymous")
        neg_text = str(r[3] or "")
        neg_author = str(r[4] or "Anonymous")
        
        if pos_text and neg_text:
            conflicts.append({
                "theme": topic,
                "positive": {
                    "text": pos_text,
                    "author": pos_author,
                    "source": "youtube",
                    "likes": 0,
                    "published": ""
                },
                "negative": {
                    "text": neg_text,
                    "author": neg_author,
                    "source": "youtube",
                    "likes": 0,
                    "published": ""
                }
            })
            
    return {
        "sentiment": sentiment_data,
        "themes": themes,
        "conflicts": conflicts
    }

def fetch_campaign_timeline(content_id: str) -> list[dict]:
    client = get_clickhouse_client()
    timeline_query = (
        f"SELECT date_grp, topic, total, pos, neg, top_text FROM ("
        f"    SELECT toStartOfDay(published_at) as date_grp, topic, count() as total, "
        f"           countIf(topic_sentiments[topic] = 'positive') as pos, "
        f"           countIf(topic_sentiments[topic] = 'negative') as neg, "
        f"           argMax(text, like_count) as top_text "
        f"    FROM studio_oracle.audience_comments "
        f"    ARRAY JOIN topics AS topic "
        f"    WHERE content_id = '{content_id}' "
        f"    GROUP BY date_grp, topic "
        f"    ORDER BY date_grp ASC, total DESC"
        f") LIMIT 1 BY date_grp"
    )
    rows = client.query(timeline_query).result_rows
    timeline = []
    for r in rows:
        date_grp = r[0]
        date_str = date_grp.strftime("%m-%d") if hasattr(date_grp, "strftime") else str(date_grp)
        topic = str(r[1])
        total = int(r[2])
        pos_c = int(r[3])
        neg_c = int(r[4])
        top_text = str(r[5] or "")
        
        pos_pct = round((pos_c / total) * 100) if total > 0 else 0
        neg_pct = round((neg_c / total) * 100) if total > 0 else 0
        
        timeline.append({
            "label": date_str,
            "count": total,
            "positiveRatio": pos_pct,
            "negativeRatio": neg_pct,
            "dominantTopic": topic,
            "representativeComment": top_text
        })
    return timeline
