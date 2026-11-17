import node from '@astrojs/node'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'
import sentry from '@sentry/astro'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      PUBLIC_CLERK_PUBLISHABLE_KEY: envField.string({ context: 'client', access: 'public', optional: false }),
      PUBLIC_CONVEX_URL: envField.string({ context: 'client', access: 'public', optional: false }),
      PUBLIC_UPLOAD_ENDPOINT_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      CONVEX_ACTIONS_URL: envField.string({ context: 'server', access: 'public', optional: false }),
      UPLOADTHING_CALLBACK_SECRET: envField.string({ context: 'server', access: 'secret', optional: false }),
      UPLOADTHING_TOKEN: envField.string({ context: 'server', access: 'secret', optional: false }),
      VERSION: envField.string({ context: 'server', access: 'public', optional: true }),
      SENTRY_DSN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    vue({ appEntrypoint: '/src/astro-vue-app' }),
    sentry({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'frankovg',
      project: 'cdn-manager',
      telemetry: false,
      enabled: {
        client: false,
        server: true,
      },
    }),
  ],
  server: { host: true },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
