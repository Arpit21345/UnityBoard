const API = import.meta.env.VITE_API_URL || '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Snippets
export async function apiListSnippets(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/snippets`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateSnippet(projectId, payload) {
  const res = await fetch(`${API}/api/projects/${projectId}/snippets`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}
export async function apiUpdateSnippet(snippetId, updates) {
  const res = await fetch(`${API}/api/snippets/${snippetId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
  return res.json();
}
export async function apiDeleteSnippet(snippetId) {
  const res = await fetch(`${API}/api/snippets/${snippetId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  return res.json();
}
