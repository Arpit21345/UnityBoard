const API = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// COMMENTED OUT - Invite feature was removed, using simple project name/password join instead
/*
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
*/

// Stub functions for components that still reference invites - return empty/error states
export async function apiCreateInvite(projectId, body) {
  console.warn('Invite feature disabled - use project name/password join instead');
  return null;
}

export async function apiListInvites(projectId) {
  console.warn('Invite feature disabled');  
  return []; // Return empty array for components expecting invite list
}

export async function apiToggleInvite(inviteId, enabled) {
  console.warn('Invite feature disabled');
  return null;
}

export async function apiAcceptInviteCode(code) {
  console.warn('Invite codes disabled - use project name/password join instead');
  throw new Error('Invite codes are no longer supported. Use project name and password to join private projects.');
}

export async function apiJoinPublicProject(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/join`, { method: 'POST', headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Join failed');
  return data.project;
}
