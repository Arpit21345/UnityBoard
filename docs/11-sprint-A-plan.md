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
