# Changelog

## [Unreleased]
- QA matrix & additional join error specificity (already member / archived) – pending.
- Removal of legacy apiMe fallback in navbar after extended verification.

## 2025-09-07 Auth/Nav/Project Polishing Batch
### Added
- UserContext provider with global user state & retry logic.
- Theme toggle (light/dark) restored with persistence via localStorage.
- `projects-changed` event system (create/join/archive/leave/delete) + Dashboard listener.
- `.mini-btn` styling for consistent hover/contrast in light & dark modes.
- Loading/disabled join button states (Explore + Project pages).
- Join error categorization utility for clearer member/archived/private/session feedback.

### Changed
- GlobalNavbar now displays brand logo image + spaced auth actions.
- Dashboard navigation & project settings (leave/delete) moved to SPA navigation (`useNavigate`).
- Improved join user feedback (already member detection & redirect, better generic errors).
- Explore and Project join flows dispatch events to update other open tabs.

### Fixed
- Navbar incorrectly showing Sign in while authenticated (state sync via context & retry).
- Missing dark mode toggle & button hover invisibility on small action buttons.
- Dashboard not auto-refreshing after external project joins.

### Deferred / Pending
- Unarchive event dispatch (feature path not yet present in current UI slice).
- Full replacement of all `window.location.href` in auth flows (kept for hard boundary on login/register).
- Detailed join error taxonomy beyond provided backend `error` message.
