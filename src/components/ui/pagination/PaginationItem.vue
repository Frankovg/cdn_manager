<template>
  <PaginationListItem
    :value="value"
    :class="{
      'inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground': true,
      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground': isActive,
    }"
  >
    <slot />
  </PaginationListItem>
</template>

<script setup lang="ts">
import { PaginationListItem } from 'reka-ui'

withDefaults(
  defineProps<{
    isActive?: boolean
    value: number
  }>(),
  { isActive: false },
)
</script>
