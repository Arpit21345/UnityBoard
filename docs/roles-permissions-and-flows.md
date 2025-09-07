# UnityBoard Roles, Permissions, and User Flows

This document defines the roles, data relationships, and end-to-end user flows. It’s the source of truth we’ll implement in backend middleware and frontend route guards. Review and confirm; then we’ll align code to this spec and close security gaps.

## Roles

- Anonymous (Viewer)
  - Not logged in. Can view public marketing pages and Explore (public projects list only).
- Authenticated User
  - Logged in account. Can create projects, join others’ projects (via invite or public join), and see own/joined projects in dashboard.
- Project Member (role: member)
  - A user in a project with standard collaboration rights.
- Project Admin (role: admin)
  - Elevated member. Can moderate discussions and manage operational settings (see matrix). Cannot delete project or manage owners.
- Project Owner (role: owner)
  - The creator/primary owner. Full control, including destructive actions and member role management.

Notes
- Exactly one owner per project (recommended). We’ll enforce “cannot demote/remove owner via UI/API”.
- Owner can promote/demote admins and remove members.

## Key Entities & Relationships

- User
- Project
  - fields: name, description, visibility [public|private], allowMemberInvites [bool], status [active|archived], chatSingleRoom [bool]
  - members: array of { user: UserId, role: 'owner'|'admin'|'member' }
- Invitation
  - fields: project, code, token, role [member|admin], enabled, usedCount, usageLimit, expiresAt
- Task
  - fields: project, title, description, priority, dueDate, assignees: UserId[], labels: string[]
- Resource, Snippet, Solution, Thread, Message, Learning
  - each references project

Relationships
- User 1..* Project via members (Membership embeds role)
- Project 1..* Task|Resource|Snippet|Solution|Thread|Learning
- Project 1..* Invitation

## Permissions Matrix (by area)

Project visibility & access
- Anonymous: Can view Explore (list of public projects). Cannot open project details.
- Authenticated non-member: Can join public projects (Join) or accept invites.
- Member/Admin/Owner: Can view the project and all its content.

Project settings
- Owner: Can edit name, description, visibility, allowMemberInvites; can change member roles (member<->admin), remove members, delete project.
- Admin: Read-only view (cannot edit fields, cannot change roles, cannot delete project).
- Member: No access to settings panel (only core project content). If allowMemberInvites=true they may still generate an invite via a lightweight prompt.
  - Members/Admins can initiate "Leave Project" (owner cannot leave without ownership transfer - not yet implemented).

Invites
- Owner: Create invites; list invites; enable/disable invites.
- Admin: Can create/list/toggle invites if Owner delegates (optional). Default: allow create/list/toggle for admin.
- Member: If allowMemberInvites=true, can create invite codes/links (member role only). Cannot list or toggle existing invites.

Members
- Owner: Promote/demote admin; remove members; cannot remove/demote owner (blocked).
- Admin: No role change rights; may remove spam/non-members? Default: cannot remove members.
- Member: No rights to manage members.

Tasks
- Member/Admin/Owner: Create, edit, assign, and delete tasks. Assignees can be any project member.
- Optional stricter mode (future): Only creator/admin/owner can delete; keep for later.

Discussion (Threads/Messages)
- Member/Admin/Owner: Create threads/messages.
- Admin/Owner: Pin/lock threads; delete any message/thread; moderate.
- Member: Edit/delete own messages; cannot moderate others.

Snippets, Solutions, Resources, Learning
- Member/Admin/Owner: Create, edit, delete their content. (Current backend allows any member; moderation by admins/owner.)

Project deletion
- Owner only. Cascades delete of project data (tasks/resources/snippets/solutions/threads/messages/learning/invites).

## User Flows

Explore (Anonymous)
- Visit / → Explore marketing page.
- Browse public projects list (name, description, owner name shown). Opening a project requires auth & membership → redirect to login.

Registration → Login
- Register new account → redirect to login → login → land at Dashboard (/dashboard).
- Session: store JWT in localStorage (and in-memory). Protected routes check token. Logout clears token and redirects to /login.

Dashboard (Authenticated)
- Lists projects where user is a member (created or joined).
- Each item shows: Project name, your role (owner/admin/member), visibility, owner name.
- Actions: Open project. Create Project button.

Create Project (Owner)
- Provide name, description, visibility, allowMemberInvites.
- After create, you are owner and the project appears in Dashboard.

Manage Members (Owner)
- Settings → Members section.
- View list with avatar/name/email/role.
- Change role (member/admin) for non-owners.
- Remove member (non-owner only).
- Generate invite (owner; optionally admin/member based on allowMemberInvites policy).

Join a Project
- Public project: Open project page → Join (becomes member). Appears in Dashboard with owner name and your role.
- Invite: Use code or link; upon accept, you become member/admin (per invite role). Appears in Dashboard.

Tasks
- Any member creates tasks; assign to member(s); edit/delete. Comments allowed.

Discussion
- Members participate; admins/owner moderate (pin/lock/delete threads, delete messages).

Snippets, Solutions, Resources, Learning
- Any member can contribute; admins/owner can moderate.

## Security & Session Handling (high-level)

