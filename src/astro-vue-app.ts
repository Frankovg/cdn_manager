import { clerkPlugin } from '@clerk/vue'
import { convexVue } from 'convex-vue'
import { PUBLIC_CLERK_PUBLISHABLE_KEY, PUBLIC_CONVEX_URL } from 'astro:env/client'
import type { App } from 'vue'
import router from '@/router'

export default (app: App): void => {
  app.use(clerkPlugin, {
    publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY,
    // Dark palette shared by every Clerk widget, aligned with src/styles.css tokens
    appearance: {
      variables: {
        colorPrimary: '#5cedc2',
        colorPrimaryForeground: '#121212',
        colorForeground: '#ffffffe6',
        colorMutedForeground: '#ffffffb3',
        colorBackground: '#1b1b1b',
        colorInput: '#121212',
        colorInputForeground: '#ffffffe6',
        colorNeutral: '#ffffff',
        colorDanger: '#e453bc',
        borderRadius: '2px',
        fontFamily: 'Readex Pro, system-ui, sans-serif',
      },
    },
  })

  app.use(convexVue, { url: PUBLIC_CONVEX_URL })

  app.use(router)
}
