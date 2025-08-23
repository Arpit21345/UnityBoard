# Access Controls, AuthZ, and Page Gating Audit (Pre–Sept 1)

Purpose
- Ensure all existing features have correct access control before resuming Discussion work.
- Find and fix logical conflicts between controls and login/access across pages.

Scope (pages/modules)
- Project routing, join flow, and membership checks
- Tasks (CRUD, bulk updates, labels, comments)
- Resources (uploads/links, delete)
- Learning, Snippets, Solutions (CRUD)
- Dashboard KPIs (read-only)
- Settings (owner/admin only toggles like single-room)
- Assets static serving (/api/assets)

Checklist (server-side guards)
- [ ] All project-scoped routes require auth (JWT) and membership
- [ ] Owner/Admin-only routes (project update/settings, thread create/delete) enforce role
- [ ] Task updates validate membership and allowed fields
- [ ] Resource delete restricted to owner/admin or uploader (if policy allows)
- [ ] Learning/Snippets/Solutions CRUD limited to members
- [ ] Dashboard stats require membership
- [ ] Rate limiting configured for chat-like or comment endpoints

Checklist (client-side gating)
- [ ] Hide privileged UI for non-privileged users
- [ ] Prevent actions when not a member; show friendly error
- [ ] Router guards: no access to project pages if not member (or redirect to join)
- [ ] Settings panel visible only to owner/admin; toggles disabled otherwise
- [ ] Discussion tab: currently paused; ensure it doesn’t error if backend endpoints are unchanged

Action items
- [ ] Quick pass: audit all routes for `requireAuth + requireProjectMember` middleware
- [ ] Frontend: verify `amPrivileged` derivation and usage across panels
- [ ] Add missing 403 handling with toasts for any silent failures
- [ ] Add minimal tests or a script to hit critical endpoints with/without auth

Notes
- After Sept 1, implement socket-based single-room chat. Until then, avoid expanding Discussion.
