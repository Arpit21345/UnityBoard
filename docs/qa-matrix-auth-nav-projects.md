# QA Matrix – Auth / Navbar / Project Flows (2025-09-07)

| # | Scenario | Pre-Conditions | Steps | Expected Result | Pass? |
|---|----------|----------------|-------|-----------------|-------|
| 1 | Login updates navbar | Valid account, logged out | Login with correct creds | Navbar shows avatar + notifications; no Sign in link |  |
| 2 | Theme toggle persists | Logged in | Toggle light→dark, refresh page | Dark theme reapplies (data-theme='dark') |  |
| 3 | Create project refresh | On dashboard | Create project | New project appears at top; event listener fired |  |
| 4 | Public join (Explore) | Another public project exists | From Explore click Join | Redirect to project; other open dashboard tab updates within 2s |  |
| 5 | Public join (Project page) | Visit public project not a member | Click Join Project | Membership granted; dashboard tab updates |  |
| 6 | Invite accept flow | Owner generated invite | Enter code on dashboard form | Joined + redirect to project |  |
| 7 | Archive project refresh | Owner of project | Archive from owned list | Card switches to archived state & removed from active sets |  |
| 8 | Leave project | Member (not owner) | Leave via settings | Redirect dashboard; removed from project list |  |
| 9 | Delete project | Owner | Delete via danger zone | Redirect dashboard; project no longer in any list |  |
| 10 | Already member join attempt | Already member of public project | Attempt join again (Explore) | Informational toast and redirect |  |
| 11 | Unauthorized join | Logged out | Join from Explore | Redirect to login, after login auto-redirects into project |  |
| 12 | Multi-tab user context | Two tabs open (dashboard + project) | Logout on one tab | Other tab navbar shows Sign in within 1s |  |
| 13 | Button hover contrast | Light + dark mode | Hover mini buttons | Text/icon remain legible |  |
| 14 | Notification badge increments | Have second account send notification | Trigger notification event | Badge dot appears/increments |  |

Mark Pass/Fail and record anomalies below.

## Anomalies / Notes
- (Record here)
