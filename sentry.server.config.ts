import * as Sentry from '@sentry/astro'
import { SENTRY_DSN } from 'astro:env/server'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: '',
  enabled: Boolean(SENTRY_DSN),
})
