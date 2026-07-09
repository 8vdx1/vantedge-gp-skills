# VantedgeAI GP Plugin for Claude

GP & IR workflows for [VantedgeAI](https://platform.vantedgeai.com) — deal pipeline, LP CRM, and the unified email inbox, powered by the VantedgeAI MCP server.

## Who this is for

The GP / investor-relations persona: working inbound deal flow, running a fundraise, and keeping the CRM honest. (Back-office fund operations — capital calls, waterfalls, covenants, NAV — live in the separate `fundos` plugin; both plugins connect to the same MCP server and coexist.)

## What this plugin does

Packages the VantedgeAI CRM + email surface into 5 slash commands and 5 background skills. The skills carry the operational knowledge an agent needs to use the ~43 MCP tools correctly: which tool answers which question, required fields, pagination discipline, the multi-firm picker, and the read-freely / write-with-approval posture.

## Commands

| Command | Description |
|---------|-------------|
| `/vantedge-gp:inbox` | Triage the email inbox — classified digest + proposed CRM actions for approval |
| `/vantedge-gp:deal-intake` | Forwarded deck/intro → pipeline deal, optionally with data room + deck filed |
| `/vantedge-gp:lp-followups` | Find LPs going quiet; propose tasks + draft nudges |
| `/vantedge-gp:pipeline-review` | Full evidence-grounded pipeline review with stale-deal flags |
| `/vantedge-gp:who-knows-whom` | Warmest intro path to a person/company — email graph + CRM, optional ⚠️ consent-gated LinkedIn check |

## Skills

| Skill | What it teaches the agent |
|-------|---------------------------|
| `vantedge-tool-map` | The full tool catalogue + conventions: firm picker, orient-vs-enumerate, pagination, credits, error playbook, cross-tool recipes |
| `inbox-triage` | Two email stores, list/detail pattern, classification → action mapping |
| `deal-pipeline` | Pipeline reads done completely, deal creation's required fields, stage enum, the per-deal evidence pattern |
| `lp-crm` | LP naming quirk (`dealName` = LP identity), firm-configurable stages, call prep, follow-up hygiene |
| `who-knows-whom` | Warm-path lookup: verified email-graph strength first, LinkedIn breadth second, optional live 2nd-degree check |

## ⚠️ LinkedIn risk warning (`who-knows-whom`)

The optional step of `who-knows-whom` automates the **user's own logged-in LinkedIn session** via a local browser. This violates LinkedIn's User Agreement and carries a real risk of **account restriction or ban**. The skill therefore: requires fresh, explicit user consent every session before any LinkedIn action; runs one target per invocation, human-paced; stops immediately on any captcha or warning; and never messages, connects, or batch-scrapes. It only works in Claude Code with a local browser — claude.ai sessions skip it automatically. Relationship *strength* always comes from the firm's own email data; LinkedIn only ever suggests paths.

## Connection

The plugin registers the VantedgeAI MCP server (`https://fundos.vantedgeai.com/mcp`). Authenticate via OAuth on first use, or set a Bearer API key for headless use. If a tool referenced by these skills is missing from your session, reconnect the connector — tool catalogues are cached at connect time.

## Safety posture

Reads are free. Every write (deal/LP creation, stage moves, notes, tasks, rooms, invites, uploads) is proposed to the human and executed only on approval. Nothing in this plugin deletes anything, and the agent drafts communications but never sends them.
