const API = import.meta.env.VITE_API_URL || '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Discussion - Threads & Messages
export async function apiListThreads(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/threads`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateThread(projectId, payload) {
  const res = await fetch(`${API}/api/projects/${projectId}/threads`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}
export async function apiUpdateThread(threadId, updates) {
  const res = await fetch(`${API}/api/threads/${threadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
  return res.json();
}
export async function apiDeleteThread(threadId) {
  const res = await fetch(`${API}/api/threads/${threadId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  return res.json();
}
export async function apiListMessages(threadId) {
  const res = await fetch(`${API}/api/threads/${threadId}/messages`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateMessage(threadId, payload) {
  const res = await fetch(`${API}/api/threads/${threadId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}
export async function apiDeleteMessage(threadId, messageId) {
  const res = await fetch(`${API}/api/threads/${threadId}/messages/${messageId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  return res.json();
}
