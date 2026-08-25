import os
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams

clickhouse_tools = MCPToolset(
    connection_params=StreamableHTTPConnectionParams(
        url="http://127.0.0.1:8001/mcp",
        timeout=30,
    )
)

root_agent = Agent(
    name="studio_oracle",
    model="gemini-2.5-flash",
    description="AI investment research agent for film and streaming studios.",
    instruction="""You are StudioOracle, an AI investment research analyst.
You have access to a ClickHouse database via MCP tools — use it to store and
retrieve evidence claims when relevant to the user's request.
Do not invent facts.""",
    tools=[clickhouse_tools],
)

app = App(name="app", root_agent=root_agent)