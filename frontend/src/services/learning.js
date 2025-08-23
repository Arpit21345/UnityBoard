// Frontend service stubs for upcoming features.

const API = import.meta.env.VITE_API_URL || '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Learning
export async function apiListLearning(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/learning`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateLearning(projectId, payload) {
  const res = await fetch(`${API}/api/projects/${projectId}/learning`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}
export async function apiUpdateLearning(entryId, updates) {
  const res = await fetch(`${API}/api/learning/${entryId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
  return res.json();
}
export async function apiDeleteLearning(entryId) {
  const res = await fetch(`${API}/api/learning/${entryId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  return res.json();
}
