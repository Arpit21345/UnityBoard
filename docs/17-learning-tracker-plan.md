# Learning Tracker — Implementation Plan (v1)

Goal
- Build a clean, fully-featured Learning Tracker with complete CRUD, filters/sort, bulk actions, and scoped CSS, organized into small focused components.

Scope (v1)
- Fields: title, description, status (todo | in-progress | done), dueDate, tags[], materials[] (URLs), createdBy, timestamps.
- CRUD: create/edit/delete via modal; validation (title required).
- Filters: search (title/desc/materials), status, tag chips (multi); persist per project in localStorage.
- Sort: key = updatedAt (default) | dueDate | title; dir = asc/desc.
- Bulk actions: select visible items; bulk set status; clear selection.
- UX: badges for status/due, chip styling for tags, compact responsive card list, friendly empty states.

Out of scope (backlog)
- File attachments; reminders/notifications; progress %; sub-items; AI assist.

Backend (reuse)
- Model/controllers/routes already present and membership-protected:
  - GET /api/projects/:id/learning -> { ok, items }
  - POST /api/projects/:id/learning -> { ok, item }
  - PATCH /api/learning/:entryId -> { ok, item }
  - DELETE /api/learning/:entryId -> { ok }
- No schema changes needed for v1.

Frontend file structure
- frontend/src/pages/Project/components/Learning/
  - LearningPanel.jsx (container: state, fetch, orchestration)
  - LearningFilters.jsx (query/status/tags + sort controls; persists state)
  - LearningList.jsx (cards, selection, per-item actions; emits edit/delete)
  - LearningFormModal.jsx (create/edit form in Modal)
  - Learning.css (scoped styles only for Learning)

Component contracts
- LearningPanel
  - props: projectId, me
  - state: items, loading, filters (query/status/tags), sortKey, sortDir, selection, modal
  - effects: initial fetch; persist filters; bulk status API calls
- LearningFilters
  - props: query, status, tagsAll, tagsSelected, sortKey, sortDir
  - events: onQueryChange, onStatusChange, onToggleTag, onSortKeyChange, onSortDirToggle
- LearningList
  - props: itemsSorted, selectedIds
  - events: onToggleSelect(id), onEdit(item), onDelete(item)
- LearningFormModal
  - props: open, item, onClose, onSave(payload)

Sorting logic
- Default: updatedAt desc; dueDate asc; title asc.

Bulk update flow
- Toolbar appears when selection > 0: [Select all (filtered)] [Set Todo] [Set In progress] [Set Done] [Clear]
- Implementation: Promise.all(PATCH); optimistic UI per success count; toast result.

CSS outline (Learning.css)
- .learning-section
- .learning-toolbar
- .learning-bulkbar
- .learning-card
- .learning-title-row
- Reuse existing utility classes: .card, .chip, .badge, .btn

Edge cases
- Empty title -> warn and block save.
- Materials: accept as plain URLs; open in new tab; basic normalization (prepend https:// if missing).
- Large lists: client-side filter/sort; pagination later if needed.
- 403/401: friendly toasts (already wired globally).

Success criteria
- Lines per file reduced via component split.
- All actions show success/failure toasts; no unhandled rejections.
- Filters persist; sort/bulk status work; responsive layout; build green.

Rollout steps
- Create Learning/ components + Learning.css.
- Refactor current `LearningPanel.jsx` to use the new components.
- Manual QA: create/update/delete, filters/sort, bulk status, empty states.

Open questions (please confirm)
1) Include bulk delete in v1? (default: NO)
2) Any additional status values beyond todo/in-progress/done? (default: NO)
3) Default sort = updatedAt desc acceptable? (default: YES)
4) Reasonable limits: max 10 tags and 10 materials per item? (default: YES)
5) Any specific color mapping for statuses different from current badge palette? (default: use existing) i guess similar to the task management 
