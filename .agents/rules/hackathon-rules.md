Google ADK
Google Cloud AI APIs/SDKs
permitted Google AI tooling
built-in AI features of the selected partner product where applicable

Do NOT introduce:

OpenAI models/APIs
Anthropic models/APIs
AWS AI models/APIs
Microsoft AI models/APIs
other third-party AI models
prohibited third-party agent frameworks
other AI APIs

Normal non-AI libraries, databases, hosting providers, web frameworks, utilities, etc. are not automatically prohibited.

Before adding a dependency, determine whether it is an AI/agent dependency.

If uncertain, stop and flag it.

3. Development AI restriction — CRITICAL

The organizer has clarified that the AI restriction applies to the entire development workflow, not only runtime.

Permitted development AI tools include:

Gemini CLI
Gemini Code Assist
Google Antigravity suite

StudioOracle development should use Google Antigravity/Gemini.

Do NOT use:

ChatGPT
Codex
Claude
other third-party AI coding assistants

for:

implementation
debugging
scaffolding
test generation
troubleshooting
architecture assistance
project-management guidance
requirement interpretation

The project concept, architecture, and requirements can remain.

Code/tests previously generated using prohibited AI assistance must be rewritten using permitted Google tooling where required by the organizer.

Do not create fake evidence of AI-tool usage.

4. New-project requirement — CRITICAL

The submitted project must be newly created during the hackathon contest period and must be the entrant's original creation.

Do not incorporate unrelated pre-existing projects or third-party project code into StudioOracle.

If existing code is being reused, verify that it was created during the contest period and is part of the original project.

Do not copy proprietary code.

5. ClickHouse track — CRITICAL

StudioOracle is entering the ClickHouse track.

The application MUST actively use ClickHouse at runtime through the official:

mcp-clickhouse

MCP server.

The required runtime architecture is:

Gemini / Google ADK
→ MCPToolset
→ MCP connection
→ official mcp-clickhouse
→ ClickHouse

Do not replace the required MCP integration with only:

LlmAgent
→ custom Python ClickHouse function
→ ClickHouse

ClickHouse can be ClickHouse Cloud or a self-hosted cluster.

The repository must contain actual configuration/code demonstrating this integration.

A README statement alone is insufficient.

6. Google Cloud runtime requirement

The project must actually use Google Cloud AI tooling at runtime.

Relevant accepted Google packages include:

google-adk
google-genai
google-generativeai
google-cloud-aiplatform

The repository must contain actual imports, entry points, loaded agent configuration, or equivalent runtime implementation demonstrating that Google Cloud is being used.

Do not merely mention Gemini/Google Cloud in documentation.

7. Current StudioOracle runtime architecture

The intended architecture is:

User
→ frontend
→ backend
→ Google ADK LlmAgent
→ Gemini / Vertex AI
→ MCPToolset
→ official mcp-clickhouse
→ ClickHouse
→ evidence/results
→ Gemini reasoning
→ StudioOracle result

Preserve this architecture unless there is a documented reason to change it.

Any architecture change must be checked against the ClickHouse MCP requirement.

8. Third-party data/API compliance

StudioOracle may use third-party data sources such as:

YouTube
Reddit

Only use data/API access that the project is legally and contractually authorized to use.

Respect:

API terms
licensing requirements
platform policies
authentication requirements
rate limits
privacy requirements

Do not scrape or access data in a way that violates the source's terms.

If access is uncertain, stop and flag the issue.

Do not fabricate data to compensate for unavailable APIs.

9. Repository requirement

The submitted code repository must be:

public
hosted on GitHub, GitLab, or Bitbucket
open source
contain a detectable open-source license
contain the source code required to run the project
contain assets/configuration/instructions needed to run the project

The repository must demonstrate actual runtime use of:

Google Cloud
ClickHouse / official mcp-clickhouse

Do not rely only on README technology lists.

10. Secrets

Never commit:

API keys
ClickHouse passwords
Google credentials
OAuth secrets
access tokens
.env files containing secrets

Use environment variables or appropriate Google Cloud secret-management mechanisms.

