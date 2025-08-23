const API = import.meta.env.VITE_API_URL || '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Solutions
export async function apiListSolutions(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/solutions`, { headers: { ...authHeaders() } });
  return res.json();
}
export async function apiCreateSolution(projectId, payload) {
  const res = await fetch(`${API}/api/projects/${projectId}/solutions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  return res.json();
}
export async function apiUpdateSolution(solutionId, updates) {
  const res = await fetch(`${API}/api/solutions/${solutionId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
  return res.json();
}
export async function apiDeleteSolution(solutionId) {
  const res = await fetch(`${API}/api/solutions/${solutionId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  return res.json();
}
