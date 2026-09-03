CREATE DATABASE IF NOT EXISTS studio_oracle;

CREATE TABLE IF NOT EXISTS studio_oracle.content
(
    content_id UUID,
    content_type LowCardinality(String),
    title String,
    description String,
    release_date Nullable(Date),
    metadata String,
    target_terms Array(String),
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree
ORDER BY content_id;


CREATE TABLE IF NOT EXISTS studio_oracle.audience_posts
(
    post_id String,
    content_id UUID,
    source LowCardinality(String),
    title String,
    author String,
    post_type LowCardinality(String),
    published_at DateTime,
    url String,
    collected_at DateTime DEFAULT now()
)
ENGINE = MergeTree
ORDER BY (content_id, source, published_at);


CREATE TABLE IF NOT EXISTS studio_oracle.audience_comments
(
    comment_id String,
    post_id String,
    content_id UUID,
    source LowCardinality(String),
    text String,
    author String,
    published_at DateTime,
    like_count UInt32,
    collected_at DateTime DEFAULT now(),
    sentiment LowCardinality(String) DEFAULT 'neutral',
    aspect LowCardinality(String) DEFAULT 'General',
    claim String DEFAULT '',
    evidence_type LowCardinality(String) DEFAULT 'neutral',
    confidence Float32 DEFAULT 1.0,
    topics Array(String),
    topic_sentiments Map(String, String),
    analysis_status LowCardinality(String) DEFAULT 'success'
)
ENGINE = MergeTree
ORDER BY (content_id, source, published_at);