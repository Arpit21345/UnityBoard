const API = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Registration failed');
  setToken(data.token);
  return data.user;
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  return data.user;
}

export async function apiMe() {
  const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error('Not authenticated');
  return data.user;
}
