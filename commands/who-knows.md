---
description: Find the warmest path to a person or company — email graph first, CRM second, optional consent-gated LinkedIn 2nd-degree check
argument-hint: "[person or company, e.g. 'Peter Thornbury' or 'Oakspire Payments']"
---

# Who Knows

> Uses the VantedgeAI MCP server. The optional LinkedIn step additionally requires a local browser session (Claude Code) and carries account risk — see below.

Answer "who can open this door?" for the target in $ARGUMENTS: the warmest introduction path, through whom, with evidence.

See the **who-knows** skill for the full method and the **vantedge-tool-map** skill for conventions.

Steps:
1. Email graph: `vi_list_emails(q=target)` — who has corresponded with them, how recently; quote the last exchange (`vi_get_email`).
2. CRM: `vi_list_lp_prospects` / `vi_list_deals` search — existing records, notes, LinkedIn-export matches (breadth only).
3. **Optional LinkedIn 2nd-degree check — only with explicit user consent, freshly given this session.** ⚠️ Warn first: automating a logged-in LinkedIn session violates LinkedIn's terms and risks account restriction. One target only, human-paced, stop on any captcha/warning. 2nd-degree mutual connections = the bridges; rank them by email-graph strength.
4. Propose a CRM note capturing the path (approval-gated).

Output: warmest path + evidence, alternates ranked, confidence tier (verified email / breadth / none).
