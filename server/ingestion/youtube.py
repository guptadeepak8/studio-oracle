import os
import re
import requests
import uuid
from datetime import datetime
import clickhouse_connect
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Dict

class CommentAnalysis(BaseModel):
    comment_id: str
    overall_sentiment: str = Field(description="Must be one of: 'positive', 'negative', 'neutral', 'mixed', 'unknown'")
    topics: List[str] = Field(description="Concise, lowercase topics/themes discussed (e.g. 'casting', 'cgi', 'franchise_fatigue'). Return empty list if no specific topic.")
    topic_sentiments: Dict[str, str] = Field(
        description="Sentiment associated with each topic. Keys must be present in the topics list, values must be one of: 'positive', 'negative', 'neutral'."
    )
    claim: str = Field(description="Summary of commenter's opinion, not stated as objective fact.")
    evidence_type: str = Field(description="Must be one of: 'praise', 'critique', 'question', 'hype', 'mixed', 'neutral'")
    confidence: float = Field(description="Confidence rating of model's interpretation between 0.0 and 1.0.")

class IngestionAnalysisBatch(BaseModel):
    analyses: List[CommentAnalysis]

import concurrent.futures
import json

def process_single_batch(batch, client):
    # Prepare prompt
    prompt = "Analyze the sentiment, topics, claim, evidence type, and confidence score for the following audience comments:\n\n"
    for idx, c in enumerate(batch):
        comment_id, _, _, _, text, _, _, _, _ = c
        clean_text = str(text).replace("\n", " ")[:300]
        prompt += f"ID: {comment_id}\nText: {clean_text}\n---\n"
        
    try:
        res = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=IngestionAnalysisBatch,
                system_instruction=(
                    "Perform structured analysis on audience comments. For each comment ID, discover dynamic, specific, "
                    "concise topics (lowercase, normalized, e.g. 'casting', 'visual_effects', 'soundtrack', 'franchise_fatigue'). "
                    "Associate topic-level sentiments. Determine overall sentiment (positive/negative/neutral/mixed/unknown), "
                    "claim (opinion summary without stating opinions as facts), evidence type (praise/critique/question/hype/mixed/neutral), "
                    "and confidence (lower if sarcastic/ambiguous)."
                )
            )
        )
        data = json.loads(res.text)
        analyses_map = {item["comment_id"]: item for item in data.get("analyses", [])}
        
        batch_res = []
        for c in batch:
            c_id = c[0]
            analysis = analyses_map.get(c_id, {})
            sentiment = analysis.get("overall_sentiment", "neutral").lower()
            claim = analysis.get("claim", "")
            evidence_type = analysis.get("evidence_type", "neutral").lower()
            confidence = float(analysis.get("confidence", 1.0))
            topics = analysis.get("topics", [])
            topic_sentiments = analysis.get("topic_sentiments", {})
            
            if sentiment not in ["positive", "negative", "neutral", "mixed", "unknown"]:
                sentiment = "neutral"
            if evidence_type not in ["praise", "critique", "question", "hype", "mixed", "neutral"]:
                evidence_type = "neutral"
            if not isinstance(topics, list):
                topics = []
            if not isinstance(topic_sentiments, dict):
                topic_sentiments = {}
                
            batch_res.append(c + (sentiment, "General", claim, evidence_type, confidence, topics, topic_sentiments, "success"))
        return batch_res
    except Exception as batch_err:
        print(f"Error analyzing batch: {batch_err}. Falling back to default values for this batch.")
        return [c + ("neutral", "General", "", "neutral", 0.0, [], {}, "failed") for c in batch]

def analyze_comments(comments: list) -> list:
    """
    Given a list of comment tuples, calls Gemini in parallel batches of 25 using ThreadPoolExecutor.
    """
    if not comments:
        return []
        
    try:
        client = genai.Client(vertexai=True)
    except Exception as e:
        print(f"Failed to initialize GenAI Client: {e}. Falling back to default analysis values.")
        return [c + ("neutral", "General", "", "neutral", 0.0, [], {}, "failed") for c in comments]

    batch_size = 25
    batches = [comments[i:i+batch_size] for i in range(0, len(comments), batch_size)]
    
    analyzed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        future_to_batch = {executor.submit(process_single_batch, b, client): idx for idx, b in enumerate(batches)}
        for future in concurrent.futures.as_completed(future_to_batch):
            try:
                result = future.result()
                analyzed.extend(result)
            except Exception as e:
                print(f"Batch thread error: {e}")
                
    return analyzed


from core.database import get_clickhouse_client

