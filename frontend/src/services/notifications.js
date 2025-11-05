import { http } from './http.js';
const API = import.meta.env.VITE_API_URL || '';
function authHeaders(){ const token = localStorage.getItem('token'); return token? { Authorization: `Bearer ${token}` } : {}; }

export async function apiListNotifications(limit=30){
  const res = await http(`${API}/api/notifications?limit=${limit}`, { headers:{ ...authHeaders() } });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
  return data.items||[];
}
export async function apiMarkAllNotificationsRead(){
  const res = await http(`${API}/api/notifications/mark-all-read`, { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() } });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
  return true;
}

export async function apiDeleteSelectedNotifications(notificationIds){
  const res = await http(`${API}/api/notifications/selected`, { 
    method:'DELETE', 
    headers:{ 'Content-Type':'application/json', ...authHeaders() }, 
    body: JSON.stringify({ notificationIds })
  });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
  return data.deletedCount;
}

export async function apiDeleteAllNotifications(){
  const res = await http(`${API}/api/notifications/all`, { 
    method:'DELETE', 
    headers:{ 'Content-Type':'application/json', ...authHeaders() } 
  });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
  return data.deletedCount;
}
