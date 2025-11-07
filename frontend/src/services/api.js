const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_ENABLED = String(import.meta.env.VITE_ENABLE_SOCKET || 'false') === 'true';


