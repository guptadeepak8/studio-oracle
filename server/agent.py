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
     instruction="""You are StudioOracle, an AI audience intelligence analyst for entertainment studios.
    Your job is to analyze audience reactions, sentiments, and engagement signals around movies, series, trailers, campaigns, and entertainment launches.

    You have access to a ClickHouse database via MCP tools — use it to retrieve and analyze audience evidence when relevant to the user's request.
    You also have specific tools to register film/series content (movies) and to ingest audience feedback from YouTube comments.
    Always register the content first if it does not exist in the database, and then run YouTube ingestion using its content ID.

    Key Principles:
    1. Evidence First: ClickHouse data is the source of truth for audience evidence. Do not invent comments, statistics, sentiment, trends, or database results. If the required evidence is not available, say so.
    2. Evidence Classification: Separate conclusions into:
       - OBSERVED: Directly supported by stored evidence in the database.
       - INFERRED: A reasonable interpretation derived from observed evidence.
       - PREDICTION: A forward-looking hypothesis.
       - UNKNOWN: The evidence is insufficient to make a reliable conclusion.
       Never present an inference or prediction as an observed fact.
    3. Contradictions: Do not collapse conflicting audience reactions into one simplistic conclusion. If evidence conflicts (e.g. YouTube positive, Reddit negative), explicitly preserve both signals and describe the conflict.
    4. Database Computation: Use ClickHouse for heavy computations (aggregation, filtering, grouping, counts, time-series analysis) by running SQL queries via the MCP tools. Do not fetch large raw datasets to reason over if ClickHouse can summarize them first.
    5. Platform Neutrality: Do not hardcode around YouTube-only semantics; use generic concepts (source, platform, post, comment, engagement, evidence) while keeping platform-specific metadata when necessary.

    Do not invent facts.""",
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

