<!-- Updated: Added pre-phase workflow polishing section for linear execution before deep enhancements -->

# Pre-Phase 3 – Workflow Completion & Polishing (Demo Prep)

Objective: Finish core end‑to‑end user + viewer workflow (public explore → auth → join/create project → collaborate basics) and polish existing features for an interview‑ready demo. Defer dark mode expansion & discussion room advanced functionality (kept as placeholders only) until after this checklist is DONE.

## Guiding Constraints
- Keep scope tight: no new complex feature domains (no deep discussion features, no theme overhaul).
- Favor reliability, clarity, and empty‑state polish over new breadth.
- Every navigation path should feel intentional (no dead ends, no confusing redirects).

## Linear Execution Checklist (DO IN ORDER)
1. Public Explore & Navbar State (DONE / verify)
   - Unauthed: brand + Sign in + Get started buttons; no notifications/avatar. (DONE)
   - Authed: remove auth buttons; show notifications + avatar menu. (DONE)
   - Logout returns to Explore. (DONE) 
   - Action: quick visual QA & tighten spacing if needed. (PENDING QA)
2. Public Project Join Flow (DONE)
   - Click Join when not authed → store intended project (localStorage: `postLoginRedirect=/project/<id>`) then redirect to login.
   - After successful login/register → if `postLoginRedirect` exists go there & clear key.
   - If already member -> open project directly.
   - If project full / join fails -> show toast + remain on Explore.
3. Auth Guard & Membership Gate (DONE)
   - Visiting `/project/:id` when authed but not a member & project is public → show lightweight Join screen (name, description, Join button) instead of error.
   - If private & not member → redirect to dashboard with toast.
4. Empty States Consistency Pass (DONE)
   - Dashboard: owned projects, tasks, activity (already present; unify tone & punctuation).
   - Profile: newly registered user (avatar placeholder OK).
   - Past Projects: already shows empty; confirm wording.
   - Notifications: show “No notifications yet”.
   - Project panels: Tasks/Resources/etc: ensure spinner → empty message pattern uniform (Spinner already in place).
5. Toast & Error Messaging Standardization (DONE)
   - Replaced remaining alert() with toast (Explore join failure, Dashboard archive failure).
   - Added toasts for project create success/failure, invite generation, invite code join failure, archive success.
   - Permission denial already surfaced on private project access (403) with toast.
   - Introduce `useToast()` for: join failures, archive errors, permission denials.
   - Replace stray `alert()` calls (e.g., join project failure) with toast.
6. Role & Visibility Surfacing (DONE)
   - Show current user role inside avatar dropdown (already partially via project pages; add global hint if inside a project context?).
   - In project header (if not already) display visibility badge consistently.
7. Permission Guard UX (DONE)
   - Attempt restricted action (e.g., archive by non-owner) → toast: “Owner role required”. (Backend already blocks; front-end prevents + message.)
8. Discussion & Theme Deferral Stub (DONE)
   - Hide theme toggle control (DONE) & strip unused code paths later in cleanup step.
   - Discussion advanced features (typing, pin) explicitly deferred; add note in README / docs.
9. Multi‑User Basic Scenario QA Script (DONE – see `docs/qa-multi-user-script.md`)
   - Document quick manual test: User A creates project (public), User B joins, task assignment, notification reception.
10. Light Refactor & Cleanup (DONE)
   - Remove unused components/CSS (old topbar wrappers, legacy loading text, theme toggle remnants).
   - Group services (`auth`, `projects`, `notifications`, `invites`) under an index or maintain as-is but prune dead exports.
   - Ensure file naming consistency (e.g., panels). 
11. Final Consistency Sweep (DONE)
   - Accessibility: focus ring visible on interactive navbar items.
   - FOUC/theme flash: acceptable for now; note improvement deferred.
   - README quick “Demo Walkthrough” section (Explore → Register → Create Project → Invite/Join → Basic tasks).

## Success Criteria (Demo-Ready)
- A new visitor lands on Explore, can register, automatically lands in dashboard, create project, logout, and revisit Explore seamlessly.
- Joining a public project when logged out returns them directly into that project after login.
- All major pages show helpful, consistent empty states (no raw blanks / cryptic errors).
- No JavaScript uncaught errors in console during normal flows.
- No blocking alerts; all user feedback via consistent toast system.

---

# Phase 3 – Enhancement & Depth Plan (Deferred Until Above Checklist Complete)

Goal: Add depth to existing features (notifications realtime, richer permissions UX, task workflow polish) and introduce quality-of-life improvements without large architectural shifts.

