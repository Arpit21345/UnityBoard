# Changelog

2025-09-06
- Fix: Primary button hover state causing white text on near-white background (added explicit gradient + focus/active states in `utilities.css`).
- Change: Simplified GlobalNavbar (removed search, consolidated controls) per roadmap task 2 (`27-outside-app-roadmap.md`).
- Refactor: Unified primary button styles (`.btn-primary` & `btn primary`) to single gradient implementation (roadmap task 3).
- Cleanup: Removed legacy `Navbar` component & CSS; Home page now uses `GlobalNavbar` (task 4 complete).
- Enhancement: Added fetch wrapper `services/http.js` dispatching auth-expired event on 401 and updated auth APIs + ProtectedRoute to auto-redirect (task 6 partial).
- Docs: Added `permissions-matrix.md` and marked permission verification task partial.
- Feature: Added backend `/api/auth/logout` endpoint (stateless acknowledgment) and completed auth flow task.
- Fix: Project page loading loop prevention & clearer 403/404 messaging with retry (task 7 done).
- Feature: Added Notification model + routes (`/api/notifications`, mark-all-read) and frontend list & mark-all-read action (roadmap task 8 partial).
- Feature: Archive / Unarchive project endpoints plus unarchive action in Past Projects (roadmap task 9 partial).
- Enhancement: Dashboard adds Archive button for owner projects and archive action in All Projects grid (task 9 complete).
- Enhancement: Profile page includes future editable display name placeholder.
- Feature: Outside-app structure scaffolded (`/profile`, `/settings`, `/notifications`, `/logout`) with unified `GlobalNavbar`.
- Change: Simplified `GlobalNavbar` (removed global search & dropdown results UI; deferred reintroduction). Consolidated brand + theme toggle + notifications + profile menu. Updated roadmap (27-outside-app-roadmap.md tasks 1 & 2 marked done).
- Feature: Basic Profile page now fetches `/api/me` and displays user name/email + theme toggle persists.
- Placeholder: Notifications page route stub (no real data yet).

2025-09-07
- Phase 2 Outside App UI Polish (ref `28-outside-app-phase2.md`):
	- Fixed Sidebar links & removed redundant topbar wrapper (layout unification).
	- Navbar polish: removed duplicate brand from top bar, right-aligned theme/notifications/profile, added unread badge dot.
	- Added notifications unread count fetch + event-driven live profile name update (`user-updated`).
	- Implemented PATCH `/api/users/me` backend + `apiUpdateMe` frontend service; inline name editing on Profile & Settings.
	- Introduced reusable `<Spinner />` and replaced textual loading states across outside pages and project panels.
	- Settings page functional: theme toggle + display name edit + notification prefs placeholder.
	- Accessibility improvements: aria-labels for theme toggle, notifications bell, avatar menu, spinner labeling.
	- Documentation: Updated Phase 2 execution plan marking completed tasks; changelog entry added.
	 - Planning: Added Phase 3 draft plan (`29-phase3-planning.md`).

2025-08-11
- Finalized Explore page (hero, alternating sections, features, CTA with image overlay, public projects).
- Monochrome footer and spacing polish; CTA spacing adjusted.
- AI helper mounted globally with route-aware context.
- Added planning docs: 09-features-plan, 10-decisions-needed, 11-sprint-A-plan.
