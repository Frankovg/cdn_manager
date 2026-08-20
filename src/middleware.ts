import { sequence } from 'astro/middleware'
import { handleRequest, init } from '@sentry/astro'

init({
  enabled: process.env.NODE_ENV === 'production',
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  release: process.env.VERSION,
})

export const onRequest = sequence(
  handleRequest({
    trackClientIp: true,
  }),
)
