<template>
  <PaginationNextPrimitive
    class="inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
  >
    Siguiente
    <ChevronRightIcon class="size-4" />
  </PaginationNextPrimitive>
</template>

<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'
import { PaginationNext as PaginationNextPrimitive } from 'reka-ui'
</script>
