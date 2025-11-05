# Discussion Room — Group Chat Permissions and Controls

Goal: Group chat scoped to a Project (no private DMs), with clear permissions for Owners/Admins vs Members.

Scope
- One shared Discussion space per project (multi-thread or single-room variant). No private messages.
- Threads act like topics within the project chat. Messages belong to threads.
- Enforce role-based permissions for creation, edits, and moderation.

Roles
- Owner: project creator, full control
- Admin: elevated collaborator (like maintainer)
- Member: regular collaborator
- Non-member: no access

Permissions Matrix
- View threads/messages: Owner, Admin, Member (all project members)
- Create thread: Owner, Admin (members cannot create)
- Edit/delete thread: Owner, Admin; thread owner may edit title/tags; delete limited to owner/admin
- Post message: Owner, Admin, Member (all members can post)
- Delete message: Owner/Admin may moderate (future); author may delete own within grace window (future)
- Manage tags: Owner, Admin (future UI); thread author can set tags upon creation

Data Visibility
- Members see the same threads/messages; no separate owner-only chat
- Owner/Admin management controls (delete thread, pin, lock) visible only to those roles

Backend Guardrails (implemented or planned)
- Auth required for all endpoints
- Membership required for all thread/message routes
- Create thread: require owner/admin (implemented)
- Update/delete thread: owner/admin or thread creator (implemented for update/delete)
- Message post: any member (implemented)
- Future moderation: delete message by owner/admin; soft-delete flag

UI Constraints
- Hide “New Thread” button for non owner/admin users
- Show edit/delete thread actions only for allowed users
- Messages composer visible to all members; disable if not logged in or not a member
- Optional: banner stating “This is a project-wide group chat. No private messages.”

Audit/Moderation (future)
- Track createdBy for thread/message; timestamps
- Add soft deletion with reason and moderator id
- Rate limit for messages

Next Steps
1) Enforce UI gating in DiscussionPanel for New/Edit/Delete thread actions
2) Add optional pin/lock controls for owner/admin (backend + UI)
3) Add moderation API to delete messages (owner/admin) and soft-delete model field
4) Single-room mode toggle: when enabled, threads list collapses to a single default "General" thread per project (auto-created). Socket events used:
	- join { projectId }
	- message:new { threadId, item }
	- message:deleted { threadId, item }
	- thread:update { _id, pinned, locked, title, tags }
	- thread:deleted { _id }
