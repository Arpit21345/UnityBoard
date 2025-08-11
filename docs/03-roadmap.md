# UnityBoard Roadmap (MVP -> v1)

MVP Scope
- Auth: Register/Login/Me (JWT)
- Projects: Create/List/View
- Tasks: Create/List/Update status
- Resources: Upload file (local)/Add link; list/delete
- AI (Cohere): Suggest tasks, summarize, QnA (simple UI later)

v1 Additions
- Snippets: CRUD + votes
- Solutions DB: CRUD + search
- Attendance: login/activity logs + CSV export
- Learning tracker: CRUD entries per task
- Discussion: basic Socket.IO channel
- Roles: owner/member (simple permissions)
- Deploy: Backend (Render/Railway), Frontend (Vercel/Netlify), Mongo (Atlas), Files (Cloudinary)

AI Reliability & Observability
- Add /api/ai/health frontend check on app load; show actionable banner when key/model missing.
- Centralize AI error codes (missing_key, invalid_model, rate_limited) and map to friendly messages.
- Add minimal server log context for /api/ai routes (implemented) and redact secrets.
- Add basic usage counter (per IP/user) with rate-limit feedback.

React Router v7 Readiness
- Evaluate Data Router with createBrowserRouter and future flags: v7_startTransition, v7_relativeSplatPath.
- Wrap setState mutations in startTransition where appropriate (heavy updates).
- Audit relative splat routes; adjust links if behavior changes.

Non-goals (for now)
- OAuth login, advanced access control, complex analytics

Notes
- Provider+URL pattern ensures resources work both locally and in production.
- Keep env/secrets server-side; frontend uses only public VITE_*.
