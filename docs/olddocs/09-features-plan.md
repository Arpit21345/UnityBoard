# UnityBoard — Feature Plan and Status

Last updated: 2025-08-11

Snapshot
- Base UI: tokens/reset/utilities, public Navbar, private AppLayout (Sidebar + GlobalNavbar unified).
- Explore page: FINAL (hero, alternating sections, feature cards, benefits, dark/light, CTA with image overlay, public projects, monochrome footer).
- AI helper: globally mounted, route-aware context; visible on all pages.
- Backend: assets at /api/assets; projects public list/join; invites; AI /api/ai/qna fixed.

Completed
- Frontend
  - Scoped page CSS; Explore finalized; Footer updated to monochrome; CTA restored with image + spacing.
  - Project layout: Dashboard, Tasks, Resources, Settings (tabs).
  - AI FAB global + auto-close on route change.
- Backend/AI
  - Cohere API request shape fixed; errors logged; health route present.

In Progress / Polish
- Small copy/visual polish on Explore task block (checklist style).

Next Sprints

Sprint A (Core collaboration) — target: 1 week
- Tasks v1: List + Kanban (Backlog, In Progress, Review, Done), fields (title, desc, assignee, due date, priority, labels), DnD, “Assign to me”, basic comments.
- Resources v1: file/link, tags, previews (image/pdf), search/sort, upload progress + limits.
- Shared: Member picker, toast/notice system.

Sprint B (Knowledge + comms + AI) — target: 1 week
- Discussion v1: threads, posts, @mentions (autocomplete), reactions, pin.
- Learning Tracker v1: journal + milestones, tags, export to markdown.
- Smart Snippets v1: code with syntax highlight, tags, comments.
- AI quick actions: Summarize project, Suggest tasks; /api/ai/health surfaced in UI.

Non‑functional targets
- Consistent API error toasts; empty/loading states.
- Role enforcement (owner/member).
- Pagination/limits for lists.
- Keep Explore bundle light; code-split heavy routes.

Workflow
- You fill docs/10-decisions-needed.md.
- We execute docs/11-sprint-A-plan.md and track progress there.
- Updates recorded in docs/CHANGELOG.md.

Links
- Decisions: 10-decisions-needed.md
- Sprint A plan: 11-sprint-A-plan.md
- Changelog: CHANGELOG.md
