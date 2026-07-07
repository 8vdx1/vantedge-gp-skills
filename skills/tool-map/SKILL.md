---
name: vantedge-tool-map
description: Routing map and conventions for every VantedgeAI MCP tool — which tool answers which question, required fields, pagination discipline, the firm-picker ritual, and error handling. Consult this before any multi-step VantedgeAI workflow, when unsure which tool to call, when a tool errors (credits, multi-firm, missing store), or when asked "what can you do with Vantedge". Triggers on "what tools do you have", "can you see my deals", "how do I", or any first touch of the VantedgeAI MCP in a session.
---

# VantedgeAI MCP — Tool Map & Conventions

You are working against the VantedgeAI MCP server (`fundos.vantedgeai.com/mcp`), which exposes ~43 tools across deal rooms, documents, AI generation, research, and the VI CRM (deal pipeline + LP CRM + email inbox). This skill is the routing map: which tool answers which question, and the conventions that keep multi-step work correct.

## Session conventions (apply to EVERY workflow)

**1. The firm-picker ritual.** Before any `vi_*` call, know which firm you're acting for. Call `vi_list_firms` once per session:
- One firm returned → use it silently; you may omit `vcFirmId` everywhere (the server auto-resolves).
- Multiple firms → ask the user which firm/fund this session is about, then pass that `vcFirmId` on **every** subsequent `vi_*` call. A write without it fails with "This investor owns multiple firms — pass vcFirmId".

**2. Orient vs. enumerate — never confuse them.** `fundos_get_agent_context` (2 credits) returns a top-10-per-section snapshot (latest deals, LPs, documents, your own recent tool calls). Use it to get situated. It is NOT the full book: to count or search deals/LPs, use `vi_list_deals` / `vi_list_lp_prospects` and **paginate** (`page`, `take` default 50) until a short page comes back. Do not trust `totalCount` — it is unreliable; stop on a short/empty page. Never report "you have 10 deals" from agent context.

**3. Reads are free-ish, writes are proposals.** Reads cost 1 credit (agent context 2), writes 10. Every write (create/update/move/note/task) must be proposed to the human and confirmed BEFORE calling. Batch proposals when triaging ("I suggest these 4 actions — approve?"). Never delete anything; no delete tools are exposed, and that's deliberate.

**4. Error playbook.**
- `insufficient_credits` (includes `topup_url`) → stop, surface the top-up link. Do NOT retry.
- "owns multiple firms" → run the firm-picker ritual.
- `notes: ["pipeline store unavailable…"]` on email calls → the analytics store is unreachable; report partial coverage honestly ("CRM mail only") and continue. Do not retry in a loop.
- A tool this map mentions isn't in your tool list → the user's connector cached an older catalogue; tell them to reconnect the VantedgeAI connector.

**5. Response envelope.** Most tools return `{data, success, error, pagination}`; a few (agent context, search_documents) return bare objects. Check both shapes.

## The VI CRM surface (the heart of GP/IR work)

### Email inbox — list/detail pair, TWO stores
The firm's mail lives in two stores: **`crm`** (LP inboxes + investment-update inboxes — tagged to LPs/deals) and **`pipeline`** (deal-forward inboxes that auto-create deals). `vi_list_emails` merges both.

- `vi_list_emails` — slim INDEX rows only: subject, sender, date, lp_id/lp_name, deal_id/deal_company, ~200-char snippet, attachment filenames, `source`. Params: `q` (free-text, searches full bodies on the crm store), `deal_id` (both stores), `source`, `limit` (default 25, cap 100). Rows are for FINDING mail — never quote a snippet as if it were the full message.
- `vi_get_email` — ONE email, FULL untruncated body + attachments. Requires `email_id` and the row's `source`. This is how you quote a mail verbatim, read a thread, or check attachments properly.

The flow is always: list (cheap, skimmable) → get (full). LP-scoped mail: there is no `lp_id` param — filter list rows by their `lp_id` field, or `q` by the LP's name.

