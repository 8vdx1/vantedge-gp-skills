---
name: daily-brief
description: A day-on-day morning brief for the GP — what changed since yesterday across the inbox, the LP fundraise funnel, and the deal pipeline. A neat delta summary, not a data dump. Use to start the day or catch up after time away. Triggers on "daily brief", "morning brief", "what changed", "catch me up", "what's new since yesterday", "brief me", or "start my day".
---

# Daily Brief

You produce the GP's morning brief through the VantedgeAI MCP: **what changed since the last brief**, as a tight delta summary. Read-only — anything actionable is a proposal, never an action. Consult the **vantedge-tool-map** skill for conventions (firm picker, pagination, error playbook).

## The framing: change, not inventory

This is a *diff*, not a dump. The GP does not want the full pipeline or every LP — they want **what moved since yesterday**: mail that landed, LPs that advanced, deals that changed. If nothing changed in a section, say "no change" in one line and move on. Brevity is the product.

## MANDATORY first step: anchor the window

Read the current date/time first and compute the window (default: since ~24h ago, or since the last business day on a Monday). **State the window explicitly** at the top — *"Brief for Wed 9 Jul, covering since Tue 8 Jul 09:00."* Every "new / changed" claim below is relative to that anchor; never imply a window you didn't compute.

## Sections, in order

**1. Inbox — what came in** (`vi_list_emails`, both stores, filtered to the window by each row's `date`)
   Lead with this. For each new email, a **one-line** read: *sender/subject → what it is → what it implies.*
   e.g. *"Thornbury Foundation — fund intro; new LP interest, wants deck/PPM/DDQ → onboard."*
   Group: new LP interest · existing-LP activity · deal updates · needs-reply. Collapse duplicate forwards. If the pipeline store is unavailable, say "CRM mail only."

**2. Fundraise funnel — what moved** (`vi_list_lp_prospects`)
   `stageCount` for the one-line funnel shape. Then only the **LPs whose `updated_at` falls in the window** — who advanced, who's new. Not the whole roster; just the movers.

**3. Deal pipeline — what changed** (`fundos_get_agent_context` with `lookback_days: 1`)
   Its `deals` section is already server-filtered to `updated_at >= since`, so this natively returns *deals touched since yesterday* — name, stage, when. Also surface **new documents** from its `documents` section (decks/updates uploaded in the window). Report the deltas; skip untouched deals.
   **Ignore** this call's `pending_actions`, `capital_calls`, and `risk` sections — out of scope for this brief.

## Output shape

A scannable digest, newest-relevant first:

> **Brief — Wed 9 Jul** (since Tue 08:00)
> **Inbox (4):** 2 new LP intros (Thornbury, Windermere) · 1 deal update (Oakspire: ARR $340k) · 1 needs reply (bhavya — wire instructions)
> **Fundraise:** funnel 10/3/11 · Eight Capital → committed (LPA countersigned)
> **Pipeline:** Oakspire updated (still LEAD) · Cindermark deck uploaded · 1 new deal (Terravolt)
> **Gaps:** 1 inbound email untagged; Nimbus stale 24d

End with at most a few **proposed** follow-ups (tasks/notes/nudges) for approval — never auto-executed.

## Judgment calls

- Keep it to a screen. If a section is huge, summarize counts + top 3, offer "want the full list?"
- Capture gaps are gold in a change brief: untagged inbound (`lp_id: null`) and deals gone stale are exactly what a GP would otherwise miss.
- `agent_context` is top-10-per-section — fine for "what's recent," never for totals. If the GP asks "how many," switch to the paginated list tools.
- Exclude QA fixtures ("QA-…").
- Tasks + meetings are the two sections this brief *can't* show yet (`vi_list_tasks` / meeting tools unshipped — see TODO.md). If asked for todos or today's meetings, say they're not wired into the MCP yet.

## Boundaries

Fully read-only. Proposals require approval. Drafts, not sends. No deletes exist.
