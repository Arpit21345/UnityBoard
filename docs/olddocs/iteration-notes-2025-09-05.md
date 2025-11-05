# 2025-09-05 — Frontend iteration (meta)

Purpose: Co-locate feature CSS, reduce global style bleed, add auth redirect on 401/403, and wire a Past Projects page.

What changed (by file)
- frontend/src/pages/Project/components/Tasks/Tasks.css
  - Moved Kanban, filters, and Task modal styles here from Project.css
  - Scoped selectors (e.g., `.tasks-panel .chip`, `.task-modal .card.p-3`) to avoid global overrides
- frontend/src/pages/Project/Project.css
  - Removed Tasks-specific rules now living in Tasks.css
- frontend/src/pages/Project/components/LabelsEditor.css (new)
  - Styles for LabelsEditor; imported in LabelsEditor.jsx
- frontend/src/pages/Project/components/LabelsEditor.jsx
  - Import of LabelsEditor.css
- frontend/src/pages/Project/components/PriorityBadge.css (new)
  - Only priority color variants; relies on global `.badge` base
- frontend/src/pages/Project/components/PriorityBadge.jsx
  - Import of PriorityBadge.css
- frontend/src/setupFetch.js (new)
  - Global fetch wrapper: on 401/403 clears token and redirects to `/login?next=...&reason=...`
- frontend/src/main.jsx
  - Import setupFetch.js so it initializes at app start
- frontend/src/pages/PastProjects/PastProjects.jsx (new)
  - Lists archived/completed projects with search; link to open
- frontend/src/App.jsx
  - Added route: `/past-projects`

Notes / risks
- CSS: Reduced duplicates; scoped `.chip` and modal card styles to Tasks context to avoid affecting other pages.
- Badges: PriorityBadge now only adds variant classes; base `.badge` continues coming from global styles.
- Auth: Redirect on 401/403 is centralized; pages with stale tokens will bounce to login automatically.
- Backend: No backend changes in this iteration.

Rollback hints
- Remove imports added in `main.jsx` and `PriorityBadge.jsx`, `LabelsEditor.jsx` if needed.
- Delete new files: `setupFetch.js`, `PriorityBadge.css`, `LabelsEditor.css`, `PastProjects.jsx`.
- Revert `App.jsx` route and restore removed Tasks CSS back to `Project.css` (not recommended).

Quick verify
- Tasks tab renders both List and Board with intact styling; labels add/remove still works.
- Trigger 401 (remove `localStorage.token`) and navigate — app redirects to `/login` with reason.
- Visit `/past-projects` — archived/completed projects listed with search.