def extract_youtube_video_id(url_or_query: str) -> str | None:
    """Extract YouTube video ID if string is a direct YouTube link."""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'youtu\.be\/([0-9A-Za-z_-]{11})',
        r'youtube\.com\/embed\/([0-9A-Za-z_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_query)
        if match:
            return match.group(1)
    return None

def search_youtube_trailers(query: str, limit: int = 6) -> List[Dict]:
    """Search YouTube Data API v3 for official movie trailers matching query."""
    api_key = os.getenv("YOUTUBE_API_KEY")
    clean_query = (query or "").strip()
    if not clean_query:
        return []

    direct_vid = extract_youtube_video_id(clean_query)
    if direct_vid:
        return [{
            "video_id": direct_vid,
            "title": f"Direct YouTube Video ({direct_vid})",
            "channel_title": "YouTube",
            "description": "Direct YouTube video target URL",
            "published_at": "",
            "thumbnail_url": f"https://i.ytimg.com/vi/{direct_vid}/mqdefault.jpg",
            "url": f"https://www.youtube.com/watch?v={direct_vid}"
        }]

    if not api_key:
        return []

    search_term = clean_query if "trailer" in clean_query.lower() else f"{clean_query} official trailer"
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": search_term,
        "type": "video",
        "maxResults": limit,
        "key": api_key
    }
    
    try:
        res = requests.get(search_url, params=params, timeout=10)
        if res.status_code != 200:
            return []
        items = res.json().get("items", [])
        results = []
        for item in items:
            vid_id = item.get("id", {}).get("videoId")
            if not vid_id:
                continue
            snippet = item.get("snippet", {})
            thumbnails = snippet.get("thumbnails", {})
            thumb = (
                thumbnails.get("medium", {}).get("url") or
                thumbnails.get("default", {}).get("url") or
                f"https://i.ytimg.com/vi/{vid_id}/mqdefault.jpg"
            )
            pub_date = snippet.get("publishedAt", "")[:10]
            
            results.append({
                "video_id": vid_id,
                "title": snippet.get("title", ""),
                "channel_title": snippet.get("channelTitle", ""),
                "description": snippet.get("description", ""),
                "published_at": pub_date,
                "thumbnail_url": thumb,
                "url": f"https://www.youtube.com/watch?v={vid_id}"
            })
        return results
    except Exception as e:
        print(f"Error searching YouTube trailers: {e}")
        return []

