---
description: Pipeline & fundraise velocity — time-in-stage, bottlenecks, and stalled records across deals and LPs
argument-hint: "[optional focus, e.g. 'LPs only' or 'deals in diligence']"
---

# Velocity

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

Where do deals and LPs get stuck? Time-in-stage stats, the bottleneck stage, and the specific stalled records needing a decision.

See the **velocity** skill for method (two clocks: LP `stageChangedAt` is exact, deal `updatedAt` is "days since touched") and the **vantedge-tool-map** skill for conventions.

Steps:
1. Firm picker if multi-firm. **Page to exhaustion** (partial data = wrong stats). Exclude QA fixtures.
2. LP funnel: bucket by `prospectStage`, per-stage median/max days via `stageChangedAt`.
3. Deals: bucket by `dealStage`, per-stage median/max days-since-`updatedAt`.
4. Name the bottleneck; list stalled records (seniority-weighted) with a proposed action each.
