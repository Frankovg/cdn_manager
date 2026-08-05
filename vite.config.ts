import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // The API runs as a separate local process; the URL is configurable for hosted deployments.
    proxy: {
      '/api/upload': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/api/uploadthing': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
