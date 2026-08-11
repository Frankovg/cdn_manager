<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue?: string
  type?: string
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    v-bind="$attrs"
    class="ui-input"
    :disabled="disabled"
    :placeholder="placeholder"
    :type="type ?? 'text'"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
