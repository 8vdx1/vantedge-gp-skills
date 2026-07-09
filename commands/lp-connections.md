---
description: "Who do I know at this LP?" — team LinkedIn-export matches (owned data, no browser). Safe complement to /who-knows-whom
argument-hint: "[LP name or organization]"
---

# LP Connections

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

Find an internal warm path to an LP from the firm's own uploaded LinkedIn connections — no live LinkedIn, no account risk.

See the **lp-connections** skill for method and the **vantedge-tool-map** skill for conventions.

> ⚠️ Depends on a `vi_lp_connections` read tool that is NOT shipped yet (the backend "who do I know here" match exists but isn't exposed — TODO.md). Until then this says so and falls back to the email graph (`vi_list_emails` q=LP org) and, if the user consents, the live `/who-knows-whom` path.

Steps (once shipped):
1. Resolve the LP → `organizationName`, `id`.
2. `vi_lp_connections(lp_id)` → team contacts at that org (contact, title, holder, confidence).
3. Rank by warmth (holder's recent email traffic > stale connection).
4. Output the intro path + who should make it. Draft the ask; the human sends.
