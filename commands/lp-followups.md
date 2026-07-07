---
description: Fundraise follow-up sweep — find LPs going quiet, propose tasks and draft nudges
argument-hint: "[optional threshold or stage, e.g. '10 days' or 'commitment stage only']"
---

# LP Follow-ups

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

Sweep the LP prospect pipeline for relationships going cold, ranked by how much a silence matters (late-stage silence first), with a proposed follow-up task per flagged LP and drafted nudge text ready to copy.

See the **lp-crm** skill for the funnel/hygiene method, and **vantedge-tool-map** for conventions.

Steps:
1. Firm picker if multi-firm. Page `vi_list_lp_prospects` to exhaustion; read the firm's real stage names from `stageCount`.
2. Join against email recency: latest `vi_list_emails` row per `lp_id`.
3. Flag: no contact beyond the threshold in $ARGUMENTS (default ~14 days), ordered by stage seniority.
4. For each flagged LP: propose `vi_add_crm_task` (title + dueDate) and draft a short nudge referencing their last exchange (quote via `vi_get_email` if needed). Drafts only — never send.
5. Execute approved tasks; output the funnel snapshot + flagged list + drafts.
