import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:8787'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  server: {
    // In development the Node API runs on :8787 and Vite proxies /api to it.
    proxy: { '/api': { target: API_TARGET, changeOrigin: true } },
  },
  preview: {
    proxy: { '/api': { target: API_TARGET, changeOrigin: true } },
  },
})
