import os
import sys
import time
from datetime import datetime

# Add server directory to path
server_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(server_dir)

from ingestion.youtube import get_clickhouse_client, analyze_comments

def run_migration():
    client = get_clickhouse_client()
    
    print("Fetching pending comments from ClickHouse...")
    query = """
    SELECT 
        comment_id, 
        post_id, 
        content_id, 
        source, 
        text, 
        author, 
        published_at, 
        like_count, 
        collected_at
    FROM studio_oracle.audience_comments
    WHERE analysis_status = 'pending'
    """
    
    rows = client.query(query).result_rows
    if not rows:
        print("No pending comments found. Migration complete!")
        return
        
    print(f"Found {len(rows)} pending comments. Beginning Gemini analysis in batches of 20...")
    
    # Run the analysis
    analyzed_comments = analyze_comments(rows)
    print(f"Analysis complete for {len(analyzed_comments)} comments.")
    
    # Collect comment IDs to delete
    comment_ids = [r[0] for r in rows]
    comment_ids_str = ", ".join([f"'{c_id}'" for c_id in comment_ids])
    
    print("Executing deletion of pending comments in ClickHouse...")
    client.command(f"ALTER TABLE studio_oracle.audience_comments DELETE WHERE comment_id IN ({comment_ids_str})")
    
    # Wait for the deletion mutation to finish to prevent duplicates
    print("Waiting for deletion mutation to complete...")
    retries = 0
    while retries < 30:
        unfinished = client.query(
            "SELECT count() FROM system.mutations WHERE table = 'audience_comments' AND is_done = 0"
        ).result_rows[0][0]
        if unfinished == 0:
            print("Mutation complete. Proceeding with insert.")
            break
        print(f"Waiting... {unfinished} unfinished mutations remaining.")
        time.sleep(1)
        retries += 1
        
    # Insert the newly analyzed comments
    print("Inserting analyzed comments...")
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
    print("Migration successfully completed!")

if __name__ == "__main__":
    run_migration()

