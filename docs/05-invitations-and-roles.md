# Project Invitations, Membership, and Roles

Goal
- Allow owners to invite members to a project via invite link or short code. No email provider required for MVP.

Data model
- Project.visibility: 'public' | 'private'
- Project.allowMemberInvites: boolean
- Project.members: [{ user: ObjectId<User>, role: 'owner'|'admin'|'member', joinedAt: Date }]
- Invitation: { project: ObjectId, code: string, token: string, createdBy: ObjectId, expiresAt: Date, usageLimit: number|null, usedCount: number, role: 'member'|'admin', enabled: boolean }

Flows
- Public projects are visible on Explore to viewers; joining still requires authentication.
- Private projects require invite.
- Create invite: owner/admin generates link and/or 6–8 char code. Options: expires in N days, role, usage limit.
- Join: authenticated user submits code or visits link. Backend validates, adds user to project members, increments usedCount.
- Revoke: owner/admin disables an invite.

API (proposed)
- POST /api/projects/:id/invites { expiresInDays, role, usageLimit } → { invite }
- GET /api/projects/:id/invites → { invites }
- POST /api/invites/accept { code } → joins current user
- POST /api/invites/accept/:token → joins current user via opaque token link
- PATCH /api/invites/:inviteId { enabled }

Security
- Token: random 32–48 bytes. Code: short, rate-limited verify endpoint. All write operations require project role >= admin.

Client UX
- In Project Settings: visibility (public/private), allowMemberInvites toggle, default invite expiry. Generate new invite (role, expiry, usage). Copy link/code. Toggle on/off.
- On Explore: show public projects for viewers (not logged in). CTA to Join requires auth.
- On Dashboard: "Join project" action to paste code.

Later
- Optional email delivery for invites; audit trail; org-level roles.
