import { createApp } from 'vue'
import App from './App.vue'
import { init } from '@sentry/vue'
import { convexVue } from 'convex-vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ConvexVueQuery } from 'convex-vue-query'
import '~/styles/tailwind.css'

let app = createApp(App)

app.use(convexVue, { url: import.meta.env.VITE_CONVEX_URL })
app.use(VueQueryPlugin)
app.use(ConvexVueQuery)

if (import.meta.env.VITE_SENTRY_DSN) {
  init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 0,
  })
}

app.mount('main')
