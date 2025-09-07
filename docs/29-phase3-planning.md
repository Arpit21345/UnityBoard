# Phase 3 – Enhancement & Depth Plan

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
