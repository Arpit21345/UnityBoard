// Lightweight fetch wrapper adding 401 -> auth-expired event dispatch.
export async function http(url, options={}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    // Store current path for post-login redirect BEFORE clearing token
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
      localStorage.setItem('postLoginRedirect', currentPath);
    }
    
    // Clear token & broadcast - let ProtectedRoute handle the redirect
    localStorage.removeItem('token');
    const evt = new CustomEvent('auth-event', { detail: 'auth-expired' });
    window.dispatchEvent(evt);
  }
  return res;
}

export async function json(url, { headers={}, ...rest } = {}) {
  const res = await http(url, { headers: { 'Content-Type': 'application/json', ...headers }, ...rest });
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status; throw err;
  }
  return data;
}
