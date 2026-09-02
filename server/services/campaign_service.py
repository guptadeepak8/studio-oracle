import uuid
from typing import List, Dict, Any, Optional
from core.database import get_clickhouse_client, get_sqlite_connection, init_sqlite_db
from core.cache import get_cached, set_cached, invalidate_cache

class CampaignService:
    @staticmethod
    def get_status(content_id: str) -> str:
        init_sqlite_db()
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM campaign_statuses WHERE content_id = ?", (content_id,))
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else "active"

    @staticmethod
    def set_status(content_id: str, status: str) -> None:
        init_sqlite_db()
        invalidate_cache(content_id)
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO campaign_statuses (content_id, status)
            VALUES (?, ?)
            ON CONFLICT(content_id) DO UPDATE SET status = excluded.status
        """, (content_id, status))
        conn.commit()
        conn.close()

    @staticmethod
    def delete_campaign(content_id: str) -> None:
        invalidate_cache(content_id)
        client = get_clickhouse_client()
        try:
            client.command(f"DELETE FROM studio_oracle.audience_comments WHERE content_id = '{content_id}'")
            client.command(f"DELETE FROM studio_oracle.audience_posts WHERE content_id = '{content_id}'")
            client.command(f"DELETE FROM studio_oracle.content WHERE content_id = '{content_id}'")
        except Exception:
            client.command(f"ALTER TABLE studio_oracle.audience_comments DELETE WHERE content_id = '{content_id}'")
            client.command(f"ALTER TABLE studio_oracle.audience_posts DELETE WHERE content_id = '{content_id}'")
            client.command(f"ALTER TABLE studio_oracle.content DELETE WHERE content_id = '{content_id}'")

        init_sqlite_db()
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM campaign_statuses WHERE content_id = ?", (content_id,))
        conn.commit()
        conn.close()

    @staticmethod
    def get_all_campaigns() -> List[Dict[str, Any]]:
        cached = get_cached("all_movies", ttl_seconds=10.0)
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
            cid = str(r[0])
            movies.append({
                "content_id": cid,
                "content_type": r[1],
                "title": r[2],
                "description": r[3],
                "release_date": str(r[4]) if r[4] else None,
                "target_terms": r[5],
                "status": CampaignService.get_status(cid)
            })
        set_cached("all_movies", movies)
        return movies

    @staticmethod
    def get_campaign_by_id(content_id: str) -> Optional[Dict[str, Any]]:
        cached = get_cached(f"movie_{content_id}", ttl_seconds=30.0)
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
                "target_terms": r[5],
                "status": CampaignService.get_status(content_id)
            }
            set_cached(f"movie_{content_id}", res)
            return res
        except Exception:
            return None

    @staticmethod
    def get_comments(content_id: str) -> List[Dict[str, Any]]:
        client = get_clickhouse_client()
        query = (
            f"SELECT comment_id, post_id, source, text, author, published_at, like_count, sentiment, topics "
            f"FROM studio_oracle.audience_comments "
            f"WHERE content_id = '{content_id}' ORDER BY published_at DESC"
        )
        try:
            rows = client.query(query).result_rows
            return [
                {
                    "comment_id": r[0],
                    "post_id": r[1],
                    "source": r[2],
                    "text": r[3],
                    "author": r[4],
                    "published_at": str(r[5]),
                    "like_count": r[6],
                    "sentiment": r[7],
                    "topics": list(r[8]) if r[8] else []
                } for r in rows
            ]
        except Exception:
            return []

    @staticmethod
    def get_comment_detail(comment_id: str) -> Optional[Dict[str, Any]]:
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
        except Exception:
            return None

    @staticmethod
    def get_analytics(content_id: str) -> Dict[str, Any]:
        cache_key = f"analytics_{content_id}"
        cached = get_cached(cache_key, ttl_seconds=10.0)
        if cached is not None:
            return cached

        client = get_clickhouse_client()
        
        sent_query = f"SELECT sentiment, count() FROM studio_oracle.audience_comments WHERE content_id = '{content_id}' GROUP BY sentiment"
        try:
            sent_rows = client.query(sent_query).result_rows
        except Exception:
            sent_rows = []

        sent_counts = {"positive": 0, "negative": 0, "neutral": 0}
        for r in sent_rows:
            sentiment = str(r[0]).lower()
            if sentiment in sent_counts:
                sent_counts[sentiment] = int(r[1])
                
        total_comments = sum(sent_counts.values())
        pos_percent = round((sent_counts["positive"] / total_comments) * 100) if total_comments > 0 else 0
        neg_percent = round((sent_counts["negative"] / total_comments) * 100) if total_comments > 0 else 0

        sentiment_data = {
            "positive": sent_counts["positive"],
            "negative": sent_counts["negative"],
            "neutral": sent_counts["neutral"],
            "posPercent": pos_percent,
            "negPercent": neg_percent
        }

        theme_query = (
            f"SELECT topic, count() as total, "
            f"       countIf(topic_sentiments[topic] = 'positive') as pos_c, "
            f"       countIf(topic_sentiments[topic] = 'negative') as neg_c "
            f"FROM studio_oracle.audience_comments "
            f"ARRAY JOIN topics AS topic "
            f"WHERE content_id = '{content_id}' GROUP BY topic ORDER BY total DESC"
        )
        try:
            theme_rows = client.query(theme_query).result_rows
        except Exception:
            theme_rows = []

        themes = []
        for r in theme_rows:
            topic = str(r[0])
            total = int(r[1])
            pos_c = int(r[2])
            neg_c = int(r[3])
            themes.append({
                "name": topic,
                "count": total,
                "posPercent": round((pos_c / total) * 100) if total > 0 else 0,
                "negPercent": round((neg_c / total) * 100) if total > 0 else 0
            })

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
            f"   AND countIf(topic_sentiments[topic] = 'negative') > 0 "
            f"ORDER BY count() DESC "
            f"LIMIT 3"
        )
        try:
            conflict_rows = client.query(conflict_query).result_rows
        except Exception:
            conflict_rows = []

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
                    "positive": {"text": pos_text, "author": pos_author, "source": "youtube", "likes": 0, "published": ""},
                    "negative": {"text": neg_text, "author": neg_author, "source": "youtube", "likes": 0, "published": ""}
                })

        analytics_res = {
            "sentiment": sentiment_data,
            "themes": themes,
            "conflicts": conflicts
        }
        set_cached(cache_key, analytics_res)
        return analytics_res

    @staticmethod
    def get_platform_breakdown(content_id: str) -> Dict[str, Any]:
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
        try:
            rows = client.query(query).result_rows
        except Exception:
            rows = []

        breakdown = {}
        for r in rows:
            src = str(r[0]).lower()
            total = int(r[1])
            pos = int(r[2])
            neg = int(r[3])
            breakdown[src] = {
                "total": total,
                "posPercent": round((pos / total) * 100) if total > 0 else 0,
                "negPercent": round((neg / total) * 100) if total > 0 else 0,
                "topPositive": str(r[4] or ""),
                "topNegative": str(r[5] or "")
            }
        return breakdown

    @staticmethod
    def get_drops(content_id: str) -> List[Dict[str, Any]]:
        client = get_clickhouse_client()
        posts_query = f"""
        SELECT post_id, title, url, published_at
        FROM studio_oracle.audience_posts
        WHERE content_id = '{content_id}'
        ORDER BY published_at ASC
        """
        try:
            posts = client.query(posts_query).result_rows
        except Exception:
            posts = []

        if not posts:
            return []

        drops = []
        for p in posts:
            post_id = str(p[0])
            title = str(p[1])
            url = str(p[2])
            pub_date = str(p[3])[:10] if p[3] else "Drop"

            comm_query = f"""
            SELECT 
                count() as total,
                countIf(sentiment = 'positive') as pos,
                countIf(sentiment = 'negative') as neg,
                argMax(text, like_count) FILTER (WHERE sentiment = 'positive') as top_comment
            FROM studio_oracle.audience_comments
            WHERE content_id = '{content_id}' AND post_id = '{post_id}'
            """
            try:
                c_res = client.query(comm_query).result_rows
                if c_res and c_res[0][0] > 0:
                    tot = c_res[0][0]
                    pos = c_res[0][1]
                    neg = c_res[0][2]
                    top_c = str(c_res[0][3] or "")
                    drops.append({
                        "id": post_id,
                        "title": title,
                        "url": url,
                        "published_at": pub_date,
                        "total_comments": tot,
                        "posPercent": round((pos / tot) * 100),
                        "negPercent": round((neg / tot) * 100),
                        "topComment": top_c
                    })
            except Exception:
                pass
        return drops

    @staticmethod
    def get_timeline(content_id: str) -> List[Dict[str, Any]]:
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
        try:
            rows = client.query(timeline_query).result_rows
            return [
                {
                    "date": str(r[0])[:10],
                    "dominantTopic": str(r[1]),
                    "totalComments": int(r[2]),
                    "posPercent": round((int(r[3]) / int(r[2])) * 100) if int(r[2]) > 0 else 0,
                    "negPercent": round((int(r[4]) / int(r[2])) * 100) if int(r[2]) > 0 else 0,
                    "topComment": str(r[5] or "")
                } for r in rows
            ]
        except Exception:
            return []
