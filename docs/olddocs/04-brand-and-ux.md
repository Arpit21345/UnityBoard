# UnityBoard – Brand and UX

Logo
- Use the provided UnityBoard logo across app header and sign-in pages.
- Source path (dev): frontend/public/logo.png (PNG or SVG). 256–512px recommended.
- Favicon: frontend/public/favicon.ico (optional, can derive from the same logo).

Colors and style (lightweight, CSS-only)
- Primary: Indigo/Blue gradient (#1e3a8a → #06b6d4). Accent for CTAs.
- Surface: #f8fafc; Card: #ffffff; Text: #0f172a; Muted: #64748b.
- Radius: 10–12px; Shadow: subtle (0 4px 14px rgba(0,0,0,.08)).
- Spacing scale: 8px base.

Layout primitives
- App shell: Top navbar + page content, with optional left sidebar on dashboard/project pages.
- Components: Card, Stat pill, List rows with inline actions, Floating AI helper.

Key screens (from mock inspirations)
- Home Dashboard: stat cards (active projects, completion, members), project list with progress bars.
- Project Dashboard: stat cards (total/completed/in-progress/pending), team section, tasks, resources.
- Left nav: Dashboard, Task Management, Learning Tracker, Smart Snippets, Solution DB, Resource Vault, Discussion Room, Settings.

Implementation notes
- Keep pure CSS; no UI libs. Each page/component gets a dedicated .css file.
- Logo integration: show text brand as fallback even if logo is missing.
- Adopt the dropzone pattern for resource uploads (done).
