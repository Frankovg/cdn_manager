<script setup lang="ts">
defineProps<{ open?: boolean }>()
</script>

<template>
  <aside
    class="fixed inset-0 z-30 w-full -translate-x-full border-r border-dark-primary bg-paper text-ink transition-transform duration-200 md:sticky md:inset-auto md:top-0 md:h-screen md:w-72 md:flex-none md:translate-x-0"
    :class="{ 'translate-x-0': open }"
  >
    <slot />
  </aside>
</template>