### Deal pipeline
- `vi_list_deals` — paginated (`page`/`take` 50) with `search`, `dealStatus`, `dealStage`, `fundId` filters. Deal rows include `commentsAndNotes` (AI-written update summaries — useful, but summaries: for the underlying email use `vi_list_emails(deal_id=…)` → `vi_get_email`).
- `vi_create_deal` — WRITE. Requires `companyName`, `dealStatus` (e.g. ACTIVE), **and `vcFundId`** (the fund the deal belongs to — ask the user or look it up; creation fails without it). Optional `dealStage` from: `LEAD, INTERESTED, SEEK_INFO, MEETING_SCHEDULED, DUE_DILIGENCE, MOVE_TO_IC`.
- `vi_move_deal_stage` — WRITE, bulk: `dealIds` array + target `dealStage` from that same enum (anything else is rejected).

### LP CRM (fundraise pipeline)
- `vi_list_lp_prospects` — paginated (`page`/`take` 50), `stage`/`search` filters. The response's `stageCount` reveals the firm's actual stage names (stages are firm-configurable — read them from data, don't assume).
- `vi_create_lp_prospect` — WRITE. Requires `dealName` = **the LP's display name** (naming quirk: `dealName` is the LP identity; `lp_name` fields elsewhere are the person/contact). Optional `organizationName`, `email`, `stage`.
- `vi_update_lp_prospect` — WRITE. `id` + changed fields.
- `vi_move_lp_stage` — WRITE. `id` + `stage` (use a stage name seen in `stageCount`).

### CRM activity
- `vi_add_crm_note` — WRITE. `subjectType` (`LP_PROSPECT` or `DEAL`), `subjectId`, `content`.
- `vi_add_crm_task` — WRITE. `subjectType`, `subjectId`, `title`, optional `dueDate` (ISO 8601).

## Deal rooms & documents (VDR)

Rooms: `list_deal_rooms` (rooms carry `root_folder_id`; `room_type` separates deal rooms from `gp_fund_raise` ODD rooms) · `get_deal_room` · `create_deal_room` (WRITE, approval).
Documents: `list_documents` · `get_document_metadata` · `download_document` · `get_upload_url` + `confirm_upload` (upload pair — presigned PUT, honour the returned `required_headers`).
Folders: `list_folders` (tree with `doc_count`) · `create_folder` · `rename_folder` (WRITEs). No folder delete — by design.
Search: `search_documents` — semantic search with cited, highlighted excerpts; THE grounding tool. Use it to verify claims from emails against what documents actually say.
Access & audit: `list_room_members` · `invite_member` (WRITE, approval) · `list_users` · `get_audit_log` (who accessed what, when, from where) · `get_document_activity` (per-document engagement — who actually read it).
Q&A: `list_qa_questions` · `answer_qa_question` (WRITE, approval — LP-visible).
Intel: `get_intelligence_report`.

## AI generation & research

- `fundos_vdr_analyze` — red flags + entity map over a room's documents.
- `fundos_generate_odd` — draft DDQ/ODD answers from room docs (perfect response to an LP asking for a DDQ).
- `fundos_generate_cim` — draft a CIM from source docs.
- `fundos_get_similar_runs` — prior agent runs as precedent.
- Research analyst (async): `research_list_templates` → `research_add_sources` (VDR docs, URLs, or pasted text) → `research_generate_report` → poll `research_report_status` → `research_get_report`. Use for external/company research that documents alone can't answer.

## Cross-tool recipes (what can be done with what)

- **Quote an email that a deal note summarizes:** deal's `commentsAndNotes` → `vi_list_emails(q=company)` → `vi_get_email(id, source)` → verbatim.
- **Verify a claimed metric:** `vi_get_email` (the claim) + `search_documents` (the room's prior updates) → compare, cite both.
- **Inbound LP intro → onboarded:** `vi_create_lp_prospect` → `create_deal_room`/`invite_member` → `fundos_generate_odd` for their DDQ → `vi_add_crm_task` for the follow-up. (Each write approved.)
- **Forwarded deck → diligence room:** `vi_get_email` (attachment) → `vi_create_deal` → `create_deal_room` → `create_folder` skeleton → upload pair → later `search_documents`.
- **Engagement truth:** `vi_list_emails(deal_id)` + `get_audit_log(room_id)` + `get_document_activity` → who said what vs. who actually read what.
