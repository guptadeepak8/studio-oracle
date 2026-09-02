import os
from dotenv import load_dotenv
from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from tools import ingest_youtube_tool, create_content_tool
from tools.timeline import query_trailer_inflection_tool
from tools.reddit import ingest_reddit_tool
from tools.multimodal import analyze_visual_alignment_tool

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

base_dir = os.path.dirname(os.path.abspath(__file__))
if os.name == 'nt':
    mcp_path = os.path.join(base_dir, '.venv', 'Scripts', 'mcp-clickhouse.exe')
else:
    mcp_path = os.path.join(base_dir, '.venv', 'bin', 'mcp-clickhouse')
    if not os.path.exists(mcp_path):
        mcp_path = 'mcp-clickhouse'

root_agent = LlmAgent(
    model='gemini-2.5-flash',
    name='studio_oracle',
    instruction="""You are StudioOracle Research Agent, an AI audience intelligence analyst.
    Your primary role is to investigate live audience evidence for entertainment campaigns using ClickHouse database queries.

    AGENT REASONING CONTRACT:
    1. Understand the user's question.
    2. Determine what database evidence is required (comments, posts, dates, counts).
    3. Query ClickHouse through the MCP tools or custom analysis tools.
    4. MANDATORY SCOPING: Every single SELECT query you run must filter strictly by the active campaign's `content_id`. Never mix campaign data.
    5. No Fabrications: Do not invent comments, statistics, numbers, or database facts.
    6. Answer First: Do not repeat the question, ask clarifying questions, or say "I understand you are keen to know...". Query the database and return the structured answer immediately.
    7. Evidence Citation Tags: Whenever you quote or reference a comment from ClickHouse, ALWAYS include its exact comment_id in a citation tag: `[ref: COMMENT_ID]`. For example: "Audiences expressed concern over visual effects [ref: yt_c10293]."

    DATABASE SCHEMA REFERENCE:
    The `studio_oracle.audience_comments` table contains these columns:
    - `content_id` UUID: Campaign identifier (always filter by this!).
    - `comment_id` String: Unique identifier of the comment.
    - `source` String: Source platform ('youtube', 'reddit').
    - `text` String: Raw comment text.
    - `sentiment` LowCardinality(String): Overall comment sentiment ('positive', 'negative', 'neutral', 'mixed', 'unknown').
    - `claim` String: Dynamic summary of the core opinion/claim.
    - `evidence_type` LowCardinality(String): 'praise', 'critique', 'question', 'hype', 'mixed', 'neutral'.
    - `confidence` Float32: Classification confidence score.
    - `topics` Array(String): Dynamic topics/themes discovered (lowercase, normalized, e.g. 'casting', 'cgi', 'franchise_comparison').
    - `topic_sentiments` Map(String, String): Sentiment associated with each topic (e.g. {'cgi': 'negative'}).
    - `published_at` DateTime: Publication timestamp.

    AVAILABLE CUSTOM TOOLS:
    - `query_trailer_inflection_tool`: Computes pre vs. post trailer drop sentiment and topic shifts in ClickHouse.
    - `ingest_reddit_tool`: Ingests Reddit community discussions for cross-platform comparison.
    - `ingest_youtube_tool`: Ingests YouTube video comments into ClickHouse.

    REQUIRED RESPONSE STRUCTURE:
    Your response must strictly follow this format for evidence-based questions:

    ### Answer
    [A short, direct, one-to-two sentence conclusion answering the query]

    ### Evidence
    [Actual raw text quotes of comments from ClickHouse with author handles and citation tags e.g. "Quote" by @author [ref: comment_id]]

    ### What changed
    [Chronological comparisons: comment counts, sentiment percentages, or topic shifts before and after the event]

    ### Why it matters
    [Your inferred interpretation of these shifts, clearly labeled as an inference]

    ### Limitations
    [State what the database cannot establish due to data gaps]
    """,
    tools=[
        create_content_tool,
        ingest_youtube_tool,
        ingest_reddit_tool,
        query_trailer_inflection_tool,
        analyze_visual_alignment_tool,
        McpToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command=mcp_path,
                    args=[],
                    env={
                        "CLICKHOUSE_HOST": os.getenv("CLICKHOUSE_HOST"),
                        "CLICKHOUSE_PORT": os.getenv("CLICKHOUSE_PORT"), 
                        "CLICKHOUSE_USER": os.getenv("CLICKHOUSE_USER"), 
                        "CLICKHOUSE_PASSWORD": os.getenv("CLICKHOUSE_PASSWORD"), 
                        "CLICKHOUSE_SECURE": "true",
                        "CLICKHOUSE_VERIFY": "true",
                        "CLICKHOUSE_CONNECT_TIMEOUT": "30",
                        "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
                    }
                ),
                timeout=60,
            ),
            tool_list_cache_ttl_seconds=3600,
        )
    ]
)

app = App(
    name="studio_oracle",
    root_agent=root_agent,
)
