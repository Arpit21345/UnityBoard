# Outside App (Non-Project) Area Roadmap

Scope: Global experience outside an individual project. Sections: Home Dashboard, Profile, Past Projects, Settings (user-level), Notifications, Logout.

## Linear Execution Plan
1. Scaffold structure (folders, placeholder pages, routes unified under GlobalNavbar) ✅ (IN PROGRESS after commit)
2. Navbar consolidation
   - Remove legacy `Navbar`.
   - Remove search bar (will reintroduce later optionally via shortcut).
   - Single brand left, then theme toggle, notifications, profile menu.
3. Primary button style unification (purple) across app.
4. File organization cleanup (group outside pages; delete unused Topbar/legacy navbar, update imports; doc + changelog entries).
5. Permissions sanity check
   - Non-member cannot access /project/:id internals (already guarded by ProtectedRoute + server membership checks).
   - Owner/Admin/Member scoping validated (document quick matrix link to main roles file).
6. Auth flows stability
   - /login, /register, /logout (new dedicated route), profile avatar always loads /api/me on refresh.
   - Add graceful handling of token expiry (401 → auto logout redirect).
7. Fix Project loading loop (instrument Project page; ensure membership + data requests settle; show error fallback).
8. Theme & Notifications
   - Keep theme toggle persistent (done).
   - Add `/notifications` placeholder page (no alert popups; simple list stub).
9. Past Projects: refine filter; add archive/unarchive future actions placeholder.
10. Profile page: display user info + future editable fields (name, avatar placeholder).

## Current Tasks & Status
| Task | Description | Status |
|------|-------------|--------|
| 1 | Structure scaffolding | Done |
| 2 | Navbar cleanup & unify | Done (search removed, consolidated controls) |
| 3 | Primary button consistency | Done (unified gradient across .btn-primary & .btn primary) |
| 4 | File organization cleanup | Done (legacy Navbar removed, Home uses GlobalNavbar) |
| 5 | Permission verification pass | Done (matrix doc + review) |
| 6 | Auth flow + logout route | Done (logout endpoint, auto 401 handling, ProtectedRoute event) |
| 7 | Project loading issue fix | Done (guard against loops, clearer 403/404, retry) |
| 8 | Notifications page | Basic list + mark-all-read (placeholder backend) |
| 9 | Past Projects enhancements | Done (archive/unarchive endpoints + UI actions) |
| 10 | Profile content | Done (data + future editable name field placeholder) |

## Button Hover Bug (Tracking)
Issue: “+ New Project” button text disappearing on hover (white on very light background). Root cause: generic `.btn:hover` rule overriding intended primary styling; `.btn primary` uses a second class not covered by `.btn-primary` rule.
Fix Strategy: Add explicit `.btn.primary` + `.btn.primary:hover` rule in highest precedence stylesheet (global-buttons.css) ensuring gradient background + white text.

## Acceptance Criteria (Initial Outside Area Pass)
- One global navbar everywhere (inside + outside project) without duplicate brands or search bar (search deferred).
- All primary action buttons share consistent purple style & accessible contrast (WCAG AA for text).
- Visiting /profile, /past-projects, /notifications, /settings yields a page (even placeholder) with no 404.
- Logout always clears token & redirects to /login (or landing) and back button does not re-enter private pages.
- Project page no longer stuck in infinite loading; shows spinner then content or error message.

## Risks / Follow-ups
- Notifications & Settings will expand; keep simple now to avoid refactor churn.
- Search removal might reduce discoverability short term; plan keyboard-driven quick search later.
- Need test covering unauthorized project access attempt.

## Next After This Pass
1. Activity feed polish (actor names, click-through).
2. Pending invites panel on dashboard.
3. Archive/unarchive workflow.
4. Owner transfer flow.
5. Real-time notifications integration.

## Changelog Hook
Upon completing each numbered task, append an entry to `CHANGELOG.md` referencing this roadmap file for traceability.
