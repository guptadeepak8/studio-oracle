import os
import time
import random
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from ingestion.youtube import get_clickhouse_client
from tools.movie import create_content_record
import db

# Realistic comment variations and topics for realistic distribution
POS_COMMENTS = [
    ("The cinematography in this trailer is genuinely breathtaking. Ridley Scott still has it!", ["cinematography", "visuals", "scale"]),
    ("Paul Mescal and Pedro Pascal have unreal on-screen presence. That Colosseum scene gave me chills.", ["casting", "performance", "action"]),
    ("The Hans Zimmer influenced score ramping up in the background is absolute perfection.", ["soundtrack", "music", "score"]),
    ("Practical sets and actual water in the arena battle? Finally a movie that respects real craft.", ["practical_effects", "scale", "craft"]),
    ("Day one IMAX ticket secured. This is why we go to movie theaters.", ["imax", "spectacle", "theater_experience"]),
    ("Denzel Washington looks like he is having the time of his life in this role.", ["casting", "denzel", "performance"]),
    ("The fight choreography looks way more visceral and grounded than modern CGI blockbusters.", ["action", "choreography", "stunts"]),
]

NEG_COMMENTS = [
    ("The digital lighting and CGI rhinos look slightly unfinished. Hopefully they polish the VFX.", ["cgi", "vfx", "visuals"]),
    ("I am worried about the pacing. Trailer feels like it gave away the entire second act.", ["pacing", "story", "trailer_cut"]),
    ("The rap music choice in the original teaser trailer felt completely out of place for ancient Rome.", ["music", "soundtrack", "trailer_editing"]),
    ("Why did they feel the need to connect every plot thread directly to the original Maximus storyline?", ["lore", "story", "sequel_continuity"]),
    ("Dialogue in a few scenes sounds a bit generic for a historical epic.", ["script", "dialogue", "story"]),
]

NEU_COMMENTS = [
    ("Curious to see how the box office holds up against other November holiday releases.", ["box_office", "release_date"]),
    ("Is this releasing in Dolby Cinema and 70mm as well as standard IMAX?", ["imax", "formats"]),
    ("Runtime is reported to be around 2 hours and 30 minutes.", ["runtime", "story"]),
    ("Trailer looks solid, waiting for early critic reviews before buying weekend tickets.", ["reviews", "anticipation"]),
]

AUTHORS = ["Cinephile99", "MovieBuff_Max", "ArenaCritic", "FilmSnob_London", "ActionJunkie", "BoxOfficeTracker", "ScreenRantFan", "GladiatorFan2000", "VFXArtist_Tom", "LoreMaster_Rome"]

