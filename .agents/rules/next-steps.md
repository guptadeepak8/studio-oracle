# StudioOracle — Hackathon Execution Roadmap & Upgrade Plan

This document serves as the tactical engineering roadmap, technical risk log, and judge-readiness plan for **StudioOracle**.

---

## P0 — Demo Critical (Must Complete for 3–5 Min Demo)

- [x] **Live Ingestion & Gemini Batch Classifier (`server/ingestion/youtube.py`)**
  - Ingest real YouTube comments and classify them in batches of 20 with Gemini 2.5 Flash.
  - Store structured columns: `sentiment`, `topics` (Array), `topic_sentiments` (Map), `claim`, `evidence_type`, and `confidence`.
- [x] **ClickHouse Analytics Endpoints (`server/db.py`, `server/api.py`)**
  - Aggregation queries for sentiment breakdown, top dynamic themes with `ARRAY JOIN topics`, and timeline nodes.
  - Pulse synthesis endpoint using Gemini to summarize audience telemetry in 2 sentences.
- [x] **Frontend Dashboard & Streaming Console (`client/`)**
  - Next.js workspace visualizing live ClickHouse campaign telemetry, evidence ledger, and real-time streaming agent thoughts.
- [x] **Structured Insight & Evidence Contract (`server/agent.py`, `client/utils/types.ts`)**
  - Upgrade agent responses from plain markdown blocks to an explicit typed schema:
    `{ claim: string, type: 'Observed' | 'Inferred' | 'Prediction' | 'Unknown', confidence: number, evidence_ids: string[], sources: string[], reasoning: string }`
  - Render an interactive **"Inspect Evidence"** badge/drawer in the chat UI when clicking on any claim.
- [x] **Temporal Trailer Inflection Tool (`server/tools/timeline.py`)**
  - Create a dedicated ClickHouse tool: `query_trailer_inflection(content_id, trailer_date)` to compare audience topic distribution and sentiment delta before vs. after a major promotional drop.
- [x] **Reddit Live / High-Fidelity Ingestor (`server/ingestion/reddit.py`)**
  - Ingest Reddit thread commentary into `studio_oracle.audience_comments` with `source = 'reddit'`.
  - Enable the agent and UI to contrast YouTube hype against Reddit enthusiast critiques on specific topics (e.g., lore, casting).

---

## P1 — High Impact (Strong Differentiators)

- [x] **Interactive Evidence Highlighting in UI (`client/components/EvidenceLedger.tsx`)**
  - Clicking an evidence reference in the Agent Console or Conflicting Signals card automatically scrolls and highlights the specific comment in the Evidence Ledger.
- [x] **Dynamic "Contradiction Radar" in Overview (`client/components/ConflictingSignals.tsx`)**
  - Replace static `getWhyItMatters` hardcoded switches with dynamic LLM or ClickHouse-driven contradiction explanations directly from `audience_comments`.
- [x] **Anomaly & Emergence Alert Banner (`client/components/AudiencePulse.tsx`)**
  - Query ClickHouse for sudden surges (>200% mention velocity) in negative keywords or emerging topics and display an alert banner: *"Emerging Friction Detected: 48% increase in casting skepticism in last 48h."*
- [ ] **Exportable Studio Intelligence Memo (`client/components/AgentConsole.tsx`)**
  - One-click button to compile the current session's Observed/Inferred findings into a downloadable Markdown/PDF executive briefing for studio executives.

---

## P2 — If Time Permits (Polish & Stretch)

- [ ] **Multimodal Poster / Trailer Sentiment Alignment**
  - Ingest thumbnail/trailer keyframes using Gemini 2.5 Flash Multimodal to compare intended trailer tone against audience reception.
- [ ] **Automated Marketing Strategy Generator**
  - Connect dynamic ClickHouse findings directly to the `MarketingDirectives` component to generate custom mitigation copy.

---

## Architecture Changes

```text
[ YouTube API / Reddit ]
           │
           ▼
[ Ingestion & Batch Analysis (Gemini 2.5 Flash) ]
   - Extracts: topics[], topic_sentiments{}, claim, evidence_type, confidence
           │
           ▼
[ ClickHouse Cloud (Columnar Analytical Engine) ]
   - Tables: audience_posts, audience_comments, content
   - Materialized / Array Queries: topic aggregations, conflict pairs, temporal deltas
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
[ Analytical REST APIs ]    [ Research Agent (Google ADK) ]
  - /analytics, /timeline     - Tool: ClickHouse SQL Query Runner
  - /pulse                    - Tool: Trailer Inflection Comparator
                              - Tool: Cross-Platform Discrepancy Analyzer
     └─────┬─────────────────────────┘
           │ (SSE Token Stream + Tool Events)
           ▼
[ Next.js Interactive Studio Dashboard ]
  - Evidence Ledger with Comment Highlighting
  - Claim Badge Cards (Observed / Inferred / Prediction / Unknown)
  - Interactive Conflicting Signals & Timeline Delta
```

