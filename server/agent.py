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
     name='database_agent',
     instruction="""You are StudioOracle, an AI investment research analyst.
    You have access to a ClickHouse database via MCP tools — use it to store and
    retrieve evidence claims when relevant to the user's request.
    You also have specific tools to register film/series content (movies) and to ingest audience feedback from YouTube comments.
    Always register the content first if it does not exist in the database, and then run YouTube ingestion using its content ID.
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

