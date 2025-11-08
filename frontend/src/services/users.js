import { http } from './http.js';
const API = import.meta.env.VITE_API_URL || '';
function authHeaders(){ const token = localStorage.getItem('token'); return token? { Authorization: `Bearer ${token}` } : {}; }

export async function apiUpdateMe(data){
  const res = await http(`${API}/api/users/me`, { method:'PATCH', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify(data) });
  const json = await res.json();
  if(!res.ok || !json.ok) throw new Error(json.error||'Failed to update');
  return json.user;
}

export async function apiUploadAvatar(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/api/uploads/file`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Upload failed');
  
  // Update user profile with new avatar URL
  const updatedUser = await apiUpdateMe({ avatar: data.file.url });
  return updatedUser;
}
