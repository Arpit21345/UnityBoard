# Environment and Services Plan (v1)

This document maps each feature to technologies, free-tier status, and the corresponding environment variables. All secrets live in backend .env only.

## Ground rules
- Stack: MERN only. No TypeScript, no Next.js. Custom CSS.
- Local-first, deploy-ready. Strict env usage; never hardcode secrets/URLs.
- File uploads: local folder for dev; Cloudinary for production (also supports PDFs).
- AI: Cohere API via backend proxy, cost-conscious model.

## Services and tech choices

- Auth: JWT (jsonwebtoken), bcrypt for hashing. Free.
  - Env: JWT_SECRET, JWT_EXPIRES_IN (e.g., 7d)
- Database: MongoDB (Atlas Free or local). Free tier available.
  - Env: MONGO_URI, MONGO_DB_NAME
- CORS/Origin: Lock to frontend origin.
  - Env: CLIENT_URL (http://localhost:5173 in dev)
- Rate limiting: express-rate-limit. Free.
  - Env: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
- Logging: morgan/basic console. Free.
  - Env: LOG_LEVEL (info|debug)
- File uploads (images, PDFs, docs):
  - Dev: Local folder backend/uploads (gitignored except .gitkeep). Free.
    - Env: FILE_STORAGE=local, UPLOADS_DIR=uploads, MAX_UPLOAD_SIZE_MB (e.g., 10)
  - Prod: Cloudinary (supports images, videos, PDFs). Free tier available.
    - Env: FILE_STORAGE=cloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER (e.g., unityboard)
    - Store only returned secure_url in DB.
- AI Assistant: Cohere API. Free/dev-friendly; tune token budget.
  - Env: COHERE_API_KEY, COHERE_MODEL=command-light, AI_MAX_TOKENS (e.g., 512)
- Realtime discussion:
  - Phase 1: REST + simple polling. Free.
    - Env: ENABLE_SOCKET=false
  - Phase 2 (optional): Socket.IO for realtime. Free.
    - Env: ENABLE_SOCKET=true
- Export/Reports (attendance):
  - Generate CSV/JSON server-side. Free.
  - Env: none required for MVP.
- Email (optional later): service TBD (Resend/SendGrid). Not included in MVP.

## Feature-by-feature mapping

- Public Portal (Explore): React pages, no external service. Free.
  - Env: none
- Authentication: JWT + bcrypt. Free.
  - Env: JWT_SECRET, JWT_EXPIRES_IN
- Home Dashboard: React UI + REST data. Free.
  - Env: none
- Project Dashboard/Tasks/Attendance/Learning/Snippets/Solutions/Resources/Discussion:
  - Tech: Express REST + MongoDB collections. Free.
  - Env: General (MONGO_URI, MONGO_DB_NAME); specific modules don’t need external env.
- AI Assistant: Backend proxy to Cohere.
  - Env: COHERE_API_KEY, COHERE_MODEL, AI_MAX_TOKENS
- Dark/Light Mode + Responsive: Pure CSS.
  - Env: none

## Frontend env
- VITE_API_URL: http://localhost:5000 in dev; backend URL in prod.
- Optional flags: VITE_ENABLE_AI_ASSISTANT=true, VITE_APP_NAME="UnityBoard"

## Backend env (full list)
- NODE_ENV=development|production
- PORT=5000
- CLIENT_URL=http://localhost:5173
- LOG_LEVEL=info
- RATE_LIMIT_WINDOW_MS=60000
- RATE_LIMIT_MAX=100
- MONGO_URI=your_mongo_connection_string
- MONGO_DB_NAME=unityboard
- JWT_SECRET=change_me
- JWT_EXPIRES_IN=7d
- FILE_STORAGE=local|cloudinary
- UPLOADS_DIR=uploads
- MAX_UPLOAD_SIZE_MB=10
- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=
- CLOUDINARY_FOLDER=unityboard
- COHERE_API_KEY=
- COHERE_MODEL=command-light
- AI_MAX_TOKENS=512
- ENABLE_SOCKET=false

## Costs / free tier notes
- MongoDB Atlas: Free tier (shared cluster) suitable for MVP.
- Cloudinary: Free tier includes generous monthly credits; supports PDFs. Use transformation limits wisely.
- Cohere: Offers free/dev tiers; use small model (command-light) and small max tokens.
- Render/Vercel/Netlify (deployment): Free tiers exist; sleeping cold starts on free plans.

## Security and deployment hygiene
- Secrets only on backend; never expose API keys to frontend.
- Restrict CORS to known origin via CLIENT_URL.
- Use HTTPS in production and secure cookies if we later switch to cookie auth.
- Keep .env out of git; commit only .env.example with placeholders.

## Next
- After you confirm/change any items here, we’ll wire a small config loader and enforce limits (rate limit, max upload size) before implementing modules.
