<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{ modelValue?: string; disabled?: boolean; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    v-bind="$attrs"
    class="ui-textarea"
    :disabled="disabled"
    :placeholder="placeholder"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
