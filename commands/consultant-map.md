---
description: Map placement agents / gatekeeper consultants in the LP pipeline by advised AUM — one relationship, many LPs
argument-hint: "[optional, e.g. 'placement agents only']"
---

# Consultant Map

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

The gatekeepers in your LP CRM ranked by the capital they advise, so you prioritize the multipliers.

See the **consultant-map** skill for method and the **vantedge-tool-map** skill for conventions.

Steps:
1. Firm picker if multi-firm; page to exhaustion; exclude QA fixtures.
2. Filter `isConsultant`; rank by `aumAdvised` (normalize currency); group by `consultantType`.
3. Cross-ref each against the email graph for warmth (last contact).
4. Headline the "biggest advised-AUM, coldest relationship" as the priority.

> ⚠️ The per-LP advisory graph (which LPs a consultant advises) is NOT exposed via the MCP yet — report the roster + advised-AUM, and say the named-LP links need a doorway tool (TODO.md). Any org/notes-based grouping is labeled inference.
