# UnityBoard — Feature Roadmap and Component Architecture (Next Steps)

This document summarizes current status and defines the component-based plan to complete remaining features, with DB models, APIs, UI components, and step-by-step rollout.

## 1) Current status (done)
- Architecture
  - React 18 + Vite SPA, custom CSS, component-based layout
  - Project page decomposed into modular panels:
    - DashboardPanel.jsx
    - TasksPanel.jsx (Kanban/List, filters, bulk ops, labels, priority, comments, assign)
    - ResourcesPanel.jsx (uploads/links, grid/list, sort, provider filter, delete)
    - SettingsPanel.jsx (visibility, member invites)
  - Reusable components: PriorityBadge, LabelsEditor, TaskComments, MemberPicker, Modal, Toast
  - Container: `pages/Project/Project.jsx` slimmed; builds pass
- Backend
  - Models: Project, Task, Resource, Invitation, User
  - Routes: projects, tasks, resources, invites, auth, health, explore, ai (scaffold)
- Services
  - `src/services/{projects,resources,invites,auth}.js` complete for implemented features
- Docs
  - dbms-oops-details.txt (DBMS/OOPs mapping)

## 2) Remaining feature set (high-level)
- Learning Tracker: Track study topics/tasks, status, materials, due dates
- Smart Snippets: Save code snippets with tags, language, usage notes
- Solution Database: Store and browse solved problems/solutions (e.g., DS/Algo)
- Discussion Room: Threads with messages/comments for collaboration

## 3) Data models and APIs (backend plan)
Note: Use Mongoose style consistent with existing models.

- LearningEntry
  - Fields: _id, projectId(FK), title, description, status(todo/in-progress/done), tags [string], dueDate, materials [url], createdBy, createdAt, updatedAt
  - APIs:
    - GET /api/projects/:id/learning
    - POST /api/projects/:id/learning
    - PATCH /api/learning/:entryId
    - DELETE /api/learning/:entryId

- Snippet
  - Fields: _id, projectId(FK), title, code, language, tags [string], notes, createdBy, createdAt, updatedAt
  - APIs:
    - GET /api/projects/:id/snippets
    - POST /api/projects/:id/snippets
    - PATCH /api/snippets/:snippetId
    - DELETE /api/snippets/:snippetId

- Solution
  - Fields: _id, projectId(FK), title, problemUrl, category, difficulty, approach, code, language, tags [string], createdBy, createdAt, updatedAt
  - APIs:
    - GET /api/projects/:id/solutions
    - POST /api/projects/:id/solutions
    - PATCH /api/solutions/:solutionId
    - DELETE /api/solutions/:solutionId

- DiscussionThread / Message
  - Thread: _id, projectId(FK), title, tags [string], createdBy, createdAt, updatedAt, lastActivityAt
  - Message: _id, threadId(FK), userId, text, createdAt
  - APIs:
    - GET /api/projects/:id/threads
    - POST /api/projects/:id/threads
    - PATCH /api/threads/:threadId
    - DELETE /api/threads/:threadId
    - GET /api/threads/:threadId/messages
    - POST /api/threads/:threadId/messages

Security/Policy (consistent with existing):
- Auth required; membership enforced per project
- Owner/Admin privileged actions (delete, visibility)
- Rate limiting as per middleware

## 4) Frontend structure (files to add)
Folder: `frontend/src/pages/Project/components`
- LearningPanel.jsx
  - Features: list/board toggle, filters (status/tags), quick-add, edit modal, study materials links
  - Reuses: LabelsEditor, PriorityBadge (optional display), Modal, MemberPicker (optional)
- SnippetsPanel.jsx
  - Features: search, language filter, tag filter, grid/list toggle, snippet modal with code editor
  - Reuses: LabelsEditor, Modal
- SolutionsPanel.jsx
  - Features: search, filter by category/difficulty, table view, details modal with approach + code
  - Reuses: LabelsEditor, Modal
- DiscussionPanel.jsx
  - Features: threads list, create thread, thread detail with messages, composer
  - Reuses: Modal

Reusable components (shared under `frontend/src/components`)
- TagChips.jsx (generalized chip input used by LabelsEditor or new ones)
- CodeEditor.jsx (simple textarea variant first; later Monaco optional)
- Table.tsx/ResponsiveTable.jsx (simple table wrapper)
- EmptyState.jsx (icon + message + action)

Services (frontend): `frontend/src/services`
- learning.js — wrap learning APIs
- snippets.js — wrap snippets APIs
- solutions.js — wrap solutions APIs
- discussion.js — wrap threads/messages APIs

Routing/Wiring
- `ProjectSidebar.jsx` already has menu keys: learning, snippets, solutions, discussion.
- Add conditional renders in `Project.jsx` to mount the new panels (after building them).

## 5) UI contracts (per panel)
Minimal contracts ensure testability and reuse.

- LearningPanel
  - Inputs: projectId, me
  - Behavior: CRUD entries, filter by status/tags/query, localStorage persistence, modal for add/edit
  - Errors: show toast, keep UI responsive

- SnippetsPanel
  - Inputs: projectId, me
  - Behavior: CRUD snippets, filter by language/tags/query, copy code, modal for add/edit

- SolutionsPanel
  - Inputs: projectId, me
  - Behavior: CRUD solutions, filter by category/difficulty/tags/query, details modal with approach + code

- DiscussionPanel
  - Inputs: projectId, me
  - Behavior: list threads, create/edit thread, show messages, post message

## 6) Componentization rules we’ll keep following
- Keep panels focused; avoid >300 LOC by extracting subcomponents:
  - Forms (e.g., LearningEntryForm.jsx, SnippetForm.jsx)
  - Lists (e.g., ThreadList.jsx, SnippetList.jsx)
  - Row/Card views (e.g., SolutionRow.jsx)
- Reuse shared components (Modal, Toast, MemberPicker, LabelsEditor) instead of inline implementations
- Persist view state and filters in localStorage per project
- Keep services thin functions with clear inputs/outputs; no UI code inside

## 7) Step-by-step rollout plan
1. Add frontend services: learning.js, snippets.js, solutions.js, discussion.js
2. Build panels one-by-one with minimal viable UI and tests:
   - LearningPanel → wire to `Project.jsx`
   - SnippetsPanel → wire
   - SolutionsPanel → wire
   - DiscussionPanel → wire
3. Extract shared subcomponents when code passes ~250 LOC signals
4. CSS pass: keep styles in `Project.css` scoped classes; add minimal new classes
5. Backend endpoints/models (if not present): implement and test via Postman
6. Quality gates: lint, type surface sanity, build, quick smoke

## 8) Acceptance criteria per feature
- Learning Tracker
  - CRUD entries, filters, modal edit, persistence
- Smart Snippets
  - CRUD, code display with copy, filters (language/tags/search)
- Solution Database
  - CRUD, table display, details modal (approach + code)
- Discussion Room
  - Thread CRUD, messages list/post, last activity sorting

## 9) Risks and mitigations
- Panel bloat → extract subcomponents early
- Backend shape drift → define DTOs in services; align backend
- Styling sprawl → reuse Project.css tokens and utility classes

## 10) Next immediate actions (in order)
- Create service stubs: learning.js, snippets.js, solutions.js, discussion.js
- Scaffold empty panels with TODOs and mount one by one (Learning first)
- Implement Learning CRUD end-to-end; verify persistence and filters
- Iterate on Snippets, Solutions, Discussion similarly
