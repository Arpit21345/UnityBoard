# Feature: Task Management

## Purpose
Enable full lifecycle handling of project tasks (capture, prioritize, assign, track, complete) with a balance between speed (inline edits, drag+drop) and clarity (filters, labels, priorities). Supports both Kanban-style flow and detailed list operations with bulk updates.

## Core Capabilities
| Area | Capability |
|------|-----------|
| Views | Board (Kanban), List (tabular rows) |
| CRUD | Create (modal), Inline rename, Edit modal (fields + comments) |
| Status Flow | `todo` → `in-progress` → `done` (reversible) |
| Priority | `urgent`, `high`, `medium` (default), `low` |
| Assignees | Single primary assignee (array model for future expansion) |
| Labels | Up to 5 free-text labels per task (deduped, length-limited) |
| Due Dates | Optional ISO date; used for risk highlighting + dashboard metrics |
| Comments | Embedded thread via `TaskComments` component |
| Filters | Status, Assignee, Priority, Label, Text Search (title/description) |
| Bulk Ops | Multi-select in List view: set status, clear selection, select all filtered |
| Drag & Drop | Board view column moves update status instantly |
| Persistence | User preferences (view mode, filters, query) stored per-project in localStorage |

## Data Model (Task)
```
{
  _id: string,
  projectId: string,
  title: string,
  description?: string,
  status: 'todo' | 'in-progress' | 'done',
  priority: 'urgent' | 'high' | 'medium' | 'low',
  assignees: string[], // currently 0 or 1 ID used
  labels: string[],
  dueDate?: ISODate,
  createdAt, updatedAt
}
```

## Component Structure
```
/pages/Project/components/Tasks/
  TasksPanel.jsx      // Orchestrator: state for filters, view mode, persistence
  TasksFilters.jsx    // Filter + toolbar UI (view toggle, search, selects, actions)
  TasksBoard.jsx      // Kanban columns with draggable cards
  TasksList.jsx       // List view with bulk selection & inline edits
  LabelFilter.jsx     // Custom dropdown for label filtering (replaces wide native <select>)
  Tasks.css           // Scoped task feature styling
../LabelsEditor.jsx   // Shared label add/remove editor (modal & board)
../PriorityBadge.jsx  // Priority pill renderer
../TaskComments.jsx   // Embedded comments thread
```

## Flow Overview
1. Project page loads → tasks fetched once in parent (`Project.jsx`).
2. `TasksPanel` receives tasks + sets up filters & persistent state keys `proj:<id>:tasks:*`.
3. Filters produce `filteredTasks` (pure function in `useMemo`).
4. Board view groups tasks by status; drag events call `apiUpdateTask` with new status.
5. List view renders rows; inline rename, priority/status changes call `apiUpdateTask`.
6. Modal create/edit path shares form logic with rename/inline operations (unified update route).
7. After any mutation, parent updates tasks array → re-renders board/list + dashboard metrics.

## Key Functions & Responsibilities
| File | Responsibility |
|------|----------------|
| `TasksPanel.jsx` | Filter state, persistence, deciding board vs list, exposing handlers |
| `TasksFilters.jsx` | Controlled inputs for filters, triggers new task modal, clear filters |
| `TasksBoard.jsx` | Column breakdown, drag handlers, inline rename in cards |
| `TasksList.jsx` | Bulk selection logic, inline rename, extended row metadata |
| `LabelsEditor.jsx` | Add/remove labels (caps at 5, trims, dedup) |
| `LabelFilter.jsx` | Compact searchable dropdown to avoid giant native select overflow |
| `PriorityBadge.jsx` | Visual priority semantics (color-coded) |
| `TaskComments.jsx` | Task-specific discussion (loaded only inside modal / list rows) |

## LocalStorage Keys
| Key Pattern | Purpose |
|-------------|---------|
| `proj:<id>:tasks:view` | Last chosen view mode (`board`/`list`) |
| `proj:<id>:tasks:status` | Status filter |
| `proj:<id>:tasks:assignee` | Assignee filter |
| `proj:<id>:tasks:priority` | Priority filter |
| `proj:<id>:tasks:label` | Label filter |
| `proj:<id>:tasks:q` | Search query |

## Styling Notes
- Feature-scoped in `Tasks.css` to avoid `Project.css` bloat.
- Board & list share spacing token scale (uses global CSS variables in `tokens.css`).
- Chips (labels) reuse `.chip` base from global or local definitions for consistent shape.
- New `label-filter` custom popover isolates width and prevents full-width native dropdown overflow.

## Performance Considerations
- Filtering is O(n) over tasks; cheap at typical sizes (< 1k tasks). Memoization avoids re-compute unless dependencies change.
- Drag and inline edits optimistically update after server resolves; no refetch loop.
- Bulk updates issue parallel `apiUpdateTask` calls; could be batched later if needed.

## Error Handling
- Individual `apiUpdateTask` failures caught → toast error, original task preserved.
- Bulk operations swallow per-item failures but report success count.
- Missing/empty filter data gracefully defaults (e.g., invalid stored key falls back to 'all').

## Accessibility
- Drag handles have visual glyph (⋮⋮) and rely on standard mouse DnD (keyboard DnD enhancement is a future improvement).
- All interactive elements reachable; inputs have visible focus states using ring shadow.

## Recent Adjustments (2025-09-06)
- Introduced `LabelFilter.jsx` to prevent giant native label select overlay.
- Added label length cap (32) + safe truncation in dropdown and editor.
- Reverted earlier width attribute experiments that unintentionally distorted layout.

## Extension Opportunities
| Idea | Value | Complexity |
|------|-------|-----------|
| Multi-assignee | Team collaboration | Medium |
| Subtasks / checklist | Granularity | Medium |
| Kanban WIP limits | Flow control | Low/Med |
| Saved filter sets | Faster context switching | Low |
| Keyboard DnD / shortcuts | Accessibility & speed | Med |
| Task archived state | Clutter reduction | Low |
| SLA / aging indicators | Risk surfacing | Low |
| Batch create via paste | Rapid capture | Low |

## Guardrails
- Avoid adding heavy external drag libraries unless native proves insufficient.
- Keep label system flexible (no strict taxonomy) until usage data suggests normalization.
- Maintain O(1) task update path (patch only changed task, do not rebuild full arrays server-side).

## Quick Test Checklist
- Create task → appears in current view respecting filters.
- Rename inline (board/list) → persists and exits edit mode.
- Drag from Todo → In Progress → Done → status updates immediately.
- Apply each filter (status, priority, assignee, label) → only matching tasks remain.
- Bulk select (list) → change status → all update correctly.
- Add labels (up to 5) → truncated if over 32 chars; duplicates ignored.
- Label filter popover search narrows visible options; selecting updates filter + closes.
- Clearing filters resets all localStorage keys to defaults.

---

# End of Task Management Feature Doc
