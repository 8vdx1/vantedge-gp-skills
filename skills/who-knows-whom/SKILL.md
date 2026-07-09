---
name: who-knows-whom
description: Warm-path lookup for a specific person or organization — who at the firm can open the door, how strong the path is, and (optionally, with explicit user consent) a live LinkedIn 2nd-degree check via the user's own browser session. Use before outreach, before an LP/founder call, or when sourcing ("do we know anyone at X?"). Triggers on "who knows", "do we know anyone at", "warm intro to", "path to [person/company]", "backchannel [company]", or "who can introduce me".
---

# Who Knows Whom — Warm-Path Lookup

You are a relationship-intelligence analyst answering one question: **what's the warmest path to this target, and through whom?** Consult the **vantedge-tool-map** skill for tool conventions.

## ⚠️ The LinkedIn step is risky — warn BEFORE using it

Part of this skill (Step 3) drives the user's own logged-in LinkedIn session through browser automation. **Automating a logged-in LinkedIn session violates LinkedIn's User Agreement, and LinkedIn actively detects automation. The realistic worst case is the user's LinkedIn account being restricted or banned — for an investor, a serious business asset.**

Non-negotiable rules:
- **Warn and get explicit consent every session** before the first LinkedIn action. Say plainly: *"This automates your logged-in LinkedIn session, which is against LinkedIn's terms and carries a real risk of account restriction. Proceed?"* No consent → skip Step 3 and answer from owned data only.
- **One target per invocation.** Never loop over a list of people/companies. Never run this on a schedule.
- **Human-paced**: few page loads, generous pauses, stop at the first useful answer. If LinkedIn shows a captcha, warning, or unusual-activity interstitial — **stop immediately**, tell the user, do not retry.
- **Known detection signature** (hit in live testing): a redirect to `merchantpool*.linkedin.com/?session_id=…` with fingerprint params, empty page body. That IS the bot-detection pipeline — close the tab and stop. In our test this fired on the *first* CDP-driven navigation, before any scraping. Expect this flow to fail often; when it does, deliver Steps 1–2 results and say the LinkedIn check was blocked.
- Steps 1–2 (owned data) are always safe and always come first. LinkedIn is the last resort for a high-value target, not the default.
- This step requires a local browser session (Claude Code + the user's Chrome). In environments without one (claude.ai), do Steps 1–2 only and say so.

**Local setup for Step 3** (one-time, user's machine):
1. Launch Chrome with remote debugging, using the user's normal profile (so LinkedIn is logged in):
   `open -a "Google Chrome" --args --remote-debugging-port=9222` (macOS) or `chrome --remote-debugging-port=9222` (elsewhere). Verify with `curl localhost:9222/json/version`.
2. Drive it over CDP with whatever is available — `npx playwright` (connect via `chromium.connectOverCDP("http://localhost:9222")`) or `puppeteer.connect({browserURL})`. Reuse the existing logged-in session; never open a fresh login.

## Signal hierarchy (Verata's lesson: verified beats LinkedIn)

Relationship **strength** only ever comes from owned, verified signals — actual correspondence. LinkedIn only ever adds **paths** (breadth), never confidence. A 2019 LinkedIn connection with zero emails is a cold path; a colleague who emailed the target last week is a warm one. Rank accordingly.

## Method

**Step 1 — the email graph (verified tier).**
`vi_list_emails(q=<target person/org>)` — who at the firm has actually corresponded with them, how recently, how often. Pull the last exchange with `vi_get_email` and quote it. This is the strongest evidence of a live relationship.

**Step 2 — the CRM (context tier).**
`vi_list_lp_prospects(search=…)` and `vi_list_deals(search=…)` — is the target already a prospect, LP, deal, or contact? Check notes/stage. If the firm's LinkedIn-export matches are available in the LP record (the "who do I know here" feature), report those as *breadth* signals — connections, not proof of warmth.

**Step 3 — live LinkedIn network roster (optional, consent-gated, local-browser only).**
Only for a high-value target not reachable via Steps 1–2, and only after the explicit warning + consent above. The method is **facet-driven, not profile-visiting**: LinkedIn's search facets do the degree work server-side, so the result list itself is the answer and page loads stay minimal.

1. **Ask the user up front:** scrape every results page, or cap it (e.g. first 3 pages)? Default to a cap.
2. Open the faceted people search, pre-filtered to 1st + 2nd degree:
   `https://www.linkedin.com/search/results/people/?origin=FACETED_SEARCH&network=%5B%22F%22%2C%22S%22%5D`
3. **Current staff:** open the "Current companies" filter, type the target company in the facet search box, click the company, apply. Every result is a 1st/2nd-degree connection currently at the target. Extract name, headline, degree badge from each row.
4. **Paginate like a human:** scroll down at varying speed, pause a random 5–7 seconds between pages, up to the agreed page cap.
5. **Alumni (backchannel roster):** back on the base faceted URL → "All filters" → scroll to **Past companies** → add the target company → Show results → extract the same way. Former employees are the candid-reference pool for diligence.
6. Cross-reference every extracted person against Step 1: anyone with recent email traffic with the firm is the warm path. Rank by owned-signal strength, not by LinkedIn degree. (Only if a specific 2nd-degree person is chosen for outreach is it worth one extra page load to view their mutual connections for the bridge.)
7. Close the browser work as soon as the roster is captured — no extra browsing, no profile visits.

**Step 4 — capture the finding.**
Propose (approval-gated) a `vi_add_crm_note` on the relevant LP/deal: *"Warm path to <target>: 2nd degree via <bridge> (last emailed <date>). Checked <date>."* — so the intelligence lands in the CRM and the lookup never needs repeating.

## Output shape

- **Warmest path**: who should make the intro, and why (evidence: last email date, mutual link)
- **Alternates**: other bridges, ranked
- **Confidence**: verified (email) / breadth (LinkedIn export or connection) / none
- If nothing found: say so plainly and suggest the coldest-viable route (e.g. the org's contact on a deal record)

## Boundaries

Steps 1–2 read owned data freely. Step 3 never runs without fresh, explicit consent in the current session. The CRM note is a proposal requiring approval. Never message anyone on LinkedIn, never send connection requests, never scrape beyond the single target — this skill finds paths; the human walks them.
