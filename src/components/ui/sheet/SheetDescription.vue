<script setup lang="ts">
import type { DialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { DialogDescription, useForwardProps } from 'reka-ui'
import { cn } from 'cn'

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogDescription v-bind="forwarded" :class="cn('text-muted-foreground text-sm', props.class)">
    <slot />
  </DialogDescription>
</template>
