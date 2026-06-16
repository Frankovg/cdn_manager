import { createApp } from 'vue'
import App from './App.vue'
import { init } from '@sentry/vue'
import { clerkPlugin } from '@clerk/vue'
import { convexVue } from 'convex-vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ConvexVueQuery } from 'convex-vue-query'
import '~/styles/tailwind.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

let app = createApp(App)

app.use(clerkPlugin, {
  publishableKey,
  signInForceRedirectUrl: '/',
})
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
