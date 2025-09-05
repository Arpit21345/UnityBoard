const API = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiListProjects() {
  const res = await fetch(`${API}/api/projects`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.projects;
}

export async function apiCreateProject(payload) {
  const res = await fetch(`${API}/api/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Create failed');
  return data.project;
}

export async function apiGetProject(id) {
  const res = await fetch(`${API}/api/projects/${id}`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.project;
}

export async function apiListProjectTasks(id) {
  const res = await fetch(`${API}/api/projects/${id}/tasks`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.tasks;
}

export async function apiCreateTask(id, payload) {
  const res = await fetch(`${API}/api/projects/${id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Create failed');
  return data.task;
}

export async function apiUpdateTask(taskId, updates) {
  const res = await fetch(`${API}/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed');
  return data.task;
}

export async function apiDeleteTask(taskId) {
  const res = await fetch(`${API}/api/tasks/${taskId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!res.ok) {
    try { const data = await res.json(); throw new Error(data.error || 'Delete failed'); }
    catch { throw new Error('Delete failed'); }
  }
  return true;
}

export async function apiListTaskComments(taskId) {
  const res = await fetch(`${API}/api/tasks/${taskId}/comments`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.comments;
}

export async function apiAddTaskComment(taskId, text) {
  const res = await fetch(`${API}/api/tasks/${taskId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ text }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Create failed');
  return data.comment;
}

export async function apiListPublicProjects() {
  const res = await fetch(`${API}/api/explore/projects`);
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.projects;
}

export async function apiUpdateProject(id, updates) {
  const res = await fetch(`${API}/api/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(updates) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed');
  return data.project;
}

export async function apiListProjectMembers(id) {
  const res = await fetch(`${API}/api/projects/${id}/members`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.members;
}

export async function apiUpdateMemberRole(projectId, userId, role) {
  const res = await fetch(`${API}/api/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role })
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed');
  return data.members; // returns full members
}

export async function apiRemoveMember(projectId, userId) {
  const res = await fetch(`${API}/api/projects/${projectId}/members/${userId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!res.ok) {
    try { const data = await res.json(); throw new Error(data.error || 'Remove failed'); }
    catch { throw new Error('Remove failed'); }
  }
  return true;
}

export async function apiDeleteProject(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!res.ok) {
    try { const data = await res.json(); throw new Error(data.error || 'Delete failed'); }
    catch { throw new Error('Delete failed'); }
  }
  return true;
}
