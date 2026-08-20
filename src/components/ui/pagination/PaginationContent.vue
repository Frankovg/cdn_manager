<template>
  <PaginationList v-slot="{ items }" as="ul" class="flex flex-row items-center gap-1">
    <slot :items="items" />
  </PaginationList>
</template>

<script setup lang="ts">
import { PaginationList } from 'reka-ui'
</script>
