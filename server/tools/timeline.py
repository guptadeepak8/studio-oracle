from datetime import datetime
from google.adk.tools import FunctionTool
from ingestion.youtube import get_clickhouse_client

def query_trailer_inflection(content_id: str, trailer_date: str) -> dict:
    """
    Compare audience sentiment and topic distribution before vs. after a trailer or campaign event drop.
    
    Args:
        content_id: The content/campaign UUID string.
        trailer_date: The date of the trailer drop in 'YYYY-MM-DD' format.
        
    Returns:
        A dictionary containing pre-trailer metrics, post-trailer metrics, and percentage deltas.
    """
    client = get_clickhouse_client()
    
    # Query pre-trailer sentiment (comment-level)
    pre_query = f"""
    SELECT 
        count() as total,
        countIf(sentiment = 'positive') as pos,
        countIf(sentiment = 'negative') as neg
    FROM studio_oracle.audience_comments
    WHERE content_id = '{content_id}' AND published_at < '{trailer_date} 00:00:00'
    """
    
    # Query post-trailer sentiment (comment-level)
    post_query = f"""
    SELECT 
        count() as total,
        countIf(sentiment = 'positive') as pos,
        countIf(sentiment = 'negative') as neg
    FROM studio_oracle.audience_comments
    WHERE content_id = '{content_id}' AND published_at >= '{trailer_date} 00:00:00'
    """
    
    # Query topics separately so comment counts are not inflated
    pre_topics_query = f"""
    SELECT topic, count() as cnt
    FROM studio_oracle.audience_comments
    ARRAY JOIN topics AS topic
    WHERE content_id = '{content_id}' AND published_at < '{trailer_date} 00:00:00'
    GROUP BY topic ORDER BY cnt DESC LIMIT 5
    """
    post_topics_query = f"""
    SELECT topic, count() as cnt
    FROM studio_oracle.audience_comments
    ARRAY JOIN topics AS topic
    WHERE content_id = '{content_id}' AND published_at >= '{trailer_date} 00:00:00'
    GROUP BY topic ORDER BY cnt DESC LIMIT 5
    """
    
    pre_res = client.query(pre_query).result_rows
    post_res = client.query(post_query).result_rows
    try:
        pre_topics = [r[0] for r in client.query(pre_topics_query).result_rows]
        post_topics = [r[0] for r in client.query(post_topics_query).result_rows]
    except Exception:
        pre_topics, post_topics = [], []
    
    pre_total = pre_res[0][0] if pre_res else 0
    pre_pos = pre_res[0][1] if pre_res else 0
    pre_neg = pre_res[0][2] if pre_res else 0
    
    post_total = post_res[0][0] if post_res else 0
    post_pos = post_res[0][1] if post_res else 0
    post_neg = post_res[0][2] if post_res else 0
    
    pre_pos_pct = round((pre_pos / pre_total) * 100) if pre_total > 0 else 0
    pre_neg_pct = round((pre_neg / pre_total) * 100) if pre_total > 0 else 0
    
    post_pos_pct = round((post_pos / post_total) * 100) if post_total > 0 else 0
    post_neg_pct = round((post_neg / post_total) * 100) if post_total > 0 else 0
    
    return {
        "content_id": content_id,
        "trailer_date": trailer_date,
        "pre_trailer": {
            "total_mentions": pre_total,
            "positive_percent": pre_pos_pct,
            "negative_percent": pre_neg_pct
        },
        "post_trailer": {
            "total_mentions": post_total,
            "positive_percent": post_pos_pct,
            "negative_percent": post_neg_pct
        },
        "sentiment_shift": {
            "positive_change": post_pos_pct - pre_pos_pct,
            "negative_change": post_neg_pct - pre_neg_pct
        }
    }

query_trailer_inflection_tool = FunctionTool(query_trailer_inflection)

