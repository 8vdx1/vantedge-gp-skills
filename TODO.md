# Roadmap — VantedgeAI GP plugin

The theme: **VantedgeAI's backend already does far more than the MCP exposes.** Most items
below are not new features — they're *doorways*. The engine (meeting-prep generation,
task tracking, calendar capture) is built and running in the app; the agent just can't
reach it yet. Each doorway is the same 3-layer plumbing we've done for emails/CRM:

```
MCP tool (mcp_sse.py)  →  FundOS proxy (/api/v1/vi-crm/*)  →  8vdx-api internal controller (x-internal-key)
```

Reads are cheap and safe; expose reads first, gate writes behind human approval.

---

## 1. /meetings read  ← next up
Expose recent + upcoming meetings and their AI prep briefs. **Highest leverage** — this is
Affinity's flagship "AI Meeting Prep" workflow (their headline 50–80 min → 5 min), and the
engine already exists in VantedgeAI.

Backend that already exists (8vdx-api `crm-core`):
- `meetings/` — `CrmMeetingsEntity` (the meeting records; the reminder service already
  queries them by time window, so "recent/upcoming in range" is a proven query).
- `meeting-prep-brief/` — `.service.get()` fetches a meeting's brief, `generate` creates one;
  `meeting-prep-reminder.service` emails the GP the brief ~30 min before an LP meeting.

Tools to add:
- `vi_list_meetings` — recent + upcoming (window + optional subject filter). Returns
  meeting id, subject (LP/deal), time, attendees, has_brief.
- `vi_get_meeting_brief` — wrap `get()`; consider a `generate` path (approval-gated) when
  no brief exists yet.

Then: a `meeting-prep` skill + `/prep [LP/company]` that fuses the brief with the email
graph (last exchange) + open tasks + doc engagement.

## 2. vi_list_tasks read  ← unblocks /get-tasks and /brief
The MCP can CREATE tasks (`vi_add_crm_task`) but cannot READ them back — half-wired.
Backend read methods already exist on `crm-core/tasks/crm-tasks.service`:
- `myOpen(vcFirmId, userReq)` — the acting user's open tasks (the daily-brief "what's on my plate")
- `byFirm(vcFirmId, …)` — all firm tasks, filterable
- `list(subjectType, subjectId, userReq)` — tasks on a specific LP/deal (call prep)

Tool to add: `vi_list_tasks` (expose `myOpen` + `list`). **The `get-tasks` skill (shipped)
depends on this — it will report "needs vi_list_tasks" until the tool lands.**
(Symmetry nice-to-have: `vi_list_notes` — `CrmNotesService` has the equivalent reads.)

## 3. /brief — daily digest  ← ties it together
One morning command. Read-only; anything actionable is a proposal. Ingredients (what the
MCP can feed it):

| Section | Source tool | Status |
|---|---|---|
| Orientation (recent deals/LPs/docs, pending approvals, capital calls, risk, your own recent activity) | `fundos_get_agent_context` (1 call, bundles 8 sections) | ✅ exists |
| New inbound mail since yesterday + what auto-processed | `vi_list_emails` | ✅ exists |
| Pipeline deltas (deals that moved) | `vi_list_deals` (sort by updatedAt) | ✅ exists |
| LP funnel movement | `vi_list_lp_prospects` (stageCount) | ✅ exists |
| Doc engagement (who opened the deck) | `get_document_activity` | ✅ exists |
| Research reports finished | `research_report_status` | ✅ exists |
| **Open todos / what's owed** | `vi_list_tasks` | ⏳ item #2 |
| **Today's meetings + prep briefs** | `vi_list_meetings` / `vi_get_meeting_brief` | ⏳ item #1 |
| **Capture gaps** (untagged inbound `lp_id: null`, stale deals) | derived from the reads above | ✅ derivable now |

Note: `fundos_get_agent_context` already bundles pending-actions, risk, capital-calls,
docs, deals, LPs, and recent tool-calls in ONE 2-credit call — it's ~60% of a brief on its
own. Build `/brief` around it + inbox + (once shipped) tasks + meetings.

---

## Known backend bugs (found via live skill testing)
- **Deals pagination** — `Number()` coercion defeated `isEmpty(page)` gate, so `vi_list_deals`
  ignored page/take and returned the full book. **Fixed, PR pending** (`fix/internal-deals-pagination`).
- **`totalCount: 0`** — deals list returns a bogus 0 count alongside real rows; don't trust it,
  paginate until a short page. Pre-existing, separate fix.

## Ship discipline (reminder)
Branch off latest stage → PR to stage → cherry-pick to prod (FundOS `main`, 8vdx-api `master`).
8vdx-api PR lands before FundOS. gh account = devesh-pixel. Never commit `.env*`.
Prod needs `VI_ANALYTICS_BASE_URL` set (pipeline email store) — still pending on prod.
