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
- Admin: Read settings; cannot change roles; can toggle non-destructive settings if we allow (default: cannot). See decision below.
- Member: Read-only basic info inside the project UI; no access to settings page content.

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

## Implementation Decisions to Confirm

- Settings access scope
  - Current UI: Owner-only settings. Admin sees “Oops, wrong door”.
  - Proposal: Keep owner-only for now; later allow specific non-destructive settings to admins.
- Invites policy
  - Backend: create allowed for owner/admin or member when allowMemberInvites=true; list/toggle for owner/admin only.
  - Frontend: Gate full invites section to owner. Proposal: align frontend with backend nuanced rules (members can generate only when allowed) in a follow-up.
- Tasks delete policy
  - Current: any member can delete. Proposal: keep for collaboration simplicity; revisit if abuse observed.

## Acceptance Criteria (what we’ll enforce in code)

- Anonymous can view Explore public list only; cannot access project content.
- After login, Dashboard shows your projects with owner name and your role.
- Owner-only: settings page content, member role changes, member removal, project deletion.
- Admin: can moderate discussion. (Optional future: limited settings/invite access.)
- Member: can collaborate (tasks/resources/snippets/solutions/learning) but cannot manage members or delete project.
- Invites follow policy above (including allowMemberInvites for members to create).
- Logout reliably prevents navigating back into protected pages without fresh login.

## Next Steps After Approval

- Align backend route guards to this spec (fine-tune invites/list/toggle rights; ensure owner-only destructive ops).
- Align frontend gating (Settings sections by role; show owner name in dashboard list; optional invite button for members when allowed).
- Harden auth flow: global 401 handling → force logout; cache-control tweaks; history handling on logout.
- Add “Leave project” (member/admin) endpoint and UI for users who want to exit a project.
