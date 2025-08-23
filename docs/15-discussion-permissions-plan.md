# Discussion Room — Group Chat Permissions and Controls

Goal: Group chat scoped to a Project (no private DMs), with clear permissions for Owners/Admins vs Members.

Decision (Aug 23, 2025)
- Pause all Discussion work until after Sept 1 (credit renewal).
- Re-scope to a simple, real-time group chat per project (Discord/WhatsApp style):
	- One socket-backed room per project (no threads, no tags initially).
	- Messages are broadcast to room members; basic history persisted.
	- Owner/Admin minimal moderation (e.g., delete message) only if needed.
- No coupling with other modules. Keep it isolated and simple.

Current status
- A basic HTTP-based threaded discussion exists with moderation (pin/lock) and soft-delete.
- Single-room UI mode is available, but full real-time is not implemented.
- Work is PAUSED; do not add more features until Sept 1.

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
- Moderation: owner/admin can pin/unpin and lock/unlock threads (implemented)
- Soft-delete messages by author or owner/admin; placeholder text served on fetch (implemented)

UI Constraints
- Hide “New Thread” button for non owner/admin users
- Show edit/delete thread actions only for allowed users
- Messages composer visible to all members; disable if not logged in or not a member
- Optional: banner stating “This is a project-wide group chat. No private messages.”

Audit/Moderation (future)
- Track createdBy for thread/message; timestamps
- Add soft deletion with reason and moderator id
- Rate limit for messages

Deferred plan (post–Sept 1)
1) Replace HTTP polling with sockets
	- Tech: Socket.io on server and client; one namespace/room per project ID
	- Events: join/leave, message:new, message:delete (moderation), typing (optional)
	- Persistence: Mongo collection for messages (projectId, userId, text, createdAt)
2) Minimal UI
	- Single pane chat (no threads). Input + scrollback + autoscroll
	- Show member name and timestamp; own-message delete (optional)
3) Permissions
	- Join room: project members only; non-members blocked at server
	- Moderation: owner/admin can delete messages (optional first pass)
4) Delivery checklist
	- Smoke test with 2 browsers; message fan-out; permission guards
	- Basic rate limiting/flood control; pagination for history

Backlog (nice-to-have, not in first socket cut)
- Audit trail UI (reasons, moderator id)
- Pin/lock equivalents (may be overkill for single-room)
- Reactions/uploads
