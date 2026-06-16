<template>
  <Show when="signed-in">
    <slot />
  </Show>
  <Show when="signed-out">
    <RedirectToSignIn />
  </Show>
</template>

<script lang="ts" setup>
import { RedirectToSignIn, Show, useAuth } from '@clerk/vue'
import { useConvexClient } from 'convex-vue'

const { getToken } = useAuth()
const convex = useConvexClient()
convex.setAuth(() => getToken.value({ template: 'convex' }))
</script>
