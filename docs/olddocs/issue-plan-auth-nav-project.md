# Auth / Navbar / Project Access Issue Map

Status: DRAFT (to iterate after verification)

## 1. Reported Symptoms (User Observations)
1. Hovering a button makes it become "invisible" (likely text or background contrast issue).
2. Navbar shows "Sign in" even though user is already authenticated (incorrect auth state reflection or conditional render race).
3. Unable to open / enter project from user dashboard (project cards not navigating or blocked).
4. Another account joined a public project but it does not appear in dashboard list (projects list stale / not refreshed after join elsewhere).
5. Day/Night (theme) toggle missing and spacing collapsed: brand + auth links stuck together.
6. Brand logo image missing (was present previously) now only text or spacing issue.
7. "Sign in" and "Get started" stuck together (lack of margin / custom classes removed).
8. Attempt to join public project (project2) from its page did not work (join button maybe disabled or API error not surfaced).

## 2. Suspected Root Causes (Grouped)
A. Auth & User State Sync
- GlobalNavbar performs `apiMe()` once on mount; if token becomes present shortly after mount (e.g., redirect after login) the navbar won't refetch automatically.
- No global user context provider; separate components call `apiMe` independently leading to duplication and potential inconsistent states.
- `ProtectedRoute` only checks localStorage for token; if token missing at first render then added later (edge case) it won't re-render to re-validate until navigation.

B. Project Join / Dashboard Refresh
- After joining a public project from Explore or Project page, redirect goes directly to `/project/:id` (works) but Dashboard's initial list is loaded only once on mount; if user had dashboard open in another tab it won't auto-refresh.
- Failed join on Project page may be due to missing token or 401 causing ProtectedRoute redirect before join POST fires (timing) OR styling overlay making button appear disabled (contrast issue).
- `Project.jsx` handles public non-member view but only after successfully fetching project + me. If `apiMe` fails (expired token) ProtectedRoute wouldn't allow route anyway. Join failure might be server side error not shown because generic toast 'Join failed'. Need better error message instrumentation.

C. Navbar Visual / Spacing Issues
- Removed older Topbar & theme toggle; new `.global-navbar` has no specific styles for `.brand` (text) vs prior brand cluster with logo image.
- CSS classes for auth links (`nav-auth-link`, `nav-auth-btn`) are not defined in any stylesheet (grep returned 0). So they just inherit default link styling, causing them to sit flush.
- Button 'invisible on hover' likely due to `.icon-btn:hover{background:var(--gray-100)}` when inside dark theme? Not set? Or missing gradient classes for `.btn btn-primary` vs `.btn-primary` mismatch.
- If theme dataset attribute temporarily removed earlier any dark selectors would not apply, possibly causing contrast issues with white text on white background (leading to "invisible").

D. Brand Logo Missing
- New GlobalNavbar uses `<Link class="brand">UnityBoard</Link>` (text only) vs old Navbar / Footer which load `/api/assets/logo.png`.
- Asset exists (`backend/src/assets/logo.png`). Not used in GlobalNavbar. Need to restore `<img>`.

E. Theme Toggle Removed
- Intentionally deferred; but missing toggle plus dataset attr previously removed led to dark mode unreachable and possibly CSS side effects. Re-added dataset attr, but toggle still absent (reported).

F. Sign In When Signed In
- Condition `!me` relies on `apiMe` promise; race conditions after login redirect could briefly show Sign in / Get started until `apiMe` resolves. If `apiMe` fails (e.g. network glitch) it will remain. No retry or event-driven update after login success besides a manual dispatch (not implemented). Missing global user event on login.

## 3. Interdependency Mapping
| Problem | Primary Module | Secondary Modules | Dependencies / Data Flow | Why Interconnected |
|---------|----------------|-------------------|---------------------------|--------------------|
| Navbar shows Sign in though logged in | GlobalNavbar (apiMe) | auth.js, http.js | localStorage token -> apiMe -> state `me` | Single-shot fetch, no listener for login success event |
| Join button invisible / styling odd | global-buttons.css / global.css | GlobalNavbar / Project.jsx | Theme dataset + button classes | Style tokens rely on `.btn-primary` gradient; mismatch or missing class leads to white-on-white |
| Can't open project from dashboard | Dashboard.jsx (navigation via window.location) | ProtectedRoute, Project.jsx | localStorage token, router navigation | If ProtectedRoute thinks invalid -> redirect; or project fetch failing silently |
| Joined project not in dashboard | Dashboard.jsx (initial load only) | invites.js join flows | After join, dashboard not re-fetched | Lacks event or polling to sync projects |
| Brand logo missing | GlobalNavbar.jsx | assets folder | Need <img src> referencing asset | Replaced old component lost logo |
| Theme toggle gone | GlobalNavbar.jsx | global.css | Removed UI, dataset attr remained | Loss of toggle reduces dark mode access |
| Auth links stuck together | Missing CSS for nav-auth-link/nav-auth-btn | global.css | Need spacing styles | Classes unused / unstyled |
| Join public project failed | Project.jsx / invites.js | Backend / auth | API error masked | Generic catch -> toast hides underlying error |

