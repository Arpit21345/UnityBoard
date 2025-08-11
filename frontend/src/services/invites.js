const API = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiCreateInvite(projectId, body) {
  const res = await fetch(`${API}/api/projects/${projectId}/invites`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Create failed');
  return data.invite;
}

export async function apiListInvites(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/invites`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.invites;
}

export async function apiToggleInvite(inviteId, enabled) {
  const res = await fetch(`${API}/api/invites/${inviteId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ enabled }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed');
  return data.invite;
}

export async function apiAcceptInviteCode(code) {
  const res = await fetch(`${API}/api/invites/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ code }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Join failed');
  return data.project;
}

export async function apiJoinPublicProject(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/join`, { method: 'POST', headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Join failed');
  return data.project;
}
