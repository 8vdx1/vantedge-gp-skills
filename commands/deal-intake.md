---
description: Turn a forwarded deck/intro email (or a description) into a pipeline deal — optionally with a data room and the deck filed
argument-hint: "[company name, email subject, or paste the intro]"
---

# Deal Intake

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

Take an inbound deal — a forwarded email with a deck, or a described opportunity — and intake it end-to-end: deal record, optional data room with folder skeleton, deck filed where AI search can ground on it.

See the **deal-pipeline** skill for required fields and stage rules, and **vantedge-tool-map** for conventions.

Steps:
1. If $ARGUMENTS points at an email: `vi_list_emails(q=…)` → `vi_get_email` for the full body + attachments. Extract company, one-liner, round, metrics, contact.
2. Dedupe: `vi_list_deals(search=company)` — if it exists, report and stop (offer a note instead).
3. Propose the deal: `companyName`, `dealStatus`, **`vcFundId`** (ask which fund if unclear), `dealStage`. On approval → `vi_create_deal`.
4. Offer the room: `create_deal_room` + folder skeleton (`create_folder`) + upload the deck (`get_upload_url` → `confirm_upload`). Each write approved.
5. Report: deal id, stage, room link, what was filed — and a suggested next action (e.g. a task to schedule the first call).
