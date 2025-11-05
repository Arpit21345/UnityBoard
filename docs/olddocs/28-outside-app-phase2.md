# Outside App Area – Phase 2 Execution Plan

Goal: Make all outside sections (Profile, Past Projects, Notifications, Settings, Logout) visually consistent, fully navigable, and implement minimal functional improvements (archive actions, notifications list, auth/logout already done) plus layout polish.

## Problems Observed
1. Sidebar links incorrect (all pointed to /dashboard previously).
2. Double top bar wrapper causing spacing inconsistencies.
3. GlobalNavbar brand centered visually due to extra wrapper; desire: brand left in sidebar only OR small brand left, action buttons right.
4. Need consistent blank-state & loading components.
5. Missing user update capability (display name).
6. Settings page not functional (pure placeholder).
7. Notification bell lacks unread indicator.

## Task List (Linear)
1. Sidebar Fix – DONE
   - NavLink targets corrected.
2. Layout Unification – DONE
   - Removed redundant wrapper in `AppLayout`.
3. Navbar Polish – DONE (brand removed; right cluster; unread badge dot placeholder pulling count on load)
4. Loading / Blank Components – DONE
   - `<Spinner />` replaces textual loading indicators across outside & project panels.
5. User Profile Update (Minimal) – DONE
   - Backend PATCH `/api/users/me` implemented.
   - Inline editing working (Profile + Settings). Navbar updates live via `user-updated` event.
6. Settings Page Minimal Functionality – DONE
   - Theme toggle + name edit + placeholder notifications section.
7. Consistent Page Headings & Spacing – DONE (standard container padding + h2 margin-top:0 maintained)
8. Accessibility / Semantics Quick Pass – DONE (icon buttons labeled, spinner aria-label, user menu button labeled)
9. Final Verification – DONE (route deep links, auth expiry, archive/unarchive, name update propagation validated manually)
10. Documentation & Changelog Update – DONE

## Optional (Defer if time) 
- Keyboard shortcut for quick nav (later).
- Notification real-time socket integration.

## Acceptance Criteria (All Met)
- Single, consistent layout across all outside pages; no layout shift between dashboard and profile/settings.
- Sidebar navigation correct & active states accurate.
- No extraneous brand duplication (brand appears only once in persistent chrome).
- Editable profile name persists across reload.
- Settings page offers at least theme toggle + profile name edit.
- Unread notifications show a visual indicator.
- All pages show spinner instead of plain 'Loading…' text.

## Sequence Dependencies
Profile name edit requires backend user update route before frontend UI.
Unread badge requires notifications list fetch (already implemented) plus count logic.

---
All tasks completed. See changelog entry dated 2025-09-07 referencing this file `28-outside-app-phase2.md`.
