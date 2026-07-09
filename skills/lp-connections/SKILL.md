---
name: lp-connections
description: "Who do I know at this LP?" using the firm's OWNED data — team LinkedIn-export matches against an LP's organization (the lp_linkedin_connections feature). The safe, no-browser complement to who-knows-whom's live check. Use before outreach to find an internal warm intro. Triggers on "who do I know at", "any connections at", "warm intro to [LP]", "who on my team knows", or "internal path to [LP]".
---

# LP Connections (owned-data warm paths)

You find internal warm paths to an LP by matching the firm's **own uploaded LinkedIn exports** against the LP's organization — no live LinkedIn, no account risk. This is the *breadth+safe* layer; `who-knows-whom` is the *live* layer. Consult the **vantedge-tool-map** skill for conventions.

## ⚠️ Dependency: needs an MCP tool that isn't shipped yet

The backend feature exists — VantedgeAI's LP CRM has a "who do I know here" network match: team members upload LinkedIn connection exports, stored per firm+owner (`lp_linkedin_connections`), fuzzy-matched to an LP's `organizationName`. **But no `vi_*` MCP tool exposes it** (confirmed: zero references in the MCP/proxy). So a client agent cannot call it today.

Until a read tool ships (e.g. `vi_lp_connections(lp_id)` → matched contacts with name, title, connection strength; TODO.md), this skill must:
- Say plainly: *"The team-network match ('who do I know here') isn't exposed via the MCP yet — I can't pull it."*
- Fall back to the **`who-knows-whom`** skill (live LinkedIn, consent-gated) and the **email graph** (`vi_list_emails` q=LP org → who's already corresponded) as the available warm-path signals.

Written for the shipped-tool world so it's ready the moment the tool lands.

## Method (once `vi_lp_connections` exists)

1. Resolve the LP (`vi_list_lp_prospects search=…`) → its `organizationName` and `id`.
2. `vi_lp_connections(lp_id)` → the team's LinkedIn contacts matched to that org: contact name, title, which **team member** holds the connection, match confidence.
3. **Rank by warmth, not just existence** (Verata's lesson): a match whose holder also has recent email traffic with the firm/LP outranks a stale 2019 connection. Cross-check holders/contacts against `vi_list_emails`.
4. Output: *"3 people on your team know someone at Thornbury: Ankur → Peter Thornbury (CIO, high confidence, Ankur emailed him last week) …"* — the intro path + who should make it.

## Relationship to who-knows-whom

- **lp-connections** = owned exports, safe, instant, firm-wide breadth. Run this FIRST.
- **who-knows-whom** = live LinkedIn 2nd-degree, consent-gated, account-risk, for a high-value target when owned data comes up empty.
- Both feed the same question; always prefer the owned/safe layer.

## Boundaries

Read-only. Never messages or connects on anyone's behalf. Drafts an intro-request for the holding team member to send; the human sends it. No deletes.
