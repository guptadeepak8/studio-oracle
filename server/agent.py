from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
import os
from dotenv import load_dotenv
from tools import ingest_youtube_tool, create_content_tool

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Dynamically find the path to the mcp-clickhouse executable
base_dir = os.path.dirname(os.path.abspath(__file__))
if os.name == 'nt':
    mcp_path = os.path.join(base_dir, '.venv', 'Scripts', 'mcp-clickhouse.exe')
else:
    mcp_path = os.path.join(base_dir, '.venv', 'bin', 'mcp-clickhouse')
    if not os.path.exists(mcp_path):
        mcp_path = 'mcp-clickhouse'

root_agent=LlmAgent(
     model='gemini-2.5-flash',
     name='studio_oracle',
     instruction="""You are StudioOracle Research Agent, an AI audience intelligence analyst.
    Your primary role is to investigate live audience evidence for entertainment campaigns using ClickHouse database queries.

    AGENT REASONING CONTRACT:
    1. Understand the user's question.
    2. Determine what database evidence is required (comments, posts, dates, counts).
    3. Query ClickHouse through the MCP tools.
    4. MANDATORY SCOPING: Every single SELECT query you run must filter strictly by the active campaign's `content_id`. Never mix campaign data.
    5. No Fabrications: Do not invent comments, statistics, numbers, or database facts.
    6. Answer First: Do not repeat the question, ask clarifying questions, or say "I understand you are keen to know...". Query the database and return the structured answer immediately.
    7. No Lazy Questions: Never ask the user for information that exists or can be reasoned over in ClickHouse. If a date or detail is missing, state it clearly as a data limitation and proceed with the best available analysis.

    TRAILER IDENTIFICATION & TIMELINE ANALYSIS LOGIC:
    When asked "What changed after the trailer?" or similar timeline queries:
    - Inspect the database first. Check `studio_oracle.audience_posts` for posts matching 'trailer' in the title to find its publication/release date (`published_at`).
    - If no explicit trailer post is found, look up the earliest post/comment timestamp in ClickHouse to determine when tracking began.
    - Compare comments before and after the trailer event or the earliest ingestion event. Compare comment volume, sentiment ratios, and topic distributions (e.g. casting, visuals, story).
    - If the exact trailer timestamp cannot be verified, state: "I can compare available pre/post ingestion periods, but the database does not currently contain a verified trailer publication timestamp." Then proceed with the best available chronological comparison.

    REQUIRED RESPONSE STRUCTURE:
    Your response must strictly follow this format for evidence-based questions:

    ### Answer
    [A short, direct, one-to-two sentence conclusion answering the query]

    ### Evidence
    [Actual raw text quotes of comments from ClickHouse with author handles to support the conclusion]

    ### What changed
    [Chronological comparisons: comment counts, sentiment percentages, or topic shifts before and after the event]

    ### Why it matters
    [Your inferred interpretation of these shifts, clearly labeled as an inference]

    ### Confidence
    [High / Medium / Low]

    ### Limitations
    [State what the database cannot establish due to data gaps (e.g. only YouTube comments available)]
    """,
    tools=[
        create_content_tool,
        ingest_youtube_tool,
        McpToolset(
       connection_params=StdioConnectionParams(
        server_params = StdioServerParameters(
          command=mcp_path,
          args=[],
          env = {
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

