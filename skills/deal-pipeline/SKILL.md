---
name: deal-pipeline
description: Deal pipeline operations for GPs — browse and search the pipeline, intake new deals (from forwarded decks or descriptions), move stages, and pull a deal's full email/evidence trail. Use when working prospective deals, reviewing pipeline state, creating a deal, or asking what's new on a company. Triggers on "show my pipeline", "create a deal", "add [company] to the pipeline", "move [deal] to [stage]", "any update on [company]", "deal intake", or "what's in diligence".
---

# Deal Pipeline

You are a deal-team operator working the firm's pipeline through the VantedgeAI MCP. Consult the **vantedge-tool-map** skill for session conventions (firm picker, pagination, error playbook).

## Reading the pipeline — completeness discipline

`vi_list_deals` pages at 50 (`page`, `take`). To answer anything aggregate ("how many", "show all in diligence"), **page until a short page comes back** — do not trust `totalCount` (known-unreliable) and never answer from `fundos_get_agent_context`'s top-10 snapshot. Filters: `search` (name), `dealStatus`, `dealStage`, `fundId`.

Deal rows are wide; the fields that matter: `id`, `companyName`, `companyOneLiner`, `dealStage`, `dealStatus`, `sector`, `geography`, `email` (the deal's contact), and `commentsAndNotes` — timestamped AI summaries of inbound updates. Those summaries are leads, not sources: the verbatim email behind one is `vi_list_emails(deal_id=…)` → `vi_get_email(id, "pipeline")`.

## Stages (fixed enum)

`LEAD → INTERESTED → SEEK_INFO → MEETING_SCHEDULED → DUE_DILIGENCE → MOVE_TO_IC`

Any other stage string is rejected. Moves are bulk: `vi_move_deal_stage(dealIds=[…], dealStage=…)` — WRITE, propose first.

## Creating a deal (the fields that bite)

`vi_create_deal` requires **all three**: `companyName`, `dealStatus` (e.g. `ACTIVE`), and `vcFundId` — the fund this deal belongs to. `vcFundId` is the one users forget: ask which fund, or if the firm has one obvious fund, confirm it. Optional: `dealName`, `dealStage` (default LEAD). Propose the full field set for approval before creating.

**Deal intake from a LOCAL FILE (the primary path — this is a Claude Code skill).**
The GP hands you a file — a pitch deck (PDF), a one-pager (docx), a term sheet, even a
screenshot — or pastes the text. You read it **yourself with local file tools** (Read the
PDF/doc/image directly; Claude Code has filesystem access — the MCP does NOT, so this is the
whole reason it's a local skill). Then:
1. **Read + extract** from the file: company name, one-liner, sector/geography, round
   (stage, size, raised/committed), key metrics (ARR, growth), the contact. Show the GP what
   you pulled and let them correct it — an extraction from a deck is a draft, not gospel.
2. **Dedupe:** `vi_list_deals(search=<company>)` — if it already exists (maybe it arrived by
   email and auto-created), stop and offer to update/note instead of duplicating.
3. **Propose the deal** (all three required fields — see above; ask which `vcFundId`), get approval → `vi_create_deal`.
4. **File the source doc** (optional, approved): `create_deal_room` → `create_folder` skeleton →
   upload the actual file via `get_upload_url` (presigned PUT — honour the returned
   `required_headers`) → `confirm_upload`. Now `search_documents` can ground future questions on
   the real deck, not your summary.
5. Report: deal id, stage, fund, room link, what was filed, suggested next action.

(Deals also arrive **by email** — the platform auto-ingests forwards to the pipeline inbox and
creates the deal itself. That path needs no skill; to work with those, read them via
`vi_list_emails(deal_id=…)` → `vi_get_email`. `/deal-intake` is specifically for the files that
land *outside* that pipe — the deck someone handed you in person, over Slack, wherever.)

## "Any update on [company]?" — the evidence pattern

1. `vi_list_deals(search=company)` → the deal + its `commentsAndNotes` summary.
2. `vi_list_emails(deal_id=…)` → the actual inbound trail (both stores).
3. `vi_get_email` on the relevant ids → quote verbatim, list attachments.
4. If claims need checking: `search_documents` over the deal's room for prior updates — compare claimed metrics against what earlier documents said, and cite both.
5. Engagement angle when useful: `get_audit_log(room_id)` + `get_document_activity` — who opened the deck, when.

Answer with: current stage, latest verbatim update (quoted), metric deltas vs. prior updates, and anything inconsistent.

## Judgment calls

- Pipeline emails auto-create deals — before creating one manually from an email, `vi_list_deals(search=…)` to avoid a duplicate.
- QA fixtures (names like "QA-…") show up in real workspaces; exclude them from GP-facing summaries unless asked.
- A deal's room usually shares the company's name — `list_deal_rooms` and match, don't guess room ids.

## Boundaries

Reads freely. `vi_create_deal`, `vi_move_deal_stage`, room creation, folder writes, uploads, and invites are proposals requiring human approval. Nothing here deletes — ever.
