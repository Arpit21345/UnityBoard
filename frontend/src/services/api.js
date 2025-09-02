const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_ENABLED = String(import.meta.env.VITE_ENABLE_SOCKET || 'false') === 'true';

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
