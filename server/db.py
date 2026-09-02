import sqlite3
import time
from typing import Any
from ingestion.youtube import get_clickhouse_client

# In-memory TTL cache for read-heavy analytical queries (15s TTL)
_QUERY_CACHE: dict[str, tuple[float, Any]] = {}

def get_cached_query(key: str, ttl_seconds: float = 15.0) -> Any:
    if key in _QUERY_CACHE:
        timestamp, val = _QUERY_CACHE[key]
        if time.time() - timestamp < ttl_seconds:
            return val
    return None

def set_cached_query(key: str, val: Any):
    _QUERY_CACHE[key] = (time.time(), val)

def invalidate_campaign_cache(content_id: str = None):
    global _QUERY_CACHE
    if content_id:
        keys_to_remove = [k for k in _QUERY_CACHE if content_id in k]
        for k in keys_to_remove:
            _QUERY_CACHE.pop(k, None)
    else:
        _QUERY_CACHE.clear()

def init_sqlite_db():
    conn = sqlite3.connect("sessions.db", timeout=30.0)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
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
    conn = sqlite3.connect("sessions.db", timeout=30.0)
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM campaign_statuses WHERE content_id = ?", (content_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else "active"

def set_campaign_status(content_id: str, status: str):
    init_sqlite_db()
    invalidate_campaign_cache(content_id)
    conn = sqlite3.connect("sessions.db", timeout=30.0)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO campaign_statuses (content_id, status)
        VALUES (?, ?)
        ON CONFLICT(content_id) DO UPDATE SET status = excluded.status
    """, (content_id, status))
    conn.commit()
    conn.close()

def delete_campaign_records(content_id: str):
    """
    Immediate hard delete of a campaign and all its associated ClickHouse records
    (posts, comments, sentiments, and metadata) and SQLite tracking records.
    """
    invalidate_campaign_cache(content_id)
    client = get_clickhouse_client()
    
    # 1. Immediate Hard Delete in ClickHouse
    try:
        client.command(f"DELETE FROM studio_oracle.audience_comments WHERE content_id = '{content_id}'")
        client.command(f"DELETE FROM studio_oracle.audience_posts WHERE content_id = '{content_id}'")
        client.command(f"DELETE FROM studio_oracle.content WHERE content_id = '{content_id}'")
    except Exception as del_err:
        print(f"Executing fallback ALTER TABLE DELETE mutation: {del_err}")
        client.command(f"ALTER TABLE studio_oracle.audience_comments DELETE WHERE content_id = '{content_id}'")
        client.command(f"ALTER TABLE studio_oracle.audience_posts DELETE WHERE content_id = '{content_id}'")
        client.command(f"ALTER TABLE studio_oracle.content DELETE WHERE content_id = '{content_id}'")
    
    # 2. Hard Delete SQLite status tracking
    init_sqlite_db()
    conn = sqlite3.connect("sessions.db", timeout=30.0)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM campaign_statuses WHERE content_id = ?", (content_id,))
    conn.commit()
    conn.close()

def fetch_movies() -> list[dict]:
    """
    Retrieve all movie/series campaign records from ClickHouse database,
    joining their persistent tracking status from SQLite.
    """
    cached = get_cached_query("all_movies", ttl_seconds=10.0)
    if cached is not None:
        return cached

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
    set_cached_query("all_movies", movies)
    return movies

def fetch_movie_by_id(content_id: str) -> dict | None:
    """
    Retrieve a specific movie/campaign metadata by content_id from ClickHouse.
    """
    cached = get_cached_query(f"movie_{content_id}", ttl_seconds=30.0)
    if cached is not None:
        return cached

    client = get_clickhouse_client()
    query = (
        f"SELECT content_id, content_type, title, description, release_date, target_terms "
        f"FROM studio_oracle.content WHERE content_id = '{content_id}' LIMIT 1"
    )
    try:
        rows = client.query(query).result_rows
        if not rows:
            return None
        r = rows[0]
        res = {
            "content_id": str(r[0]),
            "content_type": r[1],
            "title": r[2],
            "description": r[3],
            "release_date": str(r[4]) if r[4] else None,
            "target_terms": r[5]
        }
        set_cached_query(f"movie_{content_id}", res)
        return res
    except Exception as e:
        print(f"Notice: Movie query for {content_id}: {e}")
        return None

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
    cache_key = f"analytics_{content_id}"
    cached = get_cached_query(cache_key, ttl_seconds=10.0)
    if cached is not None:
        return cached

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
            
    analytics_res = {
        "sentiment": sentiment_data,
        "themes": themes,
        "conflicts": conflicts
    }
    set_cached_query(cache_key, analytics_res)
    return analytics_res

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
        date_str = date_grp.strftime("%b %d, %Y") if hasattr(date_grp, "strftime") else str(date_grp)
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

def fetch_campaign_drops(content_id: str) -> list[dict]:
    client = get_clickhouse_client()
    query = (
        f"SELECT p.post_id, p.title, p.url, p.published_at, "
        f"       count(c.comment_id) as total_comments, "
        f"       countIf(c.sentiment = 'positive') as pos_c, "
        f"       countIf(c.sentiment = 'negative') as neg_c, "
        f"       argMax(c.text, c.like_count) as top_comment "
        f"FROM studio_oracle.audience_posts p "
        f"LEFT JOIN studio_oracle.audience_comments c ON p.post_id = c.post_id "
        f"WHERE p.content_id = '{content_id}' "
        f"GROUP BY p.post_id, p.title, p.url, p.published_at "
        f"HAVING total_comments > 0 "
        f"ORDER BY p.published_at ASC"
    )
    rows = client.query(query).result_rows
    drops = []
    for r in rows:
        post_id = str(r[0])
        title = str(r[1])
        url = str(r[2])
        pub_date = r[3]
        pub_str = pub_date.strftime("%b %d, %Y") if hasattr(pub_date, "strftime") else str(pub_date)
        total = int(r[4])
        pos_c = int(r[5])
        neg_c = int(r[6])
        top_comment = str(r[7] or "")
        pos_pct = round((pos_c / total) * 100) if total > 0 else 0
        neg_pct = round((neg_c / total) * 100) if total > 0 else 0
        
        drops.append({
            "id": post_id,
            "title": title,
            "url": url,
            "published_at": pub_str,
            "total_comments": total,
            "posPercent": pos_pct,
            "negPercent": neg_pct,
            "topComment": top_comment
        })
    return drops

def fetch_platform_breakdown(content_id: str) -> dict:
    client = get_clickhouse_client()
    query = (
        f"SELECT source, count() as total, "
        f"       countIf(sentiment = 'positive') as pos, "
        f"       countIf(sentiment = 'negative') as neg, "
        f"       argMax(text, like_count) FILTER (WHERE sentiment = 'positive') as top_pos, "
        f"       argMax(text, like_count) FILTER (WHERE sentiment = 'negative') as top_neg "
        f"FROM studio_oracle.audience_comments "
        f"WHERE content_id = '{content_id}' "
        f"GROUP BY source"
    )
    rows = client.query(query).result_rows
    breakdown = {}
    for r in rows:
        src = str(r[0]).lower()
        total = int(r[1])
        pos = int(r[2])
        neg = int(r[3])
        pos_pct = round((pos / total) * 100) if total > 0 else 0
        neg_pct = round((neg / total) * 100) if total > 0 else 0
        top_pos = str(r[4] or "")
        top_neg = str(r[5] or "")
        breakdown[src] = {
            "total": total,
            "posPercent": pos_pct,
            "negPercent": neg_pct,
            "topPositive": top_pos,
            "topNegative": top_neg
        }
    return breakdown

def fetch_comment_detail(comment_id: str) -> dict | None:
    """
    Retrieve single comment metadata and raw verbatim text from ClickHouse for evidence inspection.
    """
    client = get_clickhouse_client()
    query = f"""
    SELECT comment_id, post_id, content_id, source, text, author, published_at, like_count, sentiment, topics, confidence
    FROM studio_oracle.audience_comments
    WHERE comment_id = '{comment_id}'
    LIMIT 1
    """
    try:
        rows = client.query(query).result_rows
        if not rows:
            return None
        r = rows[0]
        return {
            "comment_id": str(r[0]),
            "post_id": str(r[1]),
            "content_id": str(r[2]),
            "source": str(r[3]),
            "text": str(r[4]),
            "author": str(r[5]) if r[5] else "Audience Member",
            "published_at": str(r[6]),
            "like_count": int(r[7]),
            "sentiment": str(r[8]),
            "topics": list(r[9]) if r[9] else [],
            "confidence": float(r[10]) if r[10] else 0.85
        }
    except Exception as e:
        print(f"Error fetching comment detail for {comment_id}: {e}")
        return None


