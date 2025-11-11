import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminPort = parseInt(env.VITE_ADMIN_PORT) || 5176
  const backendPort = parseInt(env.VITE_BACKEND_PORT) || 5000
  
  // Use different config for production (Vercel)
  if (mode === 'production') {
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',
        emptyOutDir: true
      }
    }
  }
  
  // Development configuration
  return {
    plugins: [react()],
    base: '/admin/',
    build: {
      outDir: '../backend/dist/admin',
      emptyOutDir: true
    },
    server: {
      port: adminPort,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true
        }
      }
    }
  }
})