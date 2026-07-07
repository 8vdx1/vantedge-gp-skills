---
description: Triage the firm's email inbox — what came in, classified, with proposed CRM actions for approval
argument-hint: "[optional window or focus, e.g. 'since Friday' or 'anything from Thornbury']"
---

# Inbox

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

Sweep the unified email inbox (both stores — CRM/LP mail and deal-pipeline forwards), classify every new message, and return a grouped digest with a batch of proposed CRM actions (notes, tasks, stage moves) awaiting approval.

See the **inbox-triage** skill for classification patterns and action mapping, and **vantedge-tool-map** for tool conventions.

Steps:
1. Firm picker if multi-firm (`vi_list_firms`).
2. `vi_list_emails` (respect any window/focus in $ARGUMENTS via `q`/date filtering). Name coverage honestly if the pipeline store is unavailable.
3. Classify rows; `vi_get_email` anything ambiguous or quote-worthy.
4. Digest: **New LP interest · Existing-LP activity · Deal updates · Needs reply** — each item one line + the proposed action.
5. Present the action batch for approval; execute only what's approved; report what was written.
