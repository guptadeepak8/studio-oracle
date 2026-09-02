import datetime
from typing import Dict, Any, List
from ingestion.youtube import get_clickhouse_client

def detect_campaign_signals(content_id: str) -> Dict[str, Any]:
    """
    Deterministic anomaly, drift, and divergence detector.
    Calculates exact mathematical signals directly from ClickHouse
    before any LLM synthesis is engaged.
    """
    client = get_clickhouse_client()
    
    # 1. Total volume & sentiment distribution
    total_query = f"""
    SELECT 
        count() as total,
        countIf(sentiment = 'positive') as pos_count,
        countIf(sentiment = 'negative') as neg_count,
        countIf(sentiment = 'neutral') as neutral_count
    FROM studio_oracle.audience_comments
    WHERE content_id = '{content_id}'
    """
    try:
        tot_rows = client.query(total_query).result_rows
    except Exception as e:
        print(f"Error querying total signals for {content_id}: {e}")
        tot_rows = []

    total_comments = tot_rows[0][0] if tot_rows else 0
    pos_count = tot_rows[0][1] if tot_rows else 0
    neg_count = tot_rows[0][2] if tot_rows else 0
    neutral_count = tot_rows[0][3] if tot_rows else 0
    
    pos_pct = round((pos_count / total_comments) * 100) if total_comments > 0 else 0
    neg_pct = round((neg_count / total_comments) * 100) if total_comments > 0 else 0
    net_sentiment_score = pos_pct - neg_pct

    # 2. Platform Breakdown & Divergence
    platform_query = f"""
    SELECT 
        source,
        count() as cnt,
        countIf(sentiment = 'positive') as pos,
        countIf(sentiment = 'negative') as neg
    FROM studio_oracle.audience_comments
    WHERE content_id = '{content_id}'
    GROUP BY source
    """
    try:
        plat_rows = client.query(platform_query).result_rows
    except Exception:
        plat_rows = []

    platforms_data = {}
    for r in plat_rows:
        src = r[0]
        cnt = r[1]
        p = round((r[2] / cnt) * 100) if cnt > 0 else 0
        n = round((r[3] / cnt) * 100) if cnt > 0 else 0
        platforms_data[src] = {
            "count": cnt,
            "positive_pct": p,
            "negative_pct": n,
            "net_sentiment": p - n
        }

    # Platform divergence delta
    yt_net = platforms_data.get("youtube", {}).get("net_sentiment", 0)
    rd_net = platforms_data.get("reddit", {}).get("net_sentiment", 0)
    platform_divergence = abs(yt_net - rd_net) if ("youtube" in platforms_data and "reddit" in platforms_data) else 0

    # 3. Topic Anomaly & Polarization Detection
    topic_query = f"""
    SELECT 
        topic,
        count() as cnt,
        countIf(sentiment = 'positive') as pos,
        countIf(sentiment = 'negative') as neg
    FROM studio_oracle.audience_comments
    ARRAY JOIN topics AS topic
    WHERE content_id = '{content_id}'
    GROUP BY topic
    HAVING cnt >= 5
    ORDER BY cnt DESC
    LIMIT 20
    """
    try:
        top_rows = client.query(topic_query).result_rows
    except Exception:
        top_rows = []

    topics = []
    friction_topics = []
    resonance_topics = []

    for r in top_rows:
        t_name = str(r[0]).strip()
        cnt = r[1]
        p = round((r[2] / cnt) * 100) if cnt > 0 else 0
        n = round((r[3] / cnt) * 100) if cnt > 0 else 0
        topic_obj = {
            "name": t_name,
            "count": cnt,
            "positive_pct": p,
            "negative_pct": n
        }
        topics.append(topic_obj)
        if n >= 20 and cnt >= 10:
            friction_topics.append(topic_obj)
        if p >= 45 and cnt >= 10:
            resonance_topics.append(topic_obj)

    # Sort friction by negative percentage
    friction_topics.sort(key=lambda x: x["negative_pct"], reverse=True)
    resonance_topics.sort(key=lambda x: x["positive_pct"], reverse=True)

    # 4. Fetch Sample Verbatim Quotes with comment_ids for top topics
    sample_comments = []
    if total_comments > 0:
        comment_query = f"""
        SELECT 
            comment_id,
            source,
            author,
            text,
            sentiment,
            topics,
            published_at
        FROM studio_oracle.audience_comments
        WHERE content_id = '{content_id}' AND length(text) > 20
        ORDER BY rand()
        LIMIT 25
        """
        try:
            c_rows = client.query(comment_query).result_rows
            for c in c_rows:
                sample_comments.append({
                    "comment_id": str(c[0]),
                    "source": str(c[1]),
                    "author": str(c[2]) if c[2] else "Audience Member",
                    "text": str(c[3]),
                    "sentiment": str(c[4]),
                    "topics": c[5] if isinstance(c[5], list) else [],
                    "published_at": str(c[6])
                })
        except Exception:
            pass

    return {
        "content_id": content_id,
        "total_comments": total_comments,
        "sentiment": {
            "positive_pct": pos_pct,
            "negative_pct": neg_pct,
            "neutral_pct": round((neutral_count / total_comments) * 100) if total_comments > 0 else 0,
            "net_score": net_sentiment_score
        },
        "platforms": platforms_data,
        "platform_divergence": platform_divergence,
        "topics": topics,
        "friction_topics": friction_topics,
        "resonance_topics": resonance_topics,
        "sample_comments": sample_comments,
        "has_sufficient_evidence": total_comments >= 25
    }
