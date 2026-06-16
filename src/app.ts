import { createApp } from 'vue'
import App from './App.vue'
import { init } from '@sentry/vue'
import '~/styles/tailwind.css'

let app = createApp(App)

if (import.meta.env.VITE_SENTRY_DSN) {
  init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 0,
  })
}

app.mount('main')
