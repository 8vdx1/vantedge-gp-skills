---
description: Full pipeline review — every deal by stage, latest verbatim updates, metric drift, stale deals flagged
argument-hint: "[optional focus, e.g. 'diligence only' or 'fintech deals']"
---

# Pipeline Review

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

A complete, evidence-grounded read of the deal pipeline: stage-by-stage counts, what changed recently (from the actual inbound emails, not just summaries), metric drift on active names, and stale deals that need a decision.

See the **deal-pipeline** skill for pagination discipline and the evidence pattern, and **vantedge-tool-map** for conventions.

Steps:
1. Firm picker if multi-firm. Page `vi_list_deals` to exhaustion (never trust `totalCount`; apply any $ARGUMENTS filter via `search`/`dealStage`). Exclude QA fixtures.
2. Stage-by-stage table: count, names, days since `updatedAt`.
3. For recently-updated deals: pull the latest inbound via `vi_list_emails(deal_id)` → `vi_get_email`; quote the update and note metric deltas vs. the deal's `commentsAndNotes` history (use `search_documents` in the deal's room when a claim needs a document check).
4. Flag stale deals (no update in ~21+ days) with a proposed action each: nudge task, stage move, or "discuss at IC".
5. Present proposals for approval; execute approved ones; output the review.
