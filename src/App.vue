<template>
  <h1 class="text-2xl font-bold text-indigo-500">CDN Assets Manager</h1>

  <p v-if="isPending" class="text-gray-500">Loading greetings…</p>
  <p v-else-if="error" class="text-red-600">{{ error.message }}</p>
  <ul v-else class="mt-4 list-disc pl-6">
    <li v-for="greeting in data" :key="greeting._id">
      {{ greeting.message }}
    </li>
  </ul>

  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { convexQuery } from 'convex-vue-query'
import { api } from '~convex/_generated/api'

const { data, isPending, error } = useQuery(convexQuery(api.greetings.list, {}))
</script>
