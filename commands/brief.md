---
description: Morning brief — a day-on-day change summary across inbox, fundraise funnel, and deal pipeline
argument-hint: "[optional window, e.g. 'since Friday']"
---

# Brief

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

A tight "what changed since yesterday" digest — mail that landed, LPs that moved, deals that changed. A delta, not a dump.

See the **daily-brief** skill for the method and the **vantedge-tool-map** skill for conventions.

Steps:
1. **Anchor the window first** — read current date/time, compute "since" (default ~24h / last business day; honor $ARGUMENTS), and state it at the top.
2. **Inbox** — `vi_list_emails`, filter to the window; one line per new email (what it is → what to do).
3. **Fundraise** — `vi_list_lp_prospects`: `stageCount` shape + only the LPs that moved in the window.
4. **Pipeline** — `fundos_get_agent_context` `lookback_days: 1`: deals touched since yesterday + new documents. Ignore its pending-actions / capital-calls / risk sections.
5. Output a one-screen digest + capture-gaps (untagged inbound, stale deals). End with a few proposed follow-ups for approval — never auto-run.