Before submission, inspect the repository for accidentally committed secrets.

11. Hosted project

The submission must contain a hosted Project URL that judges can use for testing.

The deployed project must behave consistently with the submitted demo.

Before submission verify:

frontend loads
backend responds
Gemini agent works
MCP connection works
ClickHouse connection works
required environment variables exist
no development-only localhost dependency remains
errors are handled reasonably
12. Platform requirement

The submitted project must run on at least one supported platform:

Web
Android
iOS

StudioOracle is intended to be a web application.

13. Demo video

The demo video must be no longer than 3 minutes.

If longer than 3 minutes, only the first 3 minutes may be evaluated.

The video must be publicly visible on:

YouTube
Vimeo

The video must be in English or contain English subtitles.

The demo should show the actual working product.

For StudioOracle, prioritize showing:

User question
→ Gemini agent
→ MCP tool call
→ mcp-clickhouse
→ ClickHouse evidence
→ Gemini reasoning
→ final StudioOracle insight

Do not spend most of the three minutes on marketing animation.

14. Submission description

The written submission must be in English.

It should accurately describe:

StudioOracle
the problem
features
technologies
Google Cloud usage
ClickHouse usage
MCP usage
other data sources
findings/lessons learned

Do not claim functionality that does not exist.

15. Originality / intellectual property

The project must be original.

Do not include:

proprietary code
copyrighted assets without permission
third-party material without authorization
content violating privacy/publicity/IP rights

Use appropriately licensed assets and dependencies.

16. Evidence for compliance

Before submission, verify that the repository visibly demonstrates:

Google Cloud:

actual package/import/configuration
actual runtime agent

ClickHouse:

actual ClickHouse connection
actual mcp-clickhouse
actual MCP configuration
actual runtime queries/tool calls

Do not rely on comments such as:

"This project uses ClickHouse MCP."

The implementation must actually do it.

17. StudioOracle-specific compliance architecture

The intended compliant architecture is:

                StudioOracle
                     |
                Google ADK
                     |
                 Gemini
                     |
                MCPToolset
                     |
              mcp-clickhouse
                     |
                ClickHouse
                     |
          audience evidence
                     |
                Gemini
                     |
          evidence-based result

This path should remain demonstrable at runtime.

18. Final pre-submission checklist

Before submission, verify every item:

[ ] Project is original and created during the contest period

[ ] No prohibited AI model/API is used

[ ] No prohibited AI coding assistant was used for the current implementation work

[ ] Google Antigravity/Gemini is used for permitted development assistance

[ ] Google ADK is used

[ ] Gemini/Google Cloud AI is actually used at runtime

[ ] Official mcp-clickhouse is actually used at runtime

[ ] ClickHouse is actually queried through MCP

[ ] ClickHouse data is meaningful to the agent workflow

[ ] Third-party APIs/data are used according to their terms

[ ] No secrets are committed

[ ] Repository is public

[ ] Repository has an open-source license

[ ] Repository contains run instructions

[ ] Hosted project works

[ ] Demo video is ≤3 minutes

[ ] Demo video is public on YouTube/Vimeo

[ ] Demo video demonstrates the real end-to-end workflow

[ ] Written submission is in English

[ ] Submission includes hosted URL

[ ] Submission includes repository URL

[ ] Submission accurately describes technologies and data sources

[ ] Final project matches what the demo claims

19. Compliance behavior for the coding agent

Whenever I ask you to make a change:

Check whether the change could affect hackathon eligibility.
Check this file.
Check project-context.md.
Inspect the repository.
If the change introduces a potentially prohibited AI dependency/tool, STOP and tell me.
If the change affects mcp-clickhouse, verify that the official MCP runtime path remains intact.
If the change introduces a third-party API/data source, verify that authorization/terms need to be checked.
Never claim compliance without verifying the implementation.
Before submission, perform a complete compliance audit.

If you discover a possible compliance problem, label it:

HACKATHON COMPLIANCE RISK

and explain:

what the risk is
which rule it may affect
what evidence you found
what should be changed