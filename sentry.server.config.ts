import * as Sentry from "@sentry/astro";

const dsn = process.env.PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  environment: process.env.PUBLIC_SENTRY_ENVIRONMENT,
  enabled: Boolean(dsn),
});