## Proposed Pillars
1. Realtime & Feedback
2. Workflow & Productivity
3. Insights & Quality
4. Hardening & DX (developer experience)

## Candidate Tasks (Draft)
1. Notifications Realtime
   - Socket event: push new notifications to client (fallback periodic poll every 60s if socket disabled).
   - Increment unread badge dynamically; mark-all-read broadcasts event.
2. Activity Feed Refinement
   - Collapse consecutive similar events (e.g., multiple task updates).
   - Add filter (All / Tasks / Projects / Invites).
3. Task Enhancements
   - Subtasks (schema: parentTask field) + UI nested list.
   - Quick inline status change from dashboard My Tasks list.
   - Bulk label assignment in Tasks panel.
4. Resource Management
   - Preview modal for images / pdf inline.
   - File size + type badges.
5. Learning Tracker
   - Progress ring: percent done (done / total).
   - Export selected items to markdown.
6. Snippets
   - Copy code button per snippet row (list: already per snippet? verify) + language filter memory (already persisted) + tag suggestions.
7. Solutions
   - Diff highlighting (simple line-by-line comparison for edits) – optional.
8. Discussion
   - Typing indicator (socket ephemeral events).
   - Pin thread ordering (pinned first).
9. Permissions UX
   - Surface role in navbar user menu.
   - Attempt restricted action => toast explaining needed role.
10. Profile / Settings
   - Avatar upload (content-type restrictions, 256x256 resize server-side).
   - Delete account (soft delete flag) – optional / maybe defer.
11. Analytics / Insights
   - Basic metrics endpoint: counts (open tasks, tasks done this week, resources added week, learning items done week).
   - Dashboard mini trend chart (lightweight inline SVG sparkline).
12. Reliability / Hardening
   - Rate limit headers surfaced to client (show friendly error when near limit).
   - Central error boundary on frontend to catch render exceptions.
13. Performance
   - Lazy load heavy project panels (code-splitting with dynamic import for Snippets, Solutions, Discussion).
   - Cache project members & reuse across panels.
14. DX Improvements
   - ESLint + Prettier config introduction.
   - Basic Vitest / Jest test harness for one backend controller & one frontend component.
15. Accessibility Follow-ups
   - Keyboard focus outlines standardized.
   - Skip-to-content link at top.
16. Theming
   - Extend dark mode tokens (elevations, subtle backgrounds) & high-contrast toggle.
17. Documentation
   - Architecture overview diagram.
   - API endpoints index auto-generated (script reading routes directory).

## Prioritization Wave 1 (Recommended Order)
1. Realtime notifications (1)
2. Lazy load heavy panels (13 partial)
3. Subtasks (3 partial)
4. Avatar upload (10 partial)
5. Error boundary + route-level suspense (12, 13 synergy)
6. Role-based UX messaging (9)
7. Analytics counts + dashboard sparkline (11)
8. ESLint/Prettier + minimal tests (14)
9. Accessibility: skip link + focus (15)

## Data Model Additions (Draft)
- Task: parentTask (ObjectId ref Task, index)
- User: avatar (already), maybe role override flags (defer).
- Notification: add type subcategories (optional).

## Events / Frontend Architecture
- Introduce a lightweight event bus module for cross-component updates (already partly using window events). Wrap dispatch/listen helpers.
- Add <ErrorBoundary> around `AppRoutes`.
- Use React.lazy for SnippetsPanel, SolutionsPanel, DiscussionPanel, LearningPanel, SolutionsPanel to cut initial bundle.

## Acceptance Criteria for Phase 3
- Unread badge updates in real time when another actor triggers a new notification (simulated by manual API call if multiple sessions).
- Tasks panel supports at least one level of nesting (create subtask) and displays parent relation.
- App resilient to runtime component error (shows fallback UI instead of blank screen).
- Large feature panels code-split (network waterfall shows deferred chunks).
- Avatar upload functioning with validation + immediate navbar refresh.
- Basic lint script passes (no blocking errors) & at least 2 starter tests green.

## Risks / Notes
- Subtasks can expand complexity (drag & drop). Limit to simple parent pointer + grouped display initially.
- Realtime requires confirming socket stability; fallback poll ensures graceful degradation.
- Avatar processing: ensure size & type validation to avoid large/malicious uploads.

## Next Steps
- Confirm scope cuts (which optional items to defer) when you review.
- Lock Wave 1 list and convert to executable checklist doc.

(End of draft – awaiting approval.)
