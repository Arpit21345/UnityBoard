# Task Management — Completion Plan (Sprint A wrap + next)

Scope (remaining)
- Priority: UI controls in create/edit + inline, badge in list/board, filter by priority.
- Labels/Tags: optional chips per task; filter by label. Small schema change.
- Search: quick client-side search (title+description), server param later.
- Task detail modal: single place to view/edit title, desc, assignee, priority, due date, comments, delete.
- Bulk actions: extend to bulk assign (optional) and bulk delete (guarded by confirm).
- Activity: minimal task activity (created, status change, rename, comment added) list.
- Performance: light pagination or lazy loading for large task lists (optional).

Out of scope (for now)
- Real-time presence/updates, sub-tasks, attachments beyond Resources, advanced roles.

Delivery order (phased)
1) Priority — DONE
   - Added priority selector in list rows, Kanban card actions, and task modal.
   - Priority badge shown on cards/rows; added Priority filter (persisted per project).
   - Enum extended to include 'urgent' (backend + UI).
2) Labels/Tags — DONE
   - Extended Task schema with `labels: [string]`.
   - UI: add/remove chips in list/board/modal; filter by label.
3) Search (client-side) — DONE
   - Search box in Tasks; filters title+description locally and persists per project.
4) Task detail modal
   - Unify editing (title, desc, assignee, due, priority, labels) + comments tab.
   - Keep inline quick edits as-is; modal for fuller edits.
5) Bulk actions (optional)
   - Bulk assign; optional bulk delete (confirm + toast).
6) Activity (minimal)
   - Append simple events on create/status change/rename/comment (in task doc).
   - Render in modal Activity tab.
7) Pagination (optional)
   - Page or lazy load tasks if count is large.

Acceptance criteria
- Priority and label filters work with existing status/assignee filters.
- Task modal reliably updates all fields and reflects in list/board.
- Search reduces visible tasks client-side without server calls.
- Bulk actions show success/error toasts and update state in place.

CSS backlog (log-only, do later)
- Priority badges visual: Project.css — subtle colors for low/med/high.
- Label chips: overflow handling + wrap; consistent spacing.
- Task modal mobile layout: full-height, scroll body.
- Kanban card spacing: compact mode toggle.

Open questions (answer after Task completion, keep here for reference)
- Priority: keep ['low','medium','high'] or add 'urgent' now?
yes add it is just list na 
- Labels: limit to 5 per task? Allowed characters/colors?
colors yes but 5 per task dindt get 
- Search scope: title+description only, or include comments?
which is not making complex do that 
- Bulk actions: enable bulk delete now or defer?
bul delete of what taskdoesnt sounds good 
- Activity: minimal in-document activity sufficient, or store separate collection later?
no idea 

Next feature candidates (after Tasks)
- AI helper in task modal
  - Suggest tasks from project context; insert selected suggestions.
  - Question: who can access (owner/admin vs all members)?
- Members & invites polish
  - Show roles in picker, better invite UX (copy, expiry info).
  - Question: any new roles beyond owner/admin/member?
- Project pages: Snippets / Learning / Discussion tabs (MVP)
  - Simple CRUD per tab; list + detail; comments optional.
  - Question: which tab to prioritize?
- Explore improvements (defer if final)

Notes
- We will implement features first and batch CSS at the end of each phase.
- This doc is additive; original sprint plan remains unchanged.
