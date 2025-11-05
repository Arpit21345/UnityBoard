# UnityBoard (MERN Skeleton)

- Stack: MongoDB, Express.js, React, Node.js (no TypeScript, no Next.js, custom CSS)
- Clean separation: `backend/` and `frontend/`
- Ready for local dev and future deployment (Render/Netlify/Vercel). Use env files.

## Local development

1. Backend
   - Copy `backend/.env.example` to `backend/.env` and set variables.
   - Install and run:

```powershell
cd backend; npm install; npm run dev
```

API runs at http://localhost:5000

2. Frontend
   - Create `frontend/.env` if needed, e.g.:

```
VITE_API_URL=http://localhost:5000
```

   - Install and run:

```powershell
cd ../frontend; npm install; npm run dev
```

App at http://localhost:5173

### Asset / Upload Verification (Optional)
Run a quick check that every `/api/assets/*` reference has a corresponding file:

```powershell
node scripts/verify-assets.js
```

See `docs/assets-and-uploads.md` for structure and recommended future filename normalizations.

## Project structure

```
projectUnityBoard/
  backend/
    src/
      config/db.js
      routes/health.route.js
      server.js
    package.json
    .env.example
  frontend/
    src/
      components/Navbar/
        Navbar.jsx
        Navbar.css
      pages/
        Home/
          Home.jsx
          Home.css
        Login/
          Login.jsx
          Login.css
      services/api.js
      styles/global.css
    index.html
    vite.config.js
    package.json
  .gitignore
  README.md
```

## Notes
- Keep each page/component in its own folder with matching `.jsx` and `.css` files.
- Use env variables only; avoid hardcoding URLs.
- We will refine structure after you share detailed requirements.

## Demo Walkthrough (Current Polished Flow)
1. Landing (Explore): Public marketing + list of public projects (unauth navbar: Sign in / Get started).
2. Register → Redirects to Dashboard (owned projects empty states visible).
3. Create Public Project (Dashboard) → Toast: "Project created".
4. Logout → Returns to Explore.
5. From Explore join a public project while logged out → Forced to Login → After login auto-redirects into project.
6. Visit a private project URL as non-member → Redirect to Dashboard with toast "Access denied to project".
7. Generate invite (Settings) → Use invite code on Dashboard (other user) to join private project.
8. Add task & resource inside project → Toast confirmations (Task created / Uploaded 1 file(s)).
9. Archive a project (owner only) → Appears in Past Projects; Unarchive restores it.
10. Permission guard: Non-owner attempting archive or settings save sees toast "Owner role required".

## Accessibility & UX Polishing
- Unified toast system for all feedback (no native alert dialogs).
- Consistent empty states on Dashboard, Explore public projects, Notifications, Past Projects.
- Role & project visibility surfaced in navbar user menu when inside a project.
- Membership gate for public projects instead of error page.
- Discussion advanced features deferred (banner explains scope limit).

## Multi-User Manual QA Script
See `docs/qa-multi-user-script.md` for a 12-scenario checklist to validate the above flow end-to-end.

## Recent Polishing (Auth / Navbar / Projects)
- Global user context & retry removed stale navbar sign-in state.
- Theme toggle restored with persistence.
- Event-driven dashboard updates on project mutations.
- Consistent mini action button styling prevents hover invisibility.
- Join flows improved: loading states, better duplicate membership handling.
- See `CHANGELOG.md` for dated summary.

## Realtime chat (optional)
- Backend env: `ENABLE_SOCKET=true`, ensure `CLIENT_URL=http://localhost:5173` is set.
- Frontend env: `VITE_ENABLE_SOCKET=true` and `VITE_API_URL=http://localhost:5000`.
- Start both with the usual commands:

```powershell
cd backend; npm run dev
```

```powershell
cd frontend; npm run dev
```
