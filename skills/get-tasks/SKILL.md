---
name: get-tasks
description: Surface the GP's open CRM tasks / todos — what's on the plate, what's overdue, what's owed on a given LP or deal. Use when reviewing to-dos, planning the day, or checking follow-ups due on a relationship. Triggers on "my tasks", "my todos", "what's on my plate", "what's due", "open follow-ups", "anything owed on [LP/company]", or "task list".
---

# Get Tasks

You surface and organize the GP's open CRM tasks through the VantedgeAI MCP. Read-only — you show and prioritize; you never silently complete or delete. Consult the **vantedge-tool-map** skill for conventions (firm picker, error playbook).

## ⚠️ Dependency: this needs `vi_list_tasks` (not yet shipped)

The MCP can currently CREATE tasks (`vi_add_crm_task`) but has no read tool. The backend read
methods exist (`crm-tasks.service`: `myOpen`, `byFirm`, `list`) — they just aren't exposed yet
(see `TODO.md` item #2). Until `vi_list_tasks` ships:
- Say so plainly: *"Reading tasks isn't wired into the MCP yet — I can create tasks but not list them back."*
- Fall back to what IS readable as a proxy for "what's owed": recent `vi_list_emails` flagged as
  needing reply, and `vi_add_crm_task` history you created this session.
- Do not pretend to have a task list you can't fetch.

This skill is written for the shipped-tool world so the workflow is ready the moment
`vi_list_tasks` lands.

## Method (once `vi_list_tasks` exists)

1. Firm picker if multi-firm (`vi_list_firms`).
2. **"My plate":** `vi_list_tasks` scoped to the acting user's open tasks (backend `myOpen`).
   For a specific relationship: scope by `subjectType`/`subjectId` (backend `list`).
3. **Organize, don't just dump:**
   - **Overdue** (dueDate < today) first, then **due today/this week**, then **no due date**.
   - Within each, order by subject seniority — a task on a commitment-stage LP or a
     diligence-stage deal outranks an early enquiry.
   - Group by subject (LP / deal) so related todos read together.
4. **Enrich each task** with the relationship it hangs off: pull the subject's name and, when
   useful, the last email (`vi_list_emails` filtered by `lp_id`/`deal_id` → `vi_get_email`) so
   the GP sees *why* the task exists, not just its title.
5. Output: a prioritized checklist — **Overdue · Today · This week · Someday** — each line
   `[LP/deal] — task title — due — one-line context`.

## Judgment calls

- A task with no due date and a stale subject is a candidate to close or reschedule — flag it,
  propose (approval-gated) an update via `vi_update_...`/task tools rather than acting.
- QA fixtures ("QA-…") appear in real firms — exclude from GP-facing lists unless asked.
- If the user asks to "clear" or "complete" a task, that's a write — propose it, get approval;
  never auto-complete.

## Boundaries

Read-only surfacing. Creating a task is `vi_add_crm_task` (approval-gated); completing/editing
is likewise a proposal. No deletes exist. Drafts, not sends.
