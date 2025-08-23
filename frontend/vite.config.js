import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const api = env.VITE_API_URL || 'http://localhost:5000';
  return {
    plugins: [
      react(),
      // Log the local dev URL on startup
      {
        name: 'log-local-url',
        configureServer(server) {
          const { port } = server.config.server;
          setTimeout(() => console.log(`Frontend running at http://localhost:${port}`), 100);
        }
      }
    ],
    server: {
      port: 5173,
      open: true,
      clearScreen: false,
      proxy: {
        '/api': {
          target: api,
          changeOrigin: true
        }
      }
    }
  };
});
