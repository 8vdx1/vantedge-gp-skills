---
name: velocity
description: Pipeline & fundraise velocity analytics for GPs — time-in-stage, stage bottlenecks, and stalled records across deals and LP prospects. Use to find where deals/LPs get stuck, measure funnel health, or spot aging opportunities. Triggers on "velocity", "time in stage", "where are deals stuck", "bottleneck", "how long in [stage]", "stalled deals", "aging LPs", or "funnel health".
---

# Velocity

You measure how fast things move through the firm's pipelines via the VantedgeAI MCP, and surface where they stall. Read-only analytics. Consult the **vantedge-tool-map** skill for conventions (firm picker, pagination — page to exhaustion for accurate stats).

## The two clocks (different precision — be honest about it)

- **LP prospects have a real stage clock.** Each row carries `stageChangedAt` (verified in the API) — so *days-in-current-stage* is exact: `now − stageChangedAt`. This is your precise instrument.
- **Deals have only `updatedAt`** (no per-stage timestamp exposed; `dealHistory` is typically null). So for deals you can measure *days-since-last-touched* and *days-since-created*, but not true time-in-a-given-stage. Report it as "days since last activity," never claim exact stage duration.

State which clock you used for each so the numbers are trustworthy.

## Method

1. Firm picker if multi-firm. **Page to exhaustion** — velocity stats are worthless on a partial list. Exclude QA fixtures.
2. **LP funnel velocity** (`vi_list_lp_prospects`):
   - Bucket by `prospectStage` (use the real names from `stageCount`).
   - Per stage: median & max days-in-stage (`now − stageChangedAt`), count.
   - Flag **stalled**: prospects far past the stage's median (e.g. >2× median or an absolute floor like 21d), weighted so late-stage stalls (committed/diligence) rank above early enquiries.
3. **Deal velocity** (`vi_list_deals`, page through):
   - Bucket by `dealStage` (`LEAD…MOVE_TO_IC`).
   - Per stage: median & max days-since-`updatedAt`, count.
   - Flag deals untouched > ~21d, seniority-weighted.
4. **Bottleneck read:** the stage with the highest median dwell + the most stalled records is the constriction. Name it plainly — *"SEEK_INFO is the choke: 9 deals, median 18d, 4 stale."*

## Output

- Funnel table (stage · count · median days · max) for LPs and for deals, side by side.
- **Bottleneck callout** — the one or two stages killing throughput.
- **Stalled list** — the specific records needing a decision, each with days-in-stage and a proposed action (nudge task / stage move / mark dead) for approval.
- Trend note if the user asks week-over-week (re-run against a prior window mentally — data is point-in-time, so say "as of now").

## Judgment calls

- A prospect sitting long in a *terminal* stage (funded, closed-lost) isn't stalled — it's done. Only flag dwell in *active* stages.
- Small n: with <5 in a stage, report raw ages, not "median" (misleading).
- `stageChangedAt` resets on every move — a deal that bounced stages looks "fresh" even if the relationship is old; cross-check `createdAt` when age matters.

## Boundaries

Read-only. Any nudge/stage-move/mark-dead is a proposal requiring approval. No deletes.