## 4. Risk of Fixes Colliding
- Reintroducing user context & events must not break existing direct `apiMe` calls; plan a wrapper context first, then refactor gradually.
- Adding brand logo image shouldn't shift layout height; ensure CSS matches existing `.gn-left` flex spacing.
- Styling auth links: define minimal CSS for `.nav-auth-link`, `.nav-auth-btn` without altering other buttons.
- Adding refresh after join: implement `window.dispatchEvent(new CustomEvent('projects-changed'))` in join flows and listen in Dashboard for incremental update instead of full reload; low risk.
- Improving join error messaging: add error text from response without leaking server internals; ensure i18n simplicity.

## 5. Proposed Stepwise Plan (Numbered with Status)
1. Documentation of issues (this file). STATUS: Done (will update as tasks complete).
2. Implement UserContext provider & wrap app. STATUS: Done.
3. Add CSS for `.nav-auth-link` and `.nav-auth-btn` with spacing & focus. STATUS: Done.
4. Restore brand logo image in GlobalNavbar. STATUS: Done.
5. Reintroduce theme toggle with dataset persistence. STATUS: Done.
6. Fix hover/invisible button issue (add `.mini-btn` styles, verify primary button gradient). STATUS: Done.
7. Enhance join error handling specificity. STATUS: Done (categorization utility added; Explore & Project integrated).
8. Projects refresh signaling (`projects-changed` events on create/join/archive/leave/delete + dashboard listener). STATUS: Mostly Done (unarchive path not present yet).
9. Replace `window.location.href` with SPA navigation where appropriate. STATUS: Improved (Dashboard + settings leave/delete refactored; auth redirects intentionally full page; Explore join still uses redirect after success).
10. Add loading/disabled state on join buttons to prevent duplicate joins. STATUS: Done (Explore + Project join buttons updated).
11. Retry logic for user detection in navbar. STATUS: Done (lightweight retry loop added).
12. QA matrix execution and verification notes. STATUS: In Progress (matrix file added: `docs/qa-matrix-auth-nav-projects.md`).
13. Update README / CHANGELOG summarizing fixes. STATUS: Done (`CHANGELOG.md` + README section added).
14. Clean up legacy apiMe calls in GlobalNavbar after confidence in context. STATUS: Deferred (will remove after QA signoff).
15. Add distinct toasts for already-member or archived project join attempts. STATUS: Done (handled via categorizeJoinError).
16. Branding polish: restore correct navbar logo (primary mainLogo with legacy fallback) and reduce benefits section to a single enlarged logo card. STATUS: Done.

## 6. Acceptance Criteria
- Navbar reliably shows correct auth state after login without manual refresh.
- Auth links have proper spacing and visibility; brand logo displayed.
- Join public project from both Explore and Project page succeeds, updates dashboard in another open tab within 2s.
- Button hover states maintain contrast (no "invisible" effect) in light mode; dark mode toggle switches and preserves styling.
- Project cards (Open) navigate into project successfully; no unexpected redirects for valid members.
- After joining a project with another account, a live tab of dashboard receives updated list (without manual reload) when event fired.

## 7. Future (Optional) Enhancements (Not in Immediate Fix)
- Centralized notification count in UserContext for consistency.
- Offline / network error banner component.
- Persist selected theme in backend user prefs.
- Replace window events with lightweight state management (Zustand or Context only).

## 8. Open Questions / Assumptions
- Assumption: Backend join endpoint returns updated project with full members array (used to update context). If not, need additional fetch.
- Question: Should dark mode be fully functional or just re-enable toggle stub? (Clarify with user.)
- Assumption: Assets path `/api/assets/logo.png` still valid and served by backend static middleware.

## 9. Next Implementation Steps
Pending user confirmation: proceed with Steps 2–5 first (auth state, styling, logo, theme toggle) then iterative enhancements (6–11). Provide diffs incrementally to avoid regression.

---
(End of draft — awaiting feedback/approval.)
