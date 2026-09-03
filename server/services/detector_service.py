import uuid
from typing import Dict, Any, List
from core.database import get_clickhouse_client

class DetectorService:
    @staticmethod
    def detect_campaign_signals(content_id: str) -> Dict[str, Any]:
        signals = {
            "content_id": content_id,
            "total_comments": 0,
            "net_sentiment_score": 0.0,
            "positive_pct": 0,
            "negative_pct": 0,
            "neutral_pct": 0,
            "platform_split": {},
            "friction_topics": [],
            "resonance_topics": [],
            "sample_evidence": []
        }

        try:
            cid_uuid = uuid.UUID(str(content_id))
        except (ValueError, TypeError, AttributeError):
            return signals

        client = get_clickhouse_client()

        sent_query = """
        SELECT 
            count() as total,
            countIf(sentiment = 'positive') as pos,
            countIf(sentiment = 'negative') as neg,
            countIf(sentiment = 'neutral') as neu
        FROM studio_oracle.audience_comments
        WHERE content_id = {cid:UUID}
        """
        try:
            sent_res = client.query(sent_query, parameters={"cid": cid_uuid}).result_rows
            if sent_res and sent_res[0][0] > 0:
                tot, pos, neg, neu = sent_res[0]
                signals["total_comments"] = tot
                signals["positive_pct"] = round((pos / tot) * 100)
                signals["negative_pct"] = round((neg / tot) * 100)
                signals["neutral_pct"] = round((neu / tot) * 100)
                signals["net_sentiment_score"] = round((pos - neg) / tot, 2)
        except Exception:
            pass

        if signals["total_comments"] == 0:
            return signals

        plat_query = """
        SELECT 
            source,
            count() as total,
            countIf(sentiment = 'positive') as pos,
            countIf(sentiment = 'negative') as neg
        FROM studio_oracle.audience_comments
        WHERE content_id = {cid:UUID}
        GROUP BY source
        """
        try:
            plat_res = client.query(plat_query, parameters={"cid": cid_uuid}).result_rows
            for r in plat_res:
                src, t, p, n = r[0], r[1], r[2], r[3]
                signals["platform_split"][src] = {
                    "count": t,
                    "positive_pct": round((p / t) * 100) if t > 0 else 0,
                    "negative_pct": round((n / t) * 100) if t > 0 else 0
                }
        except Exception:
            pass

        topic_query = """
        SELECT 
            topic,
            count() as total,
            countIf(topic_sentiments[topic] = 'positive') as pos,
            countIf(topic_sentiments[topic] = 'negative') as neg
        FROM studio_oracle.audience_comments
        ARRAY JOIN topics AS topic
        WHERE content_id = {cid:UUID}
        GROUP BY topic
        HAVING total >= 3
        ORDER BY total DESC
        LIMIT 10
        """
        try:
            topic_res = client.query(topic_query, parameters={"cid": cid_uuid}).result_rows
            for r in topic_res:
                top_name, t, p, n = str(r[0]), int(r[1]), int(r[2]), int(r[3])
                p_pct = round((p / t) * 100) if t > 0 else 0
                n_pct = round((n / t) * 100) if t > 0 else 0
                
                if n_pct >= 25:
                    signals["friction_topics"].append({
                        "topic": top_name,
                        "volume": t,
                        "positive_pct": p_pct,
                        "negative_pct": n_pct,
                        "friction_score": round(n / t, 2)
                    })
                if p_pct >= 50:
                    signals["resonance_topics"].append({
                        "topic": top_name,
                        "volume": t,
                        "positive_pct": p_pct,
                        "negative_pct": n_pct,
                        "resonance_score": round(p / t, 2)
                    })
        except Exception:
            pass

        sample_query = """
        SELECT 
            comment_id, 
            any(source) as source, 
            any(author) as author, 
            text, 
            any(sentiment) as sentiment, 
            any(topics) as topics, 
            max(confidence) as confidence, 
            max(published_at) as max_pub,
            max(like_count) as max_likes
        FROM studio_oracle.audience_comments
        WHERE content_id = {cid:UUID}
        GROUP BY comment_id, text
        ORDER BY max_likes DESC, max_pub DESC
        LIMIT 25
        """
        try:
            sample_res = client.query(sample_query, parameters={"cid": cid_uuid}).result_rows
            seen_texts = set()
            seen_ids = set()
            for r in sample_res:
                c_id = str(r[0])
                c_text = str(r[3]).strip()
                if c_id in seen_ids or c_text in seen_texts or not c_text:
                    continue
                seen_ids.add(c_id)
                seen_texts.add(c_text)
                signals["sample_evidence"].append({
                    "comment_id": c_id,
                    "platform": str(r[1]),
                    "author": str(r[2]) if r[2] else "Audience Member",
                    "text": c_text,
                    "sentiment": str(r[4]),
                    "topics": list(r[5]) if r[5] else [],
                    "confidence": float(r[6]) if r[6] else 0.85,
                    "published_at": str(r[7]) if r[7] else None
                })
        except Exception:
            pass

        return signals