---

## Gemini / Agent Changes

* **Model Tiering**:
  * **Ingestion Classifier**: `gemini-2.5-flash` with structured JSON schema (`IngestionAnalysisBatch`). Fast, cost-efficient, and strictly typed.
  * **Interactive Research Agent**: `gemini-2.5-flash` / `gemini-2.5-pro` via Google ADK with `mcp-clickhouse` / custom ClickHouse SQL execution tools.
* **Reasoning Contract**:
  * Mandatory enforcement of the 4 epistemic categories:
    1. **OBSERVED**: Direct facts backed by ClickHouse `comment_id` counts and quotes.
    2. **INFERRED**: Interpretations connecting multiple observed facts.
    3. **PREDICTION**: Probable downstream audience behavior.
    4. **UNKNOWN**: Blind spots and unmeasured demographics.

---

## ClickHouse / Analytics Changes

* **Dynamic Array Joins**:
  ```sql
  SELECT topic, count() as mentions,
         countIf(topic_sentiments[topic] = 'positive') as pos_c,
         countIf(topic_sentiments[topic] = 'negative') as neg_c
  FROM studio_oracle.audience_comments
  ARRAY JOIN topics AS topic
  WHERE content_id = '{content_id}'
  GROUP BY topic ORDER BY mentions DESC;
  ```
* **Contradiction Pair Extraction**:
  ```sql
  SELECT topic,
         argMax(text, like_count) FILTER (WHERE topic_sentiments[topic] = 'positive') as top_pos,
         argMax(text, like_count) FILTER (WHERE topic_sentiments[topic] = 'negative') as top_neg
  FROM studio_oracle.audience_comments
  ARRAY JOIN topics AS topic
  WHERE content_id = '{content_id}'
  GROUP BY topic
  HAVING countIf(topic_sentiments[topic] = 'positive') > 0 
     AND countIf(topic_sentiments[topic] = 'negative') > 0;
  ```

---

## UI Changes

1. **Evidence Badge Verification**: Every claim produced by the agent in `AgentConsole.tsx` displays clickable citation chips linking to the `EvidenceLedger`.
2. **Platform Discrepancy Split**: In `ConflictingSignals.tsx` or `Overview`, show YouTube vs. Reddit sentiment comparison side-by-side.
3. **Timeline Inflection Highlights**: Visual marker on `WhatChanged.tsx` indicating when promotional trailers/clips dropped.

---

## 3–5 Minute Demo Script

1. **The Hook (0:00 - 0:45)**:
   * Introduce the problem: Hollywood studio marketing teams lose millions because traditional social listening only produces vanity sentiment scores without causal evidence or actionable explanations.
2. **Live Ingestion & Telemetry (0:45 - 1:30)**:
   * Open the *Gladiator II* campaign. Show ClickHouse real-time telemetry indexing 100+ analyzed YouTube and Reddit comments with dynamic topics and sentiment maps.
3. **Unprompted Discovery (1:30 - 2:45)**:
   * Highlight the **Conflicting Signals** and **What Changed** cards: show how the system autonomously detected a contradiction where casual YouTube viewers praise soundtrack energy, while Reddit enthusiast communities criticize historical accuracy and CGI lighting.
4. **Agent Investigation (2:45 - 4:00)**:
   * Ask the StudioOracle Research Agent: *"What changed after the trailer drop and why are fans divided?"*
   * Watch the streaming tool call execute a ClickHouse inflection query live, returning structured **Observed Facts**, **Inferred Context**, and **Forward Recommendations** with clickable evidence IDs.
5. **Closing & Impact (4:00 - 4:30)**:
   * Show the Marketing Directive generated from this evidence: switch digital ad spend from CGI battle teasers to narrative character reels.

---

## Judge Differentiators

* **Evidence-Linked Grounding**: Not a generic chatbot. Every assertion is provably anchored in ClickHouse rows with exact IDs.
* **Strict Epistemic Classification**: Explicitly distinguishes between hard observed data and inferred hypothesis.
* **Causal & Temporal Reasoning**: Demonstrates how audience perceptions shift across time and across platform silos.
* **Real Columnar Speed**: Leverages ClickHouse vector and array operations for instantaneous aggregation over thousands of structured feedback nodes.

---

## Definition of Done

1. [x] All API endpoints return live ClickHouse data without mock fallbacks.
2. [x] Streaming chat emits real-time tool execution logs.
3. [x] Frontend builds cleanly without TypeScript errors.
4. [ ] Reddit and YouTube feeds simultaneously queryable in ClickHouse.
5. [ ] Every agent answer contains verifiable claim badges and supporting comment citations.

