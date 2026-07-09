# VantedgeAI GP Plugin for Claude

GP & IR workflows for [VantedgeAI](https://platform.vantedgeai.com) — deal pipeline, LP CRM, and the unified email inbox, powered by the VantedgeAI MCP server.

## Who this is for

The GP / investor-relations persona: working inbound deal flow, running a fundraise, and keeping the CRM honest. (Back-office fund operations — capital calls, waterfalls, covenants, NAV — live in the separate `fundos` plugin; both plugins connect to the same MCP server and coexist.)

## What this plugin does

Packages the VantedgeAI CRM + email surface into 10 slash commands and 10 background skills. The skills carry the operational knowledge an agent needs to use the ~43 MCP tools correctly: which tool answers which question, required fields, pagination discipline, the multi-firm picker, and the read-freely / write-with-approval posture.

## Commands

| Command | What it does for you |
|---------|----------------------|
| `/vantedge-gp:brief` | "Catch me up" — what changed since yesterday: new mail, LPs that moved, deals that shifted. |
| `/vantedge-gp:inbox` | Reads your inbox and turns it into a to-do list — what came in, what it means, what to do. |
| `/vantedge-gp:deal-intake` | Forward a deck, get a deal — pulls out the company, creates it, files the deck. |
| `/vantedge-gp:pipeline-review` | Your whole pipeline, stage by stage, with the real email behind each update and what's gone stale. |
| `/vantedge-gp:velocity` | Where deals and LPs get *stuck* — time-in-stage, the bottleneck, and who's sat too long. |
| `/vantedge-gp:lp-followups` | Which LPs have gone quiet — ranked by who matters, with nudges drafted. |
| `/vantedge-gp:consultant-map` | Your placement agents ranked by the money they steer — one intro, many LPs. |
| `/vantedge-gp:who-knows-whom` | The warmest intro path to anyone — starting from who's actually emailed them (⚠️ optional LinkedIn step is risky). |
| `/vantedge-gp:lp-connections` | "Who on my team already knows someone at this LP?" — from your own network, no LinkedIn risk. *(coming soon)* |
| `/vantedge-gp:get-tasks` | Your open to-dos, sorted by what's overdue and what matters most. *(coming soon)* |

## Skills

| Skill | What it teaches the agent |
|-------|---------------------------|
| `vantedge-tool-map` | The full tool catalogue + conventions: firm picker, orient-vs-enumerate, pagination, credits, error playbook, cross-tool recipes |
| `inbox-triage` | Two email stores, list/detail pattern, classification → action mapping |
| `deal-pipeline` | Pipeline reads done completely, deal creation's required fields, stage enum, the per-deal evidence pattern |
| `lp-crm` | LP naming quirk (`dealName` = LP identity), firm-configurable stages, call prep, follow-up hygiene |
| `who-knows-whom` | Warm-path lookup: verified email-graph strength first, LinkedIn breadth second, optional live 2nd-degree check |
| `get-tasks` | Surface + prioritize open CRM todos (depends on the not-yet-shipped `vi_list_tasks` read tool) |
| `daily-brief` | Day-on-day change summary — inbox + funnel + deals-since-yesterday, delta not dump |
| `velocity` | Time-in-stage analytics: LP `stageChangedAt` (exact) + deal freshness, bottleneck + stalled detection |
| `consultant-map` | Gatekeeper roster by advised AUM; advisory graph flagged as a doorway |
| `lp-connections` | Owned-data warm paths (LinkedIn-export matches); safe complement to who-knows-whom, needs a read tool |

## ⚠️ LinkedIn risk warning (`who-knows-whom`)

The optional step of `who-knows-whom` automates the **user's own logged-in LinkedIn session** via a local browser. This violates LinkedIn's User Agreement and carries a real risk of **account restriction or ban**. The skill therefore: requires fresh, explicit user consent every session before any LinkedIn action; runs one target per invocation, human-paced; stops immediately on any captcha or warning; and never messages, connects, or batch-scrapes. It only works in Claude Code with a local browser — claude.ai sessions skip it automatically. Relationship *strength* always comes from the firm's own email data; LinkedIn only ever suggests paths.

## Connection

The plugin registers the VantedgeAI MCP server (`https://fundos.vantedgeai.com/mcp`). Authenticate via OAuth on first use, or set a Bearer API key for headless use. If a tool referenced by these skills is missing from your session, reconnect the connector — tool catalogues are cached at connect time.

## Safety posture

Reads are free. Every write (deal/LP creation, stage moves, notes, tasks, rooms, invites, uploads) is proposed to the human and executed only on approval. Nothing in this plugin deletes anything, and the agent drafts communications but never sends them.
