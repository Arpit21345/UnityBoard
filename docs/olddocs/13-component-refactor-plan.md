# Component Architecture Refactor Plan

Goal: Split the monolithic `Project.jsx` (~800+ LOC) into small, reusable, testable components and feature panels to improve readability, reuse, and future feature velocity.

Outcomes
- Clear folder structure under `src/pages/Project/components`.
- Self-contained feature panels (Tasks, Resources, Settings, Dashboard).
- Reusable building blocks (LabelsEditor, TaskComments, PriorityBadge).
- No behavior changes; UI/UX preserved; build green.

Target structure
- src/pages/Project/
  - Project.jsx (container: loads project+me, renders tabs)
  - Project.css (shared styles)
  - components/
    - DashboardPanel.jsx (lightweight fetch for KPIs)
    - TasksPanel.jsx (all task logic, Kanban/List, modal)
    - ResourcesPanel.jsx (uploads, links, grid/list + sort)
    - SettingsPanel.jsx (project settings + invites)
    - LabelsEditor.jsx (reusable)
    - TaskComments.jsx (reusable)
    - PriorityBadge.jsx (reusable)

Refactor steps
1) Extract pure UI helpers: PriorityBadge, LabelsEditor, TaskComments.
2) Move Tasks panel into `TasksPanel.jsx`, including modal and Kanban/List logic.
3) Move Resources panel into `ResourcesPanel.jsx`.
4) Move Settings and Dashboard panels.
5) Slim down `Project.jsx` to tab routing + project/me fetch only.
6) Verify build, then small cleanups (dead code, unused imports).

Notes
- Keep existing CSS in `Project.css` to avoid style regressions.
- Use the same REST services; no API contracts change.
- Maintain localStorage keys per project for task view/filters.
