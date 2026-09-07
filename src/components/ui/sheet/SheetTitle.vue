<script setup lang="ts">
import type { DialogTitleProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { DialogTitle, useForwardProps } from 'reka-ui'
import { cn } from 'cn'

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogTitle v-bind="forwarded" :class="cn('text-foreground font-semibold', props.class)">
    <slot />
  </DialogTitle>
</template>
