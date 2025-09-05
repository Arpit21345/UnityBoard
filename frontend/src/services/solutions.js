const API = import.meta.env.VITE_API_URL || '';
async function toJsonWithStatus(res) {
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (typeof data !== 'object' || data === null) data = {};
  return { status: res.status, ...data };
}
function netErr() { return { ok: false, error: 'Network error', status: 0 }; }
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Solutions
export async function apiListSolutions(projectId) {
  try {
    const res = await fetch(`${API}/api/projects/${projectId}/solutions`, { headers: { ...authHeaders() } });
    return toJsonWithStatus(res);
  } catch {
    return netErr();
  }
}
export async function apiCreateSolution(projectId, payload) {
  try {
    const res = await fetch(`${API}/api/projects/${projectId}/solutions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
    return toJsonWithStatus(res);
  } catch {
    return netErr();
  }
}
export async function apiUpdateSolution(solutionId, updates) {
  try {
    const res = await fetch(`${API}/api/solutions/${solutionId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
    return toJsonWithStatus(res);
  } catch {
    return netErr();
  }
}
export async function apiDeleteSolution(solutionId) {
  try {
    const res = await fetch(`${API}/api/solutions/${solutionId}`, { method: 'DELETE', headers: { ...authHeaders() } });
    return toJsonWithStatus(res);
  } catch {
    return netErr();
  }
}
