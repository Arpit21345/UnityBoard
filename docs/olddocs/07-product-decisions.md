# UnityBoard – Product Decisions (from user responses)

Brand & Assets
- Navbar shows logo icon + text; auth/home views may show larger combined logo.
i have given the logo that containonly logo and mainlogo which contains logo and text 
- Keep CSS per component/page for easy tweaking. yes i mean file wise css properly to track udate easily 

Project Visibility & Access
- Projects can be Public or Private (set at creation by owner in a single settings area).
- Public projects: visible on Explore without login; users must authenticate to join.
- Private projects: join via invite code or link only. yes the also need user to have progile on plateform in that way the will manage there skills and all na 

Roles
- owner, admin, member, viewer.
  - viewer: unauthenticated visitor can browse public projects on Explore; must log in to join.
  - admin: management views for user/activity planned later (defer until after core features).

Invitations & Membership
- Default invite: multi-use with expiry (7 days acceptable).
- Owners can enable/disable “members can invite” in project settings.
- Joining: code or link; enforce auth at join time.

Tasks & Workflow
- Keep Todo/In-Progress/Done for MVP; custom columns later if needed.
- Include assignee and due date in a simple form; avoid complexity.
- Global AI helper should assist within tasks/projects without context switching.

Resources
- Enforce a conservative upload size per file (proposed: 10 MB) to avoid Cloudinary overuse later; allow common doc/image/pdf types. Tags/folders are OK later.

AI Helper (Cohere)
- Global assistant available across the app.
- Can answer Q&A and should leverage current project context (tasks, resources) when available.
- No extra compliance constraints called out.

Other Modules
- Learning tracker: store links + completion status.
- Smart snippets / Solution DB: shared notes/code/text; users can copy into their projects; AI can explain.
- Discussion/meeting room: start with simple threads; real-time chat later if needed.

Deployment
- Likely: Vercel (frontend) and Render (backend) when ready.

Next Implementation Targets (MVP scope)
- Project Settings model/route: visibility (public/private), allowMemberInvites, default invite expiry.
- Invitations: create/list/revoke invites; accept by code/link.
- Explore enhancements: list public projects, join flow gated by login.
- Tasks UI: assignee + due date (optional); keep status dropdown.
- AI helper: add per-page context (project title, tasks, resources) into prompts when available.

Pending confirmations
- File size cap per upload (default 10 MB) and allowed mime types list.
- Default invite expiry (7 vs. 14 days) and usage cap.
- Any admin dashboard fields required in the near term.

---
This doc summarizes decisions captured from the user’s latest answers and will guide the next implementation steps.
all andewrs yes go ahead 