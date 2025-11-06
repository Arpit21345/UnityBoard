import { http } from './http.js';

const API = import.meta.env.VITE_API_URL || '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Discussion - Threads & Messages
export async function apiListThreads(projectId) {
  const res = await http(`${API}/api/projects/${projectId}/threads`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateThread(projectId, payload) {
  const res = await http(`${API}/api/projects/${projectId}/threads`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}

export async function apiListMessages(threadId) {
  const res = await http(`${API}/api/threads/${threadId}/messages`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateMessage(threadId, payload) {
  const res = await http(`${API}/api/threads/${threadId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}