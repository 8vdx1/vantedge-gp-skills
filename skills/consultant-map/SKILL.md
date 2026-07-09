---
name: consultant-map
description: Map the placement agents / gatekeeper consultants in the LP pipeline and the AUM they advise, so one relationship can unlock many LPs. Use when planning fundraise coverage, prioritizing gatekeepers, or asking who the multipliers are. Triggers on "consultants", "placement agents", "gatekeepers", "who advises", "consultant map", "which consultant", or "AUM advised".
---

# Consultant Map

You surface the consultants / placement agents in the firm's LP CRM — the gatekeepers who advise multiple allocators — so the GP can prioritize the relationships that unlock the most capital. Read-only. Consult the **vantedge-tool-map** skill for conventions.

## What's fully readable today

`vi_list_lp_prospects` returns, per prospect (verified): `isConsultant` (bool), `consultantType`, `aumAdvised` (+ `aumAdvisedCurrency`), and `consultantNotes`. So you CAN, right now:
1. Firm picker if multi-firm; **page to exhaustion**; exclude QA fixtures.
2. Filter `isConsultant === true` → the gatekeeper roster.
3. Rank by `aumAdvised` (normalize currency) — the multipliers, biggest advised-capital first.
4. Group by `consultantType` (e.g. placement agent vs. advisor vs. OCIO), summarize `consultantNotes`.
5. Cross-reference each consultant against the email graph (`vi_list_emails` by their `lp_id`) — who's warm, who's gone cold. A gatekeeper advising $2B whom you haven't emailed in 60d is the headline.

Output: ranked gatekeeper table (name · type · AUM advised · last contact · warmth), with the "biggest unlock, coldest relationship" called out as the priority.

## ⚠️ The advisory graph (who advises WHICH LPs) needs a doorway

The precise link — *"win consultant X and you unlock these 4 named prospects worth $30M"* — lives in a **separate backend table** (`LpConsultantRelationshipRepository`; the app has `/consultants/by-vcfirm` + `getAdvisorsForLp` endpoints) that is **not exposed via the MCP** (the internal controller only serves firms/prospects/deals/notes/tasks/emails). So today you cannot enumerate a consultant's advised LPs directly.

Until a `vi_list_consultant_relationships` (or advisors-for-LP) tool ships (TODO.md):
- Report the gatekeeper roster + advised-AUM (real), but say the **per-LP advisory links aren't available via the API yet**.
- Best-effort heuristic only, clearly labeled as inference: LPs sharing a consultant's `organizationName`, or referenced in `consultantNotes`/`labels`/`custom_fields`. Never present inference as the system's own relationship data.

## Judgment calls

- `aumAdvised` is self-reported / imported — treat as directional, flag nulls rather than assuming 0.
- A consultant with high advised-AUM but early stage is a *coverage gap*, not a loss — that's the pitch to prioritize them.
- Exclude QA fixtures.

## Boundaries

Read-only. Any follow-up task/note on a consultant is a proposal requiring approval. No deletes.
