# Multi-User Manual QA Script (Core Demo Flow)

Purpose: Rapidly verify the end‑to‑end polished workflow (Explore → Auth → Project create/join → Basic collaboration) across two fresh users before a demo.

## Preconditions
- Clean-ish database (or at least no conflicting project names you will re-use). Not strictly required.
- Browser A (User A) and Browser/Incognito B (User B) – keep sessions isolated.
- Backend & frontend running.
- Optional: Open devtools console to watch for errors (should remain clean during happy path).

## Test Accounts
| Label | Email (example) | Notes |
|-------|-----------------|-------|
| User A (Owner) | demo.owner@example.com | Creates public + private project |
| User B (Joiner) | demo.joiner@example.com | Joins public project; uses invite code |

(Use any emails – no verification flow assumed.)

## Scenario 1: Public Landing & Explore
1. Open base URL (logged out).
2. EXPECT: Explore page hero visible. Navbar shows Sign in / Get started. No avatar, no notifications icon.
3. Scroll to Public Projects section.
4. EXPECT: Either a list (0+). If none: empty state message “No public projects yet…”.

## Scenario 2: Registration Flow & Redirect
1. Click Get started.
2. Complete registration for User A.
3. EXPECT: Redirect to dashboard (NOT remain on explore). Navbar now shows bell + avatar (no auth buttons). Dashboard shows KPIs & empty states (Owned Projects: “No owned projects yet.” etc.).
4. Logout via avatar menu.
5. EXPECT: Return to Explore (logged out state again).

## Scenario 3: Public Project Join Redirect (postLoginRedirect)
1. While logged out, in Explore → pick a public project card (if none exists, skip to Scenario 4 to create one, then return here after making it public).
2. Click Join Project.
3. EXPECT: Redirect to login page. localStorage should contain `postLoginRedirect=/project/<id>`.
4. Login as (or register) User B.
5. EXPECT: Auto-redirect straight into that project (membership gate bypassed). Toast success if implemented; project sidebar visible.
6. Navigate back to Dashboard.
7. EXPECT: Project appears under All Projects (and possibly not Owned Projects for User B since not owner).

## Scenario 4: Create New Public Project (User A)
1. Login as User A (Browser A).
2. On Dashboard click + New Project.
3. Enter name: “Public Demo Project”; set Visibility = Public; Save.
4. EXPECT: Toast “Project created”. Owned Projects increments. All Projects list includes it with role badge `owner`.
5. Logout; confirm Explore still loads.

## Scenario 5: Membership Gate (Public) & Join Panel
1. Copy the new project URL (while logged out) and visit directly `/project/<id>`.
2. EXPECT: Join panel (name, description, Join button, visibility & member count). Not an error screen.
3. Click Join → if not logged in you’ll be redirected; login as User B then re-access if necessary.
4. EXPECT: After join, full project workspace loads; tasks/resources panels not erroring.

## Scenario 6: Private Access Denial
1. As User A, create another project: “Private Demo Project” with Visibility=Private.
2. Logout User A.
3. While logged out copy its URL (from history or dashboard before logout) into Browser B (User B logged in or log in as User B first).
4. Visit `/project/<privateId>` as User B (non-member).
5. EXPECT: Immediate redirect to dashboard with toast “Access denied to project”. No flicker of error card.

## Scenario 7: Invite Code Join (Private)
1. Login as User A; open Settings of the private project.
2. Generate Invite → EXPECT toast “Invite created” & code visible.
3. Copy code; logout or keep tab.
4. In Browser B (User B) Dashboard → paste code into inline Invite Code form and submit.
5. EXPECT: Redirect into private project; role badge should show `member` (not owner) in All Projects listing.

## Scenario 8: Task Creation & Basic Editing
1. In shared project (public or private) as Owner (User A) open Tasks tab.
2. Create new task (Title only). EXPECT toast “Task created”. Appears at top of list.
3. Edit that task (open modal) change title & priority; EXPECT “Task updated”.
4. Assign task to User B (if member) then Save. EXPECT updated assignee persists (verify by reopening modal or in list if surfaced).

## Scenario 9: Resource Upload (Happy Path)
1. Open Resources tab as Owner.
2. Upload a small file (<10MB) OR add a link (https://example.com). EXPECT success toast (“Uploaded 1 file(s)” or “Link added”).
3. Remove resource. EXPECT “Resource deleted”.

## Scenario 10: Permission Guard UX
1. As User B (non-owner) on Dashboard attempt to Archive project by clicking Archive on a project not owned.
2. EXPECT: Toast “Owner role required” (no API call side effect, status unchanged).
3. In project Settings as User B ensure Save button absent or read-only note shown; trying restricted actions triggers guard toasts where applicable.

## Scenario 11: Archive / Unarchive Lifecycle
1. As Owner archive a project from Dashboard or All Projects list.
2. EXPECT: Toast “Project archived”; it disappears from Active lists (or status updates) and appears in Past Projects page.
3. Go to Past Projects, click Unarchive. EXPECT: Toast “Project restored” and item returns to dashboard lists.

## Scenario 12: Logout Consistency
1. From any inner page (e.g., Project) open avatar menu → Logout.
2. EXPECT: Redirect to Explore (public landing) with unauth navbar.

## Optional / Deferred (For Awareness Only)
- Discussion panel advanced features (typing indicator, advanced moderation) intentionally deferred (banner present in panel).
- Dark mode improvements deferred; only light/base theme validated.

## Quick Smoke Checklist (One-Line)
- Explore unauth OK
- Auth register redirect OK
- Post-login project redirect OK
- Public join gate OK
- Private access denial redirect OK
- Invite code join OK
- Task create/edit OK
- Resources add/delete OK
- Permission guard toasts OK
- Archive/unarchive OK
- Logout to Explore OK

## Troubleshooting Notes
| Symptom | Likely Cause | Quick Check |
|---------|-------------|-------------|
| Post-login redirect skipped | localStorage key cleared too early | Inspect Application > Local Storage for key before login submit |
| Archive button missing | User isn’t owner | Check role badge on project card |
| Join panel does not appear | Project is private OR already a member | Confirm visibility via owner session |
| Toasts not showing | Toast provider not mounted | Ensure `<ToastProvider>` wraps app root |

## Pass Criteria
All scenarios 1–12 complete without console errors and expected toasts/messages shown.

---
Last updated: (Pre-Phase 3 polishing) – adjust as flow evolves.
