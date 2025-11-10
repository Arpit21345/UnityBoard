import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const frontendPort = parseInt(env.VITE_FRONTEND_PORT) || 5173;
  const backendPort = parseInt(env.VITE_BACKEND_PORT) || 5000;
  const api = env.VITE_API_URL || `http://localhost:${backendPort}`;
  
  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      open: true,
      proxy: {
        '/api': {
          target: api,
          changeOrigin: true
        }
      }
    }
  };
});
