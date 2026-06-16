import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        entryFileNames: 'assets/rms-[name].[hash].js',
        chunkFileNames: 'assets/rms.[hash].js',
        assetFileNames: 'assets/rms.[hash].[ext]',
      },
    },
  },
  base: 'https://resources.onetbooking.com/', //TODO(marisa): Cambiar a la URL de la CDN
  plugins: [
    vue(),
    tailwindcss(),
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: 'altipla',
          project: 'cdn-assets-manager',
          authToken: process.env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            filesToDeleteAfterUpload: ['dist/**/*.map'],
          },
          telemetry: false,
        })
      : undefined,
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '~convex': path.resolve(__dirname, 'convex'),
    },
  },
  server: {
    allowedHosts: ['.dev.altiplaweb.com'],
  },
})
