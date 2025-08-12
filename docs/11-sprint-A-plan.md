# Sprint A — Core Collaboration (1 week)

Scope
- Shared: Member picker, Toast/Notices
- Tasks v1: List + Kanban + DnD + comments
- Resources v1: file/link + previews + search

Shared
- [x] Toast system (success/error/info)
- [x] Member picker (search project members; keyboard nav)

Tasks v1
Backend
- [x] Task schema: assignee, status, priority, dueDate (labels deferred)
- [x] Endpoints: list, create, update/move(status), comment add/list (server-side filter deferred)

Frontend
- [x] List view (filters: status, assignee)
- [x] Kanban lanes with DnD (UI labels map to todo/in-progress/done)
- [x] Task modal: create/edit, “Assign to me”
- [x] Comments (basic add/list on task)
- [x] Empty/loading states; API error toasts
- [x] Inline rename (list + board)
- [x] Delete task (list + board)
- [x] Bulk status update in list view

Acceptance
- [x] Drag updates status server-side
- [x] Filters by assignee/status work
- [x] Comments render chronologically

Resources v1
Backend
- [x] Upload route (size checks), list, delete
- [x] Link creation endpoint
- [ ] Tags and server-side search (deferred)

Frontend
- [x] Add resource (file/link), progress
- [x] Preview (image/pdf), link favicon
- [x] Search by name (client-side) + provider filter
- [x] Empty/loading states, API errors
- [x] Delete with confirm
- [ ] Tags and sort controls (deferred)

Acceptance
- [x] Uploads < limit with progress
- [x] Link resources render with favicon
- [x] Search works (client-side); tag filtering deferred

Notes
- Keep Explore unchanged (final).
- Log issues in CHANGELOG and strike items as done.

## CSS polish backlog (log-and-batch)
- Kanban drag highlights — location: `frontend/src/pages/Project/Project.css` (.kanban-col.drop-target); Title: Drag-over visual; Pending: fine-tune colors/transition.
- Kanban card visuals — location: `Project.css` (.kanban-card); Title: Elevation + hover; Pending: soft shadow, hover elevation, compact spacing.
- Tasks toolbar responsiveness — location: `Project.jsx` toolbar + `Project.css`; Title: Mobile wrap; Pending: stack filters, reduce paddings on <640px.
- Resource list truncation — location: `Project.jsx` Resources list; Title: Ellipsis on titles; Pending: max-width + `text-overflow: ellipsis` for links.
- Modal mobile fit — location: `frontend/src/components/Modal/Modal.jsx` + CSS; Title: Fullscreen on small screens; Pending: media query + scrollable body.
- Toast safe-area — location: `frontend/src/components/Toast/ToastContext.jsx` CSS; Title: Mobile bottom offset; Pending: env(safe-area-inset) padding.
- MemberPicker width — location: `frontend/src/components/Members/MemberPicker.jsx`; Title: Consistent width; Pending: min-width and overflow handling.

We will keep batching these at the end of each feature, instead of pausing feature delivery mid-way.

## Next features (Sprint B draft) — plan and queries

1) Task priority (UI + filters)
	 - Build: add priority controls in list/board, filter by priority, badge on cards.
	 - Backend: already in schema; no API change needed.
	 - Queries:
		 - Priority set: keep low/medium/high or add urgent? (you said “positive” to urgent earlier — confirm add 'urgent' now or in a later pass?)

2) Task labels/tags
	 - Build: labels array on Task, UI chips, filter by label.
	 - Backend: extend schema + include in list/create/update.
	 - Queries:
		 - Limit to 5 labels per task? Allowed chars/colors?

3) Task search
	 - Build: quick search box (client) + optional server search param later.
	 - Queries:
		 - Scope: title+description only, or include comments?

4) AI helper in task modal
	 - Build: optional “Suggest tasks” using existing AI context; insert selected suggestions.
	 - Queries:
		 - Permission: owner/admin only or all members?

5) Resource improvements
	 - Build: show server upload limit and allowed types (read from config); optional tags.
	 - Backend: expose `/api/config` or reuse env via build.
	 - Queries:
		 - Provide final per-file size limit (MB) and allowed mime groups to surface.

6) Project members & invites polish
	 - Build: show roles in picker tooltip, copy invite UX refined.
	 - Queries:
		 - Any new roles beyond owner/admin/member now, or defer?

7) Keyboard shortcuts
	 - Build: N (new task), / (focus search), 1/2/3 (switch lanes) — optional.
	 - Queries:
		 - Enable by default?

Priorities (proposal)
- Immediate: (1) Task priority, (2) Labels, (3) Search.
- Then: (5) Resource config surfacing, (4) AI helper, (6) Members/invites polish, (7) Shortcuts.

## Open Questions (answer inline below each item)

Tasks
- [ ] Statuses: keep enum ['todo','in-progress','done'] for Sprint A? Any rename (e.g., Backlog/In Progress/Review/Done) needed just in UI labels while keeping API values as-is?   

fine 
didnt understood well but sounds good positive 
- [ ] Assignees: backend supports multiple assignees; for Sprint A UI, use single assignee picker or allow multi-select?
- [ ] Priority: keep ['low','medium','high'] or add 'urgent'? positive 
- [ ] Comments: okay to start with a simple per-task comments array (no threads, no edit/delete) and add activity later? thats too deep for me to understand 
- [ ] DnD: lanes map directly to status values; confirm there’s no custom lane requirement in Sprint A. again same 

Resources
- [ ] File size limit for uploads (MB). We can enforce via backend and show a client-side cap. Provide a number.
- [ ] Allowed types: images (png,jpg,svg), pdf, txt, zip? Anything to exclude explicitly? yes a size limit should be there as we will be using free tier cloudinary so user can see text of sixe limit per file 
- [ ] Storage: default local now; okay to add Cloudinary toggle later (env-based) without UI switch in Sprint A? yup perfect local uploads now 
- [ ] Metadata: is title optional (fallback to filename) acceptable for Sprint A? no idea

Membership & Permissions
- [ ] Members can invite if project setting allowInvites=true (owner-controlled at project creation). Confirm.
- [ ] Viewer role: can see Explore + public projects, but must authenticate before “Join”. Private projects require invite. Confirm. ye perfect 

AI Helper
- [ ] Sprint A scope: enable suggest-tasks endpoint usage in the Task modal (optional button) with current project context. Good?  yes perfect 
- [ ] Any wording/UX preference for the helper (e.g., “Ask AI”)? nah simple and related to current view only 

UX Polishing
- [ ] Navbar logo usage confirmed (logo-only in navbar; full wordmark in hero/auth screens). Any size constraints we should lock? nah current navbar is good 
- [ ] Empty states: short friendly copy okay, or keep minimal placeholders for speed? whatever suits

Out of Scope (confirm)
- [ ] Real-time updates (websockets)
- [ ] Advanced roles/permissions beyond owner/member/viewer
- [ ] Resource folders (tags only for now) may be leter 