- JWT stored in localStorage; auth middleware on backend protects /api/*.
- Frontend ProtectedRoute checks token presence and 401 responses to redirect to /login.
- Logout clears token and sensitive caches; redirect to /login.
- Prevent back/forward from exposing authenticated views after logout:
  - Use a global auth state check on route mount; if no token, redirect.
  - Optionally set Cache-Control: no-store on auth-sensitive responses (server) and use history.replaceState on logout to avoid cached pages.
- Token expiry: on 401 from API, auto-logout and redirect.

## Implementation Decisions (current state)

- Settings access scope
  - Implemented: Owner edit; Admin read-only; Members blocked.
- Invites policy
  - Backend: create = owner/admin OR member when allowMemberInvites=true; list & toggle = owner/admin.
  - Frontend: generate button respects same logic; list & toggle only for owner/admin.
- Tasks delete policy
  - Any member can delete (kept for now; revisit if abuse observed).

## Acceptance Criteria (what we’ll enforce in code)

- Anonymous can view Explore public list only; cannot access project content.
- After login, Dashboard shows your projects with owner name and your role.
- Owner-only: settings page content, member role changes, member removal, project deletion.
- Admin: can moderate discussion (moderation endpoints/UI still pending).
  - Thread creation currently restricted to owner/admin (members post messages only). Planned: allow members to create threads unless in single-room mode (future tweak).
- Member: can collaborate (tasks/resources/snippets/solutions/learning) but cannot manage members or delete project.
- Invites follow policy above (including allowMemberInvites for members to create).
- Logout reliably prevents navigating back into protected pages without fresh login.

## Next Steps After Approval

- DONE: Backend owner-only settings edit.
- DONE: Frontend gating (admin read-only, member blocked, invite generation aligned).
- DONE: Leave project endpoint & UI (non-owner roles).
- DONE: Global search (projects, tasks, members) basic endpoint + navbar dropdown.
- PENDING: Discussion moderation endpoints & UI; enhanced dashboard owner name display (if missing); lightweight invite UI for members outside settings panel.
  - PENDING UPDATED: Notifications system; activity feed; archive/owner transfer flows.

---

## Home Dashboard UX Spec (Outside Project Section)

Goals
- Quick snapshot: active vs archived projects, my open tasks, due soon.
- Fast actions: create project, join by code.
- Resume work: recent tasks assigned to me, recent activity.
- Visibility: pending invites, role badges, visibility indicators.

Layout (Desktop)
- Greeting + primary buttons (New Project, Join by Code) top.
- KPI Row: Active Projects | Archived | My Open Tasks | Tasks Due Soon.
- Main Split:
  - Left 60%: Active Projects grid (cards), Recent Activity feed (placeholder initially).
  - Right 40%: Pending Invites, My Tasks (top 5), Tips/onboarding, Quick Create (collapsible after first project).

Mobile Order
KPI Row → Actions → Pending Invites → My Tasks → Projects → Activity → Tips.

Project Card (Phase 1 minimal)
- Name, role badge, visibility tag, open link.
- Future: last activity, open tasks count, menu (Settings / Leave / Archive).

Phases
- Phase 1: Replace list with cards; modal create; join code at top; basic KPIs (Active count, placeholder others); My Tasks minimal (aggregate fetch naive); Leave/Settings quick actions link.
- Phase 2: Recent Activity placeholder + improved KPIs (my open tasks count, due soon); refine tasks fetch (batched endpoint TBD).
- Phase 3: Activity feed real data, archive project action, owner transfer flow, performance optimizations.

Data/Endpoints Needed (Future)
- Aggregated my open tasks count & due soon (optimization).
- Activity feed endpoint (tasks, threads, invites events) batching.
- Archive project (owner only) & unarchive.
- Ownership transfer mutation.

Implementation Notes
- Start with existing endpoints; avoid N+1 by limiting per-project task fetch (top N tasks assigned to me fetched lazily on card expand if scaling needed).
- Defer activity feed until endpoint exists; placeholder component with doc link.

Documentation Process
1. Reference this section before edits.
2. Update this spec after each phase (mark DONE items, add new PENDING).
3. Keep all Home Dashboard related notes inside this section for single-source clarity.

Status Tracking (Dashboard)
- Phase 1: IN PROGRESS (project cards, owned/all sections, search filter, modal create implemented).
  - Added inline owned-project invite generation (owner/admin/member-if-policy) quick action.
  - Added dashboard overview API (projects, myTasks, dueSoon) + My Tasks section & KPIs.
- Phase 2: BLOCKED (await phase 1 completion).
- Phase 3: BLOCKED.
  - PENDING UPDATED: Replace member thread creation restriction (decide policy); improve notifications system; global search wiring; owner transfer process.
- Harden auth flow: global 401 handling → force logout; cache-control tweaks; history handling on logout.
- Add “Leave project” (member/admin) endpoint and UI for users who want to exit a project.

### Activity Feed (NEW)
Lightweight event stream aggregated from all projects user is a member of.

Implemented Event Types (Phase 1):
- project.created
- project.member.joined
- project.member.left
- project.member.removed
- project.deleted
- task.created
- task.updated.status
- task.updated.priority
- task.deleted
- task.commented
- invite.created

Endpoint: `GET /api/dashboard/activity?limit=40`
- Auth required; filters by membership.
- Response: `{ ok, items: [ { project, type, actor, message, createdAt, refType, refId, meta } ] }`.
- No pagination yet (future: cursor/before param).

Security: Membership check only. Messages generic (no sensitive payload). meta kept small.

Planned Enhancements:
- Pagination & infinite scroll.
- Populate actor basic fields (name/avatar) server-side.
- WebSocket push (subscribe per project room).
- User preferences to mute specific event types per project.
- Additional events: snippet/solution/resource/learning create/update, thread/message events.
