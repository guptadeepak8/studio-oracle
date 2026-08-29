import os
import requests
import uuid
from datetime import datetime
import clickhouse_connect
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

def get_clickhouse_client():
    host = os.getenv("CLICKHOUSE_HOST")
    port = os.getenv("CLICKHOUSE_PORT", "8443")
    user = os.getenv("CLICKHOUSE_USER", "default")
    password = os.getenv("CLICKHOUSE_PASSWORD")
    secure = os.getenv("CLICKHOUSE_SECURE", "true").lower() == "true"

    return clickhouse_connect.get_client(
        host=host,
        port=int(port),
        username=user,
        password=password,
        secure=secure,
        verify=True
    )

def ingest_youtube_data(content_id: str, query: str, limit: int = 3) -> dict:
    """
    Search YouTube videos matching `query` and fetch comments using the YouTube API.
    Saves results to ClickHouse `audience_posts` and `audience_comments` tables.
    Returns an error if YOUTUBE_API_KEY is not available or if the API call fails.
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
            "message": "YOUTUBE_API_KEY is not configured in the environment (.env) file. Cannot run real ingestion."
        }

    client = get_clickhouse_client()
    posts_data = []
    comments_data = []

    try:
        print(f"Executing live YouTube API fetch for query: '{query}'...")
        
        # 1. Search Videos
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
        if not items:
            return {
                "status": "success",
                "ingested_posts": 0,
                "ingested_comments": 0,
                "message": f"No YouTube videos found matching search query: '{query}'."
            }

        for item in items:
            # Handle search results that might be channel items instead of videos
            if "videoId" not in item["id"]:
                continue
            video_id = item["id"]["videoId"]
            snippet = item["snippet"]
            published_at_raw = snippet["publishedAt"]
            published_at = datetime.strptime(published_at_raw, "%Y-%m-%dT%H:%M:%SZ")
            
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
            
            # 2. Fetch Comments for this Video
            comment_url = "https://www.googleapis.com/youtube/v3/commentThreads"
            comment_params = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": 25,
                "key": api_key
            }
            comment_res = requests.get(comment_url, params=comment_params, timeout=15)
            if comment_res.status_code == 200:
                comment_items = comment_res.json().get("items", [])
                for c_item in comment_items:
                    c_snippet = c_item["snippet"]["topLevelComment"]["snippet"]
                    c_pub_raw = c_snippet["publishedAt"]
                    c_pub = datetime.strptime(c_pub_raw, "%Y-%m-%dT%H:%M:%SZ")
                    
                    comments_data.append((
                        c_item["id"],
                        video_id,
                        target_uuid,
                        "youtube",
                        c_snippet["textDisplay"],
                        c_snippet["authorDisplayName"],
                        c_pub,
                        c_snippet["likeCount"],
                        datetime.now()
                    ))
            else:
                print(f"Could not fetch comments for video {video_id} ({comment_res.status_code}): {comment_res.text}")

    except Exception as e:
        return {
            "status": "error",
            "message": f"Network or execution error during YouTube ingestion: {str(e)}"
        }

    # Insert into ClickHouse (with deduplication)
    if posts_data:
        try:
            existing_posts = {r[0] for r in client.query(f"SELECT post_id FROM studio_oracle.audience_posts WHERE content_id = '{target_uuid}'").result_rows}
            posts_data = [p for p in posts_data if p[0] not in existing_posts]
        except Exception as db_err:
            print(f"Database error querying existing posts: {db_err}")
            
        if posts_data:
            print(f"Writing {len(posts_data)} live posts to ClickHouse...")
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
            print(f"Writing {len(comments_data)} live comments to ClickHouse...")
            client.insert(
                "studio_oracle.audience_comments",
                comments_data,
                column_names=[
                    "comment_id", "post_id", "content_id", "source", "text",
                    "author", "published_at", "like_count", "collected_at"
                ]
            )
        
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
    res = ingest_youtube_data(sys.argv[1], sys.argv[2])
    print("Ingestion Result:", res)