<template>
  <PaginationRoot v-slot="{ page, pageCount }" v-bind="props" @update:page="emits('update:page', $event)">
    <slot :page="page" :page-count="pageCount" />
  </PaginationRoot>
</template>

<script setup lang="ts">
import { PaginationRoot, type PaginationRootEmits, type PaginationRootProps } from 'reka-ui'

const props = defineProps<PaginationRootProps>()
const emits = defineEmits<PaginationRootEmits>()
</script>
