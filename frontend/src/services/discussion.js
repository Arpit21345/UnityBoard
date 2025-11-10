import { http } from './http.js';

const API = import.meta.env.VITE_API_URL || '';
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Discussion - Threads & Messages with enhanced error handling
export async function apiListThreads(projectId) {
  try {
    const res = await http(`${API}/api/projects/${projectId}/threads`, { headers: { ...authHeaders() } });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('You must be a project member to access team chat');
      }
      throw new Error(data?.error || 'Failed to load team chat');
    }
    return data;
  } catch (error) {
    console.error('apiListThreads error:', error);
    throw error;
  }
}

export async function apiCreateThread(projectId, payload) {
  try {
    const res = await http(`${API}/api/projects/${projectId}/threads`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to create thread');
    return data;
  } catch (error) {
    console.error('apiCreateThread error:', error);
    throw error;
  }
}

export async function apiListMessages(threadId) {
  try {
    const res = await http(`${API}/api/threads/${threadId}/messages`, { headers: { ...authHeaders() } });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('You must be a project member to view messages');
      }
      throw new Error(data?.error || 'Failed to load messages');
    }
    return data;
  } catch (error) {
    console.error('apiListMessages error:', error);
    throw error;
  }
}

export async function apiCreateMessage(threadId, payload) {
  try {
    const res = await http(`${API}/api/threads/${threadId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to send message');
    return data;
  } catch (error) {
    console.error('apiCreateMessage error:', error);
    throw error;
  }
}