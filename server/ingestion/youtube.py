import os
import requests
import uuid
import random
from datetime import datetime, timedelta
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
    Search YouTube videos matching `query` and fetch comments.
    Saves to ClickHouse `audience_posts` and `audience_comments` tables.
    If YOUTUBE_API_KEY is not available, falls back to generating rich mock data.
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    client = get_clickhouse_client()
    
    posts_data = []
    comments_data = []
    
    # Try to fetch live data if API key is provided
    use_live = False
    if api_key:
        try:
            print(f"Attempting live YouTube API fetch for query: '{query}'...")
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
            if search_res.status_code == 200:
                use_live = True
                items = search_res.json().get("items", [])
                
                for item in items:
                    video_id = item["id"]["videoId"]
                    snippet = item["snippet"]
                    published_at_raw = snippet["publishedAt"] # e.g. "2026-08-28T16:00:00Z"
                    published_at = datetime.strptime(published_at_raw, "%Y-%m-%dT%H:%M:%SZ")
                    
                    posts_data.append((
                        video_id,
                        uuid.UUID(content_id) if isinstance(content_id, str) else content_id,
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
                        "maxResults": 20,
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
                                uuid.UUID(content_id) if isinstance(content_id, str) else content_id,
                                "youtube",
                                c_snippet["textDisplay"],
                                c_snippet["authorDisplayName"],
                                c_pub,
                                c_snippet["likeCount"],
                                datetime.now()
                            ))
            else:
                print(f"YouTube API returned error {search_res.status_code}: {search_res.text}")
        except Exception as e:
            print(f"Error during live YouTube fetch: {e}")
            
    # Fallback to mock data if API key failed or was missing
    if not use_live:
        print("Using rich mock YouTube dataset fallback...")
        mock_videos = [
            ("vid_101", f"{query} Official Trailer 1", "Studio Official"),
            ("vid_102", f"{query} Teaser & Behind The Scenes", "Movie Hype Channel"),
            ("vid_103", f"Is {query} actually going to be good? - Trailer Review", "Cinematic Critique")
        ][:limit]
        
        base_time = datetime.now() - timedelta(days=7)
        
        # Define rich mock comments to showcase contradiction detection, sentiment over time, and time-series analysis
        mock_comment_pool = [
            # Positive / Hype
            ("This looks absolutely stunning! The visuals and cinematography are next level.", "positive", 120),
            ("I got goosebumps watching the trailer. This might be movie of the year!", "positive", 340),
            ("That orchestral score in the second half of the trailer was beautiful.", "positive", 85),
            ("The casting is spot on. Paul Mescal looks incredibly intense and fits the role perfectly.", "positive", 250),
            ("Denzel Washington is going to carry this movie. He steals every scene in the teaser.", "positive", 412),
            ("Honestly, this exceeded my expectations. So excited for the launch!", "positive", 95),
            
            # Negative / Critical
            ("Looks like a generic superhero movie CGI soup. The original had soul, this feels empty.", "negative", 180),
            ("Why does every modern trailer ruin the entire plot? I feel like I've seen the whole movie.", "negative", 215),
            ("The CGI on the colosseum and the water battle looks super video-gamey. Disappointed.", "negative", 64),
            ("Not feeling the actor playing the lead. He lacks the presence of the original protagonist.", "negative", 143),
            ("Another unoriginal Hollywood cash-grab. Nobody asked for a sequel to this.", "negative", 305),
            ("The soundtrack choice in the trailer was terrible. Totally ruined the atmosphere.", "negative", 98),
            
            # Neutral / Inquisitive
            ("I'm cautiously optimistic. Visuals are great, but the writing needs to hold up.", "neutral", 45),
            ("Is it just me, or does the timeline in this sequel feel a bit compressed?", "neutral", 12),
            ("Interesting trailer. It has a completely different tone than what I expected.", "neutral", 38)
        ]
        
        for idx, (vid_id, vid_title, channel) in enumerate(mock_videos):
            # Insert video post
            vid_time = base_time + timedelta(days=idx, hours=random.randint(0, 12))
            posts_data.append((
                vid_id,
                uuid.UUID(content_id) if isinstance(content_id, str) else content_id,
                "youtube",
                vid_title,
                channel,
                "video",
                vid_time,
                f"https://www.youtube.com/watch?v={vid_id}",
                datetime.now()
            ))
            
            # Generate comments over a 7-day timeline (increasing volume, shifting sentiment)
            for c_idx in range(25):
                text, sentiment, base_likes = random.choice(mock_comment_pool)
                comment_time = vid_time + timedelta(days=random.randint(0, 3), hours=random.randint(0, 23))
                like_count = max(0, int(base_likes * random.uniform(0.5, 1.5)))
                author = f"User_{random.randint(1000, 9999)}"
                
                comments_data.append((
                    f"c_{vid_id}_{c_idx}",
                    vid_id,
                    uuid.UUID(content_id) if isinstance(content_id, str) else content_id,
                    "youtube",
                    text,
                    author,
                    comment_time,
                    like_count,
                    datetime.now()
                ))

    # Insert into ClickHouse
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
        print(f"Writing {len(comments_data)} comments to ClickHouse...")
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
        "source": "live" if use_live else "mock"
    }

if __name__ == "__main__":
    # Test execution
    test_uuid = "11111111-1111-1111-1111-111111111111"
    print("Testing YouTube ingestion script locally...")
    res = ingest_youtube_data(test_uuid, "Gladiator II Trailer")
    print("Ingestion Result:", res)