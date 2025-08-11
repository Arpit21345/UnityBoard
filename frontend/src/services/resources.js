const API = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiListResources(projectId) {
  const res = await fetch(`${API}/api/projects/${projectId}/resources`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.resources;
}

export async function apiUploadResourceFile(projectId, file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/api/projects/${projectId}/resources/file`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Upload failed');
  return data.resource;
}

export async function apiCreateResourceLink(projectId, { title, url }) {
  const res = await fetch(`${API}/api/projects/${projectId}/resources/link`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ title, url }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Create failed');
  return data.resource;
}

export async function apiDeleteResource(projectId, resourceId) {
  const res = await fetch(`${API}/api/projects/${projectId}/resources/${resourceId}`, { method: 'DELETE', headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Delete failed');
  return true;
}
