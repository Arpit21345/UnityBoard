import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel-specific configuration for admin panel
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})