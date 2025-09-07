# Feature: Project Dashboard

## Purpose
Provide an at-a-glance, actionable snapshot of a single project's current health so a user (owner, admin, member) can quickly decide what to do next (assign, unblock, close overdue, prioritize). The dashboard intentionally aggregates only *derived* metrics (computed on the client from loaded project + tasks) so it remains fast and has no additional backend coupling beyond the base project + tasks fetch.

## Primary Questions Answered
1. How far along is the project? (Completion %)
2. Where is the immediate risk? (Overdue tasks, unassigned tasks, high/urgent priority concentration)
3. What needs attention soon? (Tasks due in next 7 days)
4. Who is carrying load? (Open vs done vs total per member)
5. What changed recently? (Recent tasks list – newest first)

## Data Inputs
- `project` object (includes `members[{ user, role }]`)
- `tasks[]` array (fetched via existing project tasks endpoint)

## Derived Metrics (Client Computed)
| Metric | Formula | Notes |
|--------|---------|-------|
| total | tasks.length | All tasks | 
| done | tasks.filter(status==='done').length | Completion numerator |
| inProgress | tasks.filter(status==='in-progress').length | Activity indicator |
| todo | tasks.filter(status==='todo').length | Remaining backlog (not started) |
| completion% | done/total * 100 (rounded) | 0 if total=0 |
| byPriority | reduce by `task.priority` default 'medium' | For distribution bars |
| overdue[] | tasks with dueDate < now and status != 'done' | Risk set |
| dueSoon[] | tasks with dueDate in [now, now+7d] and status != 'done' | Upcoming attention |
| unassigned[] | tasks with empty/undefined assignees and not done | Ownership gap |
| memberLoad[] | For each member: counts of assigned open, closed, total | Sorted descending by open |

## Component Structure
```
/components/Dashboard/
  DashboardPanel.jsx  // React component computing metrics + rendering sections
  DashboardPanel.css  // Consolidated scoped styles (kpis, tables, lists, progress)
```
The dashboard is imported in `pages/Project/Project.jsx` when `tab === 'dashboard'`.

## UI Sections
1. KPI Grid (Total, Done, In Progress, Todo, Completion progress bar)
2. Priority Distribution (horizontal bars per priority in fixed order: urgent → low)
3. Risk & Triage Cards (Due Soon, Overdue, Unassigned) – each capped to first six items
4. Recent Tasks (latest tasks slice – currently first 8 of tasks array as already sorted server-side newest-first; consider explicit sort safeguard if backend changes)
5. Team Load table (Member, Open, Done, Total) – provides immediate balancing view
6. Summary Card (plain language one-liner + tip)

## Styling / UX Principles
- Scoped styling file prevents leakage (no global `.kpi-*` names outside folder).
- Subtle animation (`dashFade`) on card mount for perceived responsiveness.
- Use of CSS variables from `styles/tokens.css` for consistent color + typography.
- Priority bars animate width on mount; semantic colors per priority.
- Table uses tabular numeric alignment for readability.
- Lists use truncation + tooltips (`title` attribute) for overflow.

## Accessibility Notes
- Progress bar exposes `role="progressbar"` + `aria-valuenow/valuemin/valuemax`.
- Text alternatives rely on semantic headings and list structures.
- Contrast uses token palette ensuring >= WCAG AA for primary text.

## Error / Empty Handling
- Each list section (Due Soon, Overdue, Unassigned, Recent) shows a neutral "None" / "No tasks" message when empty.
- Completion gracefully shows 0% when no tasks.

## Assumptions
- Tasks are already available in memory when dashboard mounts (Project fetch resolves before render). If not, skeleton shimmer could be introduced later.
- Member names are not yet enriched (IDs only); fallback uses partial ID. When API returns user profile, replace in `displayUser()`.

## Extension Opportunities
| Idea | Value | Complexity |
|------|-------|-----------|
| Velocity (completed per week) | Forecasting | Medium (needs historical snapshots) |
| Burndown chart | Sprint planning | High (needs time-series) |
| Click-to-filter (e.g., click Overdue to jump into Tasks view w/ filter preset) | Faster triage | Low |
| Recent cross-feature activity (solutions, resources) | Broader situational awareness | Medium |
| Risk score (weighted by overdue + urgent unassigned) | Quick risk indicator | Low |
| Dark mode adaptation tokens | Visual parity | Low |

## Guardrails / What NOT To Add (Yet)
- No heavy charts library (avoid bundle bloat) until validated need.
- No backend-exclusive dashboard endpoint – duplication risk; derive on client.
- No mutation actions (assign/close) inside dashboard to keep scope observational & reduce accidental updates.

## Maintenance Notes
- All logic for derived metrics centralized at top of `DashboardPanel.jsx` inside one `useMemo` – adjust formulas there.
- If task statuses expand beyond (todo, in-progress, done), update: KPI grid, priority/risk filters, status color classes.
- Ensure any added metric remains O(n) over tasks to keep render fast (<2ms for typical counts < 500 tasks).

## Quick Test Checklist
- Add tasks of each status/priority → counts reflect instantly.
- Set some tasks overdue (past dueDate) → appear in Overdue with red date.
- Assign/unassign a task → Team Load & Unassigned update instantly.
- Add due dates within 7 days → appear in Due Soon (sorted ascending by date).
- Remove all tasks → all sections show appropriate empty states; completion 0%.

---

# End of Dashboard Feature Doc
