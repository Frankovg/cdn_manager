<template>
  <slot v-if="route.name === 'sign-in' || (authState.isLoaded && authState.isSignedIn)" />
  <div v-else class="grid min-h-screen place-items-center bg-paper px-5" aria-live="polite">
    <div class="text-center">
      <span class="mb-4 inline-flex size-3 rounded-full bg-coral" />
      <p class="font-mono text-xs tracking-[0.18em] text-muted uppercase">verificando acceso</p>
      <p class="mt-2 text-sm text-muted">Espera un momento mientras comprobamos tu sesión.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "@clerk/vue";
import { useConvexClient } from "convex-vue";
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "astro:env/client";
import { useRoute } from "vue-router";
import { onMounted, watch } from "vue";
import { authState, setAuthState } from "@/services/auth-state";
import { attachClerkToken } from "@/services/convex";

const route = useRoute()
const convex = useConvexClient();

if (PUBLIC_CLERK_PUBLISHABLE_KEY) {
  try {
    const { isLoaded, isSignedIn, userId, getToken } = useAuth()
    watch(
      [isLoaded, isSignedIn, userId],
      ([loaded, signedIn, id]) => {
        setAuthState({
          isLoaded: loaded,
          isSignedIn: signedIn === true,
          userId: id ?? null,
        })
      },
      { immediate: true },
    );
    attachClerkToken(convex, (options) => getToken.value(options));
  } catch {
    // The app can still render its setup guide when Clerk has not been configured.
    setAuthState({ isLoaded: true, isSignedIn: false })
  }
} else {
  setAuthState({ isLoaded: true, isSignedIn: false })
}

onMounted(() => {
  if (!PUBLIC_CLERK_PUBLISHABLE_KEY) {
    setAuthState({ isLoaded: true });
  }
})
</script>