def ingest_youtube_data(content_id: str, query: str, limit: int = 3, max_comments_per_video: int = 500) -> dict:
    """
    Search YouTube videos or direct URL matching `query`, paginate comments up to `max_comments_per_video`,
    and stream results to ClickHouse `audience_posts` and `audience_comments` tables.
    """
    try:
        target_uuid = uuid.UUID(content_id) if isinstance(content_id, str) else content_id
    except (ValueError, TypeError, AttributeError):
        return {
            "status": "error",
            "message": f"Invalid content_id: '{content_id}'. Must be a valid UUID string."
        }

    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return {
            "status": "error",
            "message": "YOUTUBE_API_KEY is not configured in the environment (.env) file."
        }

    client = get_clickhouse_client()
    posts_data = []
    comments_data = []

    try:
        print(f"Executing YouTube ingestion for target '{query}' (limit: {limit}, max_comments: {max_comments_per_video})...")
        
        target_video_ids = []
        direct_vid = extract_youtube_video_id(query)

        if direct_vid:
            # Fetch snippet directly for this specific video
            video_url = "https://www.googleapis.com/youtube/v3/videos"
            video_params = {
                "part": "snippet",
                "id": direct_vid,
                "key": api_key
            }
            v_res = requests.get(video_url, params=video_params, timeout=15)
            if v_res.status_code == 200:
                v_items = v_res.json().get("items", [])
                for it in v_items:
                    snippet = it["snippet"]
                    pub_at = datetime.strptime(snippet["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
                    posts_data.append((
                        direct_vid,
                        target_uuid,
                        "youtube",
                        snippet["title"],
                        snippet["channelTitle"],
                        "video",
                        pub_at,
                        f"https://www.youtube.com/watch?v={direct_vid}",
                        datetime.now()
                    ))
                    target_video_ids.append(direct_vid)
        else:
            # 1. Search Videos matching query
            search_url = "https://www.googleapis.com/youtube/v3/search"
            search_params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": limit,
                "key": api_key
            }
            search_res = requests.get(search_url, params=search_params, timeout=15)
            if search_res.status_code != 200:
                return {
                    "status": "error",
                    "message": f"YouTube API search error ({search_res.status_code}): {search_res.text}"
                }

            items = search_res.json().get("items", [])
            for item in items:
                if "videoId" not in item.get("id", {}):
                    continue
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                published_at = datetime.strptime(snippet["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
                
                posts_data.append((
                    video_id,
                    target_uuid,
                    "youtube",
                    snippet["title"],
                    snippet["channelTitle"],
                    "video",
                    published_at,
                    f"https://www.youtube.com/watch?v={video_id}",
                    datetime.now()
                ))
                target_video_ids.append(video_id)

        # 2. Paginated Deep Comment Fetching for each video (up to max_comments_per_video)
        comment_url = "https://www.googleapis.com/youtube/v3/commentThreads"

        for video_id in target_video_ids:
            next_page_token = None
            fetched_for_video = 0
            
            while fetched_for_video < max_comments_per_video:
                comment_params = {
                    "part": "snippet",
                    "videoId": video_id,
                    "maxResults": min(100, max_comments_per_video - fetched_for_video),
                    "key": api_key
                }
                if next_page_token:
                    comment_params["pageToken"] = next_page_token

                comment_res = requests.get(comment_url, params=comment_params, timeout=15)
                if comment_res.status_code != 200:
                    print(f"Comment fetch stop for video {video_id} ({comment_res.status_code})")
                    break

                res_json = comment_res.json()
                comment_items = res_json.get("items", [])
                if not comment_items:
                    break

                for c_item in comment_items:
                    c_snippet = c_item["snippet"]["topLevelComment"]["snippet"]
                    c_pub = datetime.strptime(c_snippet["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
                    
                    comments_data.append((
                        c_item["id"],
                        video_id,
                        target_uuid,
                        "youtube",
                        c_snippet["textDisplay"],
                        c_snippet["authorDisplayName"],
                        c_pub,
                        c_snippet.get("likeCount", 0),
                        datetime.now()
                    ))
                    fetched_for_video += 1

                next_page_token = res_json.get("nextPageToken")
                if not next_page_token:
                    break

    except Exception as e:
        return {
            "status": "error",
            "message": f"Network error during YouTube ingestion: {str(e)}"
        }

    # Insert into ClickHouse (with deduplication)
    if posts_data:
        try:
            existing_posts = {r[0] for r in client.query(f"SELECT post_id FROM studio_oracle.audience_posts WHERE content_id = '{target_uuid}'").result_rows}
            posts_data = [p for p in posts_data if p[0] not in existing_posts]
        except Exception as db_err:
            print(f"Database error querying existing posts: {db_err}")
            
        if posts_data:
            print(f"Writing {len(posts_data)} posts to ClickHouse...")
            client.insert(
                "studio_oracle.audience_posts",
                posts_data,
                column_names=[
                    "post_id", "content_id", "source", "title", "author",
                    "post_type", "published_at", "url", "collected_at"
                ]
            )
        
    if comments_data:
        try:
            existing_comments = {r[0] for r in client.query(f"SELECT comment_id FROM studio_oracle.audience_comments WHERE content_id = '{target_uuid}'").result_rows}
            comments_data = [c for c in comments_data if c[0] not in existing_comments]
        except Exception as db_err:
            print(f"Database error querying existing comments: {db_err}")
            
        if comments_data:
            print(f"Analyzing {len(comments_data)} audience comments via Gemini...")
            analyzed_comments = analyze_comments(comments_data)
            print(f"Writing {len(analyzed_comments)} analyzed comments to ClickHouse...")
            client.insert(
                "studio_oracle.audience_comments",
                analyzed_comments,
                column_names=[
                    "comment_id", "post_id", "content_id", "source", "text",
                    "author", "published_at", "like_count", "collected_at",
                    "sentiment", "aspect", "claim", "evidence_type", "confidence",
                    "topics", "topic_sentiments", "analysis_status"
                ]
            )
            try:
                from core.cache import invalidate_cache
                invalidate_cache(str(target_uuid))
                invalidate_cache("all_movies")
            except Exception:
                pass
            
            try:
                from core.pubsub import publish_campaign_event_sync
                publish_campaign_event_sync(str(target_uuid), "INGESTION_COMPLETED", {
                    "ingested_comments": len(analyzed_comments),
                    "ingested_posts": len(posts_data)
                })
            except Exception as pe:
                print(f"PubSub event error: {pe}")
        
    return {
        "status": "success",
        "ingested_posts": len(posts_data),
        "ingested_comments": len(comments_data),
        "source": "live"
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python youtube.py <content_id> <search_query>")
        sys.exit(1)
    res = ingest_youtube_data(sys.argv[1], sys.argv[2], limit=3, max_comments_per_video=500)
    print("Ingestion Result:", res)