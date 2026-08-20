<template>
  <PaginationPrevPrimitive
    class="inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
  >
    <ChevronLeftIcon class="size-4" />
    Anterior
  </PaginationPrevPrimitive>
</template>

<script setup lang="ts">
import { ChevronLeftIcon } from 'lucide-vue-next'
import { PaginationPrev as PaginationPrevPrimitive } from 'reka-ui'
</script>
