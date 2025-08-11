# AI Troubleshooting

Use these steps when the UnityBoard Assistant shows "Sorry, AI is unavailable" or the browser console shows 400 on /api/ai/*.

Quick checks
- Backend running: http://localhost:5001 (or your PORT). Health: GET /api/health.
- AI health: GET /api/ai/health should return { ok: true, hasKey: true, model: ... }.
- Frontend API base: frontend .env VITE_API_URL matches backend URL.
- CORS: backend CLIENT_URL allows your current Vite port (5173/5174) or just http://localhost.

Common issues
- Missing COHERE_API_KEY in backend/.env → set and restart server.
- Invalid model (e.g. command-light not allowed) → set COHERE_MODEL=command.
- Body shape mismatch → fixed in services/ai.js (uses message, not messages).
- Rate limit from Cohere → backoff or reduce usage.

Server logs
- Check terminal for lines starting with "AI /qna error:" or similar for exact reason.

Manual tests (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/ai/health" -Method Get
$body = @{ question = "Hi"; context = "" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5001/api/ai/qna" -Method Post -ContentType "application/json" -Body $body
```
