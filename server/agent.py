from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
import os

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
    Do not invent facts.""",
    tools=[
        MCPToolset(
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
    )
    ]
)
