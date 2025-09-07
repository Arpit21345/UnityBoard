import { http } from './http.js';
const API = import.meta.env.VITE_API_URL || '';
function authHeaders(){ const token = localStorage.getItem('token'); return token? { Authorization: `Bearer ${token}` } : {}; }

export async function apiUpdateMe(data){
  const res = await http(`${API}/api/users/me`, { method:'PATCH', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify(data) });
  const json = await res.json();
  if(!res.ok || !json.ok) throw new Error(json.error||'Failed to update');
  return json.user;
}
