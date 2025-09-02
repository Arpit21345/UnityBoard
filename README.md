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
