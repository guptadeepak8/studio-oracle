# StudioOracle — Implementation Roadmap

This document outlines the current engineering roadmap for StudioOracle, tracking tasks, technical risks, hackathon compliance, and the immediate development milestone.

---

## P0 — Must work for the hackathon
*Things required for a functioning end-to-end demo.*

### Task 1: Implement Python Backend API Server (`server/api.py`)
* **Task:** Create a FastAPI web server exposing endpoint interfaces to run the agent and manage content ingestion.
* **Why it is required:** The frontend Next.js app needs a structured HTTP interface to communicate with the ADK agent and trigger database ingestion.
* **Current status:** Completed (FastAPI endpoints created and verified).
* **Relevant files:**
  - [api.py](file:///d:/deepak/project/studio-oracle/server/api.py)
  - [agent.py](file:///d:/deepak/project/studio-oracle/server/agent.py)
* **Dependencies:** `fastapi`, `uvicorn`, `google-adk`, `clickhouse-connect`.
* **Verification method:** Run `uvicorn api:app --reload` from `server/` and call endpoints via curl/HTTP requests, verifying streaming/responses.

### Task 2: Implement Frontend Dashboard UI (`apps/web`)
* **Task:** Replace Next.js template with a workspace to add movies, view ingestion progress, and interact with the AI agent.
* **Why it is required:** Provides the interactive user experience to demonstrate the real-time audience intelligence platform.
* **Current status:** Default Next.js template.
* **Relevant files:**
  - [page.tsx](file:///d:/deepak/project/studio-oracle/apps/web/app/page.tsx)
* **Dependencies:** Python Backend API Server endpoints.
* **Verification method:** Launch `pnpm dev` and interact with the dashboard, verifying chat rendering and ingestion updates.

### Task 3: Setup End-to-End Chat & Ingest Communication Flow
* **Task:** Connect frontend chat requests and content addition requests to the FastAPI endpoints.
* **Why it is required:** Ensures the UI displays live database facts (Observed, Inferred, Predictions, Unknowns) and allows real-time agent queries.
* **Current status:** Not started.
* **Relevant files:**
  - [page.tsx](file:///d:/deepak/project/studio-oracle/apps/web/app/page.tsx)
  - [api.py](file:///d:/deepak/project/studio-oracle/server/api.py)
* **Dependencies:** API endpoints and frontend layout.
* **Verification method:** Enter a prompt in the frontend chat, verify the agent runs tools, queries ClickHouse, and displays the response.

---

## P1 — Important product functionality
*Features that materially improve the StudioOracle demonstration.*

### 1. Reddit Ingestion Integration
* **Task:** Code `server/ingestion/reddit.py` and `server/tools/reddit.py` to ingest Reddit posts/comments.
* **Why it is required:** Enables cross-platform comparisons (e.g. comparing sentiments on YouTube vs. Reddit) to identify contradictions.
* **Current status:** Not started.
* **Relevant files:** `server/ingestion/reddit.py` [NEW], `server/tools/reddit.py` [NEW], `server/agent.py`.
* **Dependencies:** Reddit API keys or mock fallback generator.
* **Verification method:** Ingest a campaign and verify comments count increases in ClickHouse under platform source "reddit".

### 2. Time-series Sentiment & Contradiction Reasoning Prompting
* **Task:** Write detailed system prompts and schema validation to extract temporal sentiment shifts and platform-level conflicts.
* **Why it is required:** Highlights the core differentiator of evidence-based reasoning rather than simple aggregate counts.
* **Current status:** Basic instruction in `agent.py`.
* **Relevant files:** `server/agent.py`.
* **Dependencies:** Ingested database tables with rich sentiment timelines.
* **Verification method:** Query the agent for conflicts and confirm it successfully references specific contradicting posts.

---

## P2 — Improvements
*Features that are useful but should not delay the working MVP.*

### 1. Streaming Server-Sent Events (SSE)
* **Task:** Implement streaming SSE responses from the agent back to the Next.js UI.
* **Why it is required:** Lowers perceived latency by showing agent thoughts and tool calls in real time.
* **Current status:** Not started.
* **Relevant files:** `server/api.py`, frontend chat client.
* **Dependencies:** Basic API server working.
* **Verification method:** Inspect stream output in browser dev tools.

### 2. Cloud Deployment Pipelines
* **Task:** Host frontend on Vercel and backend FastAPI on GCP Cloud Run.
* **Why it is required:** Allows external review and live presentation of the hackathon project.
* **Current status:** Local-only.
* **Dependencies:** GCP and Vercel credentials.
* **Verification method:** Open public URL and query the agent.

---

## Technical risks
*Risk assessment based on the current codebase:*

* **Gemini/Vertex AI integration:** Routing `google-genai` through Vertex AI using `GOOGLE_GENAI_USE_VERTEXAI=TRUE` requires proper IAM permissions. Incorrect environment configurations can block model generation.
* **Google ADK:** The ADK is in experimental/fast-moving release. APIs and helper classes (like `McpToolset` vs. deprecated `MCPToolset`) can drift.
* **MCP:** Spawning stdio-based MCP servers requires clean subprocess execution. Any crash in `mcp-clickhouse` will disconnect the agent.
* **Official mcp-clickhouse:** The server depends on the specific executable location. On non-Windows platforms, finding the binary globally or via virtual environment path needs robust fallbacks.
* **ClickHouse connectivity:** The hosted ClickHouse Cloud instance requires secure TLS (port 8443) and handles timeouts. Subprocess connections must be pooled or re-established cleanly to avoid running out of sockets.
* **Database schema:** The tables `audience_posts` and `audience_comments` are platform-neutral, but schema changes require manual migration or rebuilds of ClickHouse tables.
* **Ingestion reliability:** Real-time YouTube ingestion depends on valid YouTube developer API keys. If the quota is exceeded or key fails, the mock dataset fallback must gracefully trigger.
* **API limits:** YouTube API quota limits (10,000 units/day) restrict large-scale ingestion.
* **Data freshness:** Ingested comments are a snapshot in time. A timestamp check is needed to prevent duplicate fetches or stale analytical results.
* **Deployment:** Deploying stdio subprocesses like `mcp-clickhouse` within a Dockerized container on Cloud Run requires the executable to be packaged and accessible.
* **Authentication:** Next.js and API communication must be secured, particularly if exposing manual ingestion triggers to prevent abuse.
* **Secrets:** `studiooracle-key.json` and `.env` contain database and cloud credentials. They must be safely managed on hosted environments and never pushed to GitHub.
* **Frontend/backend communication:** Handling large JSON schemas and streaming responses requires robust serialization/deserialization.

---

## Hackathon compliance checklist

* **Google AI tooling:** Core dependency using Gemini 2.5 and Google Vertex AI.
* **Google ADK:** Used to model the agent, register custom Python tools, and manage execution loops.
* **Gemini/Vertex AI:** Configured to invoke LLM sessions securely via Google GenAI SDK.
* **Official mcp-clickhouse:** Subprocess-based stdio connection registered to the ADK Agent.
* **ClickHouse runtime usage:** Active analytical database storing evidence and claims at runtime.
* **Public repository requirements:** Secrets kept out of Git via `.gitignore` configurations.
* **Deployment:** Target host setup planned for Vercel and GCP Cloud Run.
* **Demo:** End-to-end interface designed to visualize claims from database evidence.
* **Third-party data/API compliance:** Fallback mock datasets implemented to prevent developer key exhaustion during test runs.

## Current milestone

### Milestone: Frontend Dashboard UI Implementation (`apps/web`)
**Why this comes first:**
With the backend FastAPI server fully implemented and verified (supporting movie retrieval, comment querying, agent chat responses, and streaming SSE tokens), the critical bridge between the user and the agent is complete. The next logical step is to replace the default Next.js template in `apps/web` with the real interactive dashboard interface to connect with this API.