def seed_100k_benchmark(target_count: int = 100000):
    print(f"\n========================================================")
    print(f"🚀 StudioOracle ClickHouse Scale Benchmark: {target_count:,} Comments")
    print(f"========================================================\n")
    
    client = get_clickhouse_client()
    
    # 1. Create or retrieve benchmark campaign
    benchmark_title = "Gladiator II (100K Scale Benchmark)"
    movies = db.fetch_movies()
    benchmark_movie = next((m for m in movies if "100K" in m["title"]), None)
    
    if benchmark_movie:
        content_id = benchmark_movie["content_id"]
        print(f"Using existing benchmark campaign: '{benchmark_title}' ({content_id})")
    else:
        print(f"Creating new benchmark campaign: '{benchmark_title}'...")
        content_id = create_content_record(
            title=benchmark_title,
            content_type="movie",
            description="High-velocity 100,000 comment audience feedback scale benchmark testing ClickHouse columnar execution speed.",
            release_date="2026-11-22",
            target_terms=["Gladiator II Official Trailer", "Gladiator 2 Reddit"]
        )
        db.set_campaign_status(content_id, "active")
        print(f"Created benchmark campaign with ID: {content_id}")

    # Check existing comments count
    cnt_query = f"SELECT count() FROM studio_oracle.audience_comments WHERE content_id = '{content_id}'"
    existing_count = client.query(cnt_query).result_rows[0][0]
    print(f"Current comments in ClickHouse for benchmark campaign: {existing_count:,}")

    if existing_count < target_count:
        needed = target_count - existing_count
        print(f"\nGenerating and inserting {needed:,} comments in high-speed vectorized batches...")
        
        batch_size = 10000
        total_inserted = 0
        insert_start = time.time()
        
        base_time = datetime.now() - timedelta(days=14)
        
        while total_inserted < needed:
            current_batch_size = min(batch_size, needed - total_inserted)
            batch_rows = []
            
            for i in range(current_batch_size):
                cid = f"bm_{uuid.uuid4().hex[:12]}"
                pid = f"vid_{random.randint(1, 10)}"
                source = "youtube" if random.random() < 0.65 else "reddit"
                
                # Distribution: 58% pos, 28% neg, 14% neutral
                rand_val = random.random()
                if rand_val < 0.58:
                    text, topics = random.choice(POS_COMMENTS)
                    sentiment = "positive"
                    evidence_type = "praise" if random.random() < 0.7 else "hype"
                    aspect = "Highlight"
                    claim = "Positive audience anticipation for visual spectacle and casting"
                elif rand_val < 0.86:
                    text, topics = random.choice(NEG_COMMENTS)
                    sentiment = "negative"
                    evidence_type = "critique"
                    aspect = "Concern"
                    claim = "Criticism regarding CGI visual effects and trailer pacing"
                else:
                    text, topics = random.choice(NEU_COMMENTS)
                    sentiment = "neutral"
                    evidence_type = "neutral"
                    aspect = "General"
                    claim = "General release date and format inquiries"

                author = random.choice(AUTHORS) + str(random.randint(10, 999))
                pub_time = base_time + timedelta(minutes=random.randint(1, 20160))
                like_cnt = random.randint(0, 500) if random.random() < 0.3 else random.randint(0, 50)
                conf = round(random.uniform(0.78, 0.98), 2)
                
                topic_sentiments = {t: sentiment for t in topics}

                batch_rows.append((
                    cid, pid, content_id, source, text, author,
                    pub_time, like_cnt, datetime.now(),
                    sentiment, aspect, claim, evidence_type, conf,
                    topics, topic_sentiments, "success"
                ))

            # Direct vectorized insert into ClickHouse
            client.insert(
                "studio_oracle.audience_comments",
                batch_rows,
                column_names=[
                    "comment_id", "post_id", "content_id", "source", "text",
                    "author", "published_at", "like_count", "collected_at",
                    "sentiment", "aspect", "claim", "evidence_type", "confidence",
                    "topics", "topic_sentiments", "analysis_status"
                ]
            )
            total_inserted += current_batch_size
            print(f"  Inserted {total_inserted:,} / {needed:,} comments into ClickHouse...")

        insert_duration = time.time() - insert_start
        print(f"\n✅ Inserted {needed:,} comments in {insert_duration:.2f} seconds (Rate: {needed/insert_duration:,.0f} rows/sec)!\n")

    # Invalidate cache so fresh benchmark analytics load immediately
    db.invalidate_campaign_cache(content_id)

    # 2. RUN SPEED BENCHMARKS (The Hackathon Flex)
    print("--------------------------------------------------------")
    print("⚡ RUNNING CLICKHOUSE REAL-TIME SPEED TESTS ACROSS 100K ROWS")
    print("--------------------------------------------------------")

    # Test 1: Full Sentiment Count Aggregation
    t0 = time.time()
    q1 = f"SELECT sentiment, count() FROM studio_oracle.audience_comments WHERE content_id = '{content_id}' GROUP BY sentiment"
    res1 = client.query(q1).result_rows
    lat1 = (time.time() - t0) * 1000
    print(f"1. Full Sentiment Aggregation (100K rows) : {lat1:.2f} ms -> {res1}")

    # Test 2: Multi-dimensional ARRAY JOIN topic grouping
    t0 = time.time()
    q2 = f"""
    SELECT topic, count() as cnt, countIf(sentiment = 'positive') as pos, countIf(sentiment = 'negative') as neg
    FROM studio_oracle.audience_comments
    ARRAY JOIN topics AS topic
    WHERE content_id = '{content_id}'
    GROUP BY topic ORDER BY cnt DESC LIMIT 10
    """
    res2 = client.query(q2).result_rows
    lat2 = (time.time() - t0) * 1000
    print(f"2. Array Join Topic Aggregation (100K rows): {lat2:.2f} ms -> {len(res2)} topics grouped")

    # Test 3: Cross-Platform Sentiment Divergence
    t0 = time.time()
    q3 = f"""
    SELECT source, count(), countIf(sentiment='positive'), countIf(sentiment='negative')
    FROM studio_oracle.audience_comments
    WHERE content_id = '{content_id}'
    GROUP BY source
    """
    res3 = client.query(q3).result_rows
    lat3 = (time.time() - t0) * 1000
    print(f"3. Cross-Platform Divergence Calculation   : {lat3:.2f} ms -> {res3}")

    # Test 4: Extreme Value Extraction (argMax top positive & negative verbatim quotes)
    t0 = time.time()
    q4 = f"""
    SELECT 
        argMax(text, like_count) FILTER (WHERE sentiment = 'positive'),
        argMax(text, like_count) FILTER (WHERE sentiment = 'negative')
    FROM studio_oracle.audience_comments
    WHERE content_id = '{content_id}'
    """
    res4 = client.query(q4).result_rows
    lat4 = (time.time() - t0) * 1000
    print(f"4. Extreme argMax Quote Extraction         : {lat4:.2f} ms")

    print(f"\n========================================================")
    print(f"🏆 BENCHMARK RESULT: Average ClickHouse query latency: {(lat1+lat2+lat3+lat4)/4:.2f} ms across 100,000+ comments!")
    print(f"========================================================\n")
    return content_id

if __name__ == "__main__":
    seed_100k_benchmark(100000)
