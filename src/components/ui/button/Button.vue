<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  { variant: "default", size: "default", type: "button", disabled: false },
);

const classes = computed(() => ({
  "ui-button": true,
  ["ui-button-" + props.variant]: true,
  ["ui-button-" + props.size]: true,
}));
</script>

<template>
  <button :class="classes" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>
