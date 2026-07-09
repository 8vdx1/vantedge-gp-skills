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
2. **Warm the session first — never cold-jump.** Navigate to `linkedin.com/feed` and confirm signed-in before any search URL. (Live-tested: a direct search-URL jump from a fresh tab triggered the `merchantpool` detection redirect; the same search from a warmed, signed-in session sailed through.)
3. **Resolve the company's numeric id** (one page load): visit `linkedin.com/company/<slug>/` and regex the HTML for `fsd_company:(\d+)`. The All-filters modal's obfuscated DOM makes UI clicking brittle — the URL facet is deterministic and identical in effect.
4. **Current staff roster** — navigate to the faceted URL (1st+2nd only, at the target company):
   `https://www.linkedin.com/search/results/people/?currentCompany=%5B%22<id>%22%5D&network=%5B%22F%22%2C%22S%22%5D&origin=FACETED_SEARCH`
5. **Extract from the result cards — everything is inline** (live-verified): name, `• 1st`/`• 2nd` badge, headline, location, AND the mutual-connections line — *"Ravi C., Ankur A. and 4 other mutual connections"* — so **the bridges come free; no profile visits ever needed**. Parse cards from rendered text; don't rely on `<li>` structure (it shifts).
   - **MANDATORY: the list is virtualized — you MUST scroll before/while extracting.** Only cards near the viewport exist in the DOM; a cold read of the page yields ~2 cards, NOT the real roster (this exact bug under-counted a test to "2 people" when there were many). Scroll in increments (~500–900px), pause ~1–2s per step, accumulate + dedupe by name across steps, until the page stops yielding new names. LinkedIn also injects a "Try Premium / advanced filters" upsell card mid-list — skip it, keep scrolling past it; it is not the end of results.
   - Read the "N results" count near the top to sanity-check how many you should end up with.
6. **Paginate:** page 1 rarely holds everyone (the pager runs 1…10+). After fully scroll-loading a page, click **Next** (or append `&page=N`), pause a random 5–7s, repeat up to the user's agreed cap. Report how many pages you actually read vs. the total available — never imply you saw everyone if you stopped at the cap.
7. **Alumni (backchannel roster):** same URL with `pastCompany=%5B%22<id>%22%5D` instead — former employees, the candid-reference pool for diligence.
8. Cross-reference every person and bridge against Step 1: a bridge with recent email traffic with the firm is the warm path. Rank by owned-signal strength, not LinkedIn degree.
9. Close the tab as soon as the roster is captured — no extra browsing.

**Step 4 — capture the finding.**
Propose (approval-gated) a `vi_add_crm_note` on the relevant LP/deal: *"Warm path to <target>: 2nd degree via <bridge> (last emailed <date>). Checked <date>."* — so the intelligence lands in the CRM and the lookup never needs repeating.

## Output shape

- **Warmest path**: who should make the intro, and why (evidence: last email date, mutual link)
- **Alternates**: other bridges, ranked
- **Confidence**: verified (email) / breadth (LinkedIn export or connection) / none
- If nothing found: say so plainly and suggest the coldest-viable route (e.g. the org's contact on a deal record)

## Boundaries

Steps 1–2 read owned data freely. Step 3 never runs without fresh, explicit consent in the current session. The CRM note is a proposal requiring approval. Never message anyone on LinkedIn, never send connection requests, never scrape beyond the single target — this skill finds paths; the human walks them.
