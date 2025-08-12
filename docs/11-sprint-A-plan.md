# Sprint A — Core Collaboration (1 week)

Scope
- Shared: Member picker, Toast/Notices
- Tasks v1: List + Kanban + DnD + comments
- Resources v1: file/link + previews + search

Shared
- [ ] Toast system (success/error/info)
- [ ] Member picker (search project members; keyboard nav)

Tasks v1
Backend
- [ ] Task schema: assignee, status, priority, labels, dueDate
- [ ] Endpoints: list/filter, create, update, move, comment add/list

Frontend
- [ ] List view (filters: status, assignee)
- [ ] Kanban lanes (Backlog, In Progress, Review, Done) with DnD
- [ ] Task modal: create/edit, “Assign to me”
- [ ] Comments tab (basic activity)
- [ ] Empty/loading states; API error toasts

Acceptance
- [ ] Drag updates status server-side
- [ ] Filters by assignee/status work
- [ ] Comments render chronologically

Resources v1
Backend
- [ ] Resource schema: type(file/link), url/path, tags, uploader
- [ ] Upload route (size/type checks), list/search, delete

Frontend
- [ ] Add resource (file/link), progress
- [ ] Preview (image/pdf), link favicon
- [ ] Search by name/tag, sort by recent
- [ ] Empty/loading states, API errors

Acceptance
- [ ] Uploads < limit with progress
- [ ] Link resources render with favicon
- [ ] Search and tag filtering work

Notes
- Keep Explore unchanged (final).
- Log issues in CHANGELOG and strike items as done.

## Open Questions (answer inline below each item)

Tasks
- [ ] Statuses: keep enum ['todo','in-progress','done'] for Sprint A? Any rename (e.g., Backlog/In Progress/Review/Done) needed just in UI labels while keeping API values as-is?
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
