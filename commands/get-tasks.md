---
description: Show open CRM tasks / todos — prioritized by overdue/due, grouped by LP or deal, with the context behind each
argument-hint: "[optional focus, e.g. 'overdue only' or 'tasks on Eight Capital']"
---

# Get Tasks

> Uses the VantedgeAI MCP server. See the [README](../README.md) for connection requirements.

Surface the GP's open todos, prioritized and grouped, with the relationship context behind each.

See the **get-tasks** skill for the method and the **vantedge-tool-map** skill for conventions.

> ⚠️ Depends on the `vi_list_tasks` MCP tool, which is not shipped yet (backend `myOpen`/`list`
> exist — see `TODO.md` #2). Until then this reports that task-reading isn't wired in and falls
> back to reply-needed emails as a proxy.

Steps:
1. Firm picker if multi-firm.
2. `vi_list_tasks` — the acting user's open tasks (or scoped to the subject in $ARGUMENTS).
3. Order: Overdue → Due today/week → No date; within each, by subject seniority; grouped by LP/deal.
4. Enrich each with subject name + last exchange for the "why".
5. Output a prioritized checklist. Any complete/edit is a proposal, not an action.
