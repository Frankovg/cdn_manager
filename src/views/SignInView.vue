<template>
  <section class="sign-in-page flex min-h-screen items-center justify-center bg-paper px-5 py-10 md:px-8 md:py-16">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="mb-3 inline-flex items-center gap-3" aria-label="CDN Assets Manager">
          <span class="inline-flex h-8 items-end gap-1" aria-hidden="true">
            <span class="h-3 w-1.5 rounded-t-sm bg-mint/50" />
            <span class="h-5 w-1.5 rounded-t-sm bg-mint" />
            <span class="h-8 w-1.5 rounded-t-sm bg-pink" />
          </span>
          <span class="font-display text-2xl font-semibold tracking-tight text-ink">
            cdn
            <span class="text-pink">/</span>
            assets manager
          </span>
        </div>
      </div>

      <div class="flex justify-center">
        <template v-if="!PUBLIC_CLERK_PUBLISHABLE_KEY">
          <div class="mb-5 grid size-10 place-items-center rounded-sm bg-mint/10 font-display text-xl text-mint">⌁</div>
          <h1 class="mb-3 font-display text-2xl font-medium">Clerk no está configurado</h1>
        </template>
        <template v-else>
          <SignIn :appearance="signInAppearance" force-redirect-url="/" :with-sign-up="false" routing="hash" />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from 'astro:env/client'

const signInAppearance = {
  variables: {
    // Global palette comes from clerkPlugin; the sign-in card sits on the page background
    colorBackground: '#121212',
  },
  elements: {
    rootBox: 'w-full',
    card: 'w-full border-0 bg-transparent p-0 shadow-none',
    header: 'gap-1 text-left',
    headerTitle: 'font-display text-2xl font-medium tracking-tight text-ink',
    headerSubtitle: 'hidden',
    socialButtons: 'gap-3',
    socialButtonsBlockButton: 'border-line bg-raised text-ink shadow-none hover:bg-dark-primary',
    dividerLine: 'bg-line',
    dividerText: 'bg-paper px-3 font-mono text-[0.65rem] tracking-[0.12em] text-muted uppercase',
    formFieldLabel: 'font-mono text-[0.65rem] tracking-[0.12em] text-muted uppercase',
    formFieldInput: 'border-line bg-paper text-ink shadow-none focus:border-mint focus:ring-2 focus:ring-mint/15',
    formFieldInputShowPasswordButton: 'text-muted hover:text-ink',
    formButtonPrimary: 'bg-mint font-semibold text-paper shadow-none hover:bg-mint-dark',
    footer: 'hidden',
    alertText: 'text-sm text-pink',
    formFieldErrorText: 'text-sm text-pink',
  },
}
</script>
