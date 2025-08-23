const API = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGetMyProfile() {
  const res = await fetch(`${API}/api/users/me`, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Fetch failed');
  return data.user;
}

export async function apiUpdateMyProfile(payload) {
  const res = await fetch(`${API}/api/users/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed');
  return data.user;
}

export async function apiChangePassword({ currentPassword, newPassword }) {
  const res = await fetch(`${API}/api/users/me/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ currentPassword, newPassword }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Password change failed');
  return true;
}
