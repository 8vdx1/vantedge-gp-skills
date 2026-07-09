---
description: Turn a local file (pitch deck, one-pager, term sheet, screenshot) or pasted text into a pipeline deal
argument-hint: "[path to a file, or paste the deal content]"
---

# Deal Intake

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.
> **Local skill:** reads the file off your machine directly, so run it in Claude Code (not claude.ai).

Hand it a deck or doc — `/deal-intake ~/decks/oakspire.pdf` (or paste the text) — and it reads the file, pulls out the deal, and creates it in your pipeline, optionally filing the source doc so you can search it later.

See the **deal-pipeline** skill for the required fields and stage rules, and **vantedge-tool-map** for conventions.

Steps:
1. **Read the file locally** (PDF/docx/image/text via Claude Code's own file tools — the MCP can't reach your disk). Extract: company, one-liner, sector/geography, round (stage/size/committed), metrics, contact. Show what you pulled; let the GP correct it.
2. **Dedupe:** `vi_list_deals(search=<company>)` — if it exists (e.g. arrived by email already), stop and offer to update/note instead.
3. **Propose the deal** — `companyName`, `dealStatus`, **`vcFundId`** (ask which fund), optional `dealStage`. On approval → `vi_create_deal`.
4. **File the source doc** (optional, approved): `create_deal_room` → `create_folder` → upload the file (`get_upload_url` → `confirm_upload`) so `search_documents` grounds future questions on the real deck.
5. Report: deal id, stage, fund, room link, what was filed, suggested next action.
