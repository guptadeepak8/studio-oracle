# StudioOracle — Project Context

StudioOracle is a real-time audience intelligence platform for entertainment studios. It monitors entertainment launches (movies, campaigns, trailers) and gathers audience signals from multiple platforms to produce evidence-based intelligence using ClickHouse and a Google ADK agent with Gemini.

## Product Core Concept

Rather than acting as a generic sentiment dashboard, StudioOracle employs evidence-based reasoning to analyze audience reactions. It classifies analytical findings into distinct intelligence claims:
* **OBSERVED**: Directly supported by stored raw audience evidence.
* **INFERRED**: A reasonable interpretation derived from audience evidence.
* **PREDICTION**: A forward-looking hypothesis based on trends.
* **UNKNOWN**: Explicitly identified gaps where available evidence is insufficient to make a claim.

The platform answers: *"Based on the audience evidence we actually have, what is happening and what can we reasonably conclude?"* rather than *"What does an LLM think about this movie?"*

---

## Technical Architecture

The runtime architecture of StudioOracle is as follows:
```
User
└── StudioOracle Next.js Frontend (apps/web)
    └── Python API Server (server/api.py - TBD)
        └── Google ADK LlmAgent (server/agent.py)
            ├── Vertex AI / Gemini API
            └── ADK McpToolset (official mcp-clickhouse)
                └── ClickHouse Database (audience data & content metadata)
```

---

## Repository Specifications

### 1. Database Schema (ClickHouse)
The database contains three primary tables in the `studio_oracle` database:
* **`studio_oracle.content`**: Stores metadata of campaigns, movies, and series (title, type, description, release date, target tracking terms).
* **`studio_oracle.audience_posts`**: Stores individual posts/videos containing content tracking terms from platforms (e.g. YouTube video info).
* **`studio_oracle.audience_comments`**: Stores comments and reactions linked to specific posts/videos.

### 2. Google ADK Agent Config (`server/agent.py`)
* Uses `google.adk.agents.LlmAgent`.
* Model: `gemini-2.5-flash` with Vertex AI (configured via `GOOGLE_GENAI_USE_VERTEXAI=TRUE`).
* ClickHouse MCP integration uses `google.adk.tools.mcp_tool.mcp_toolset.McpToolset` to establish a stdio connection using `StdioConnectionParams` and `mcp.StdioServerParameters`.
* Dynamically locates and starts the `mcp-clickhouse.exe` (on Windows) or `mcp-clickhouse` executable in the `.venv` environment.
* Registered Tools:
  - `create_content_tool` (from `tools.movie`): Creates content metadata in the `content` table and returns a UUID `content_id`.
  - `ingest_youtube_tool` (from `tools.youtube`): Searches and ingests YouTube comments for a given search query and `content_id`.
  - `McpToolset`: Connects to `mcp-clickhouse` to list databases, tables, and run SQL queries.

### 3. Ingestion & Tools (`server/ingestion/` & `server/tools/`)
* **YouTube Ingestion (`server/ingestion/youtube.py`)**: Uses standard Google YouTube API (via `YOUTUBE_API_KEY`) to retrieve search results and comment threads. If no API key is provided, it falls back to generating a rich mock dataset with varying sentiments and timelines.
* **YouTube Tool (`server/tools/youtube.py`)**: Exposes `ingest_youtube_feedback` wrapped in `FunctionTool`.
* **Movie Tool (`server/tools/movie.py`)**: Exposes `create_content_record` wrapped in `FunctionTool` to write directly to `studio_oracle.content`.

---

## Code Modification Principles

* **Prioritize ClickHouse for Analytics**: Database queries (filtering, aggregation, grouping, time-series, platform comparison) must be computed in ClickHouse. Gemini must be used for qualitative reasoning, claim classification, and contradiction detection.
* **Security & Secret Hygiene**: Secrets (credentials, keys, passwords) must never be hardcoded. They are loaded from `.env` and injected dynamically. Do not commit `.env` files.
* **Architecture Preservation**: Never rewrite unrelated code; keep changes small and avoid unnecessary abstractions. Only use Google's permitted tooling (Gemini, Vertex AI, ADK).

