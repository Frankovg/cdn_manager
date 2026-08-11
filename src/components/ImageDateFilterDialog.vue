<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button type="button" variant="outline" size="sm" class="h-10 min-h-10 text-muted hover:text-primary">
        <CalendarIcon :size="14" :stroke-width="1.8" />
        Fecha
      </Button>
    </DialogTrigger>
    <DialogContent
      class="flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 top-0 left-0 flex-col rounded-none p-4 sm:h-auto sm:max-h-[min(90dvh,52rem)] sm:w-auto sm:max-w-fit sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
      :show-close-button="false"
    >
      <DialogHeader class="pr-0">
        <DialogTitle>Fecha de subida</DialogTitle>
        <DialogDescription>Elige el rango para filtrar las imágenes.</DialogDescription>
      </DialogHeader>
      <div class="min-h-0 flex-1 overflow-auto">
        <RangeCalendar v-model="draftDateRange" class="w-full sm:mx-auto sm:w-fit" locale="es" :number-of-months="2" disable-days-outside-current-view />
      </div>
      <DialogFooter class="mt-auto rounded-none sm:rounded-b-xl">
        <Button type="button" variant="outline" @click="open = false">Cerrar</Button>
        <Button type="button" :disabled="!canAcceptDateRange" @click="acceptDateRange">Aceptar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import type { DateRange } from 'reka-ui'
import { CalendarIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RangeCalendar } from '@/components/ui/range-calendar'

const props = defineProps<{
  open: boolean
  dateRange: DateRange
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  apply: [range: DateRange]
}>()

const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})
const draftDateRange = ref(emptyDateRange()) as Ref<DateRange>
const canAcceptDateRange = computed(() => {
  return Boolean(draftDateRange.value.start && draftDateRange.value.end)
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draftDateRange.value = {
        start: props.dateRange.start,
        end: props.dateRange.end,
      }
    }
  },
)

function emptyDateRange(): DateRange {
  return { start: undefined, end: undefined }
}

function acceptDateRange(): void {
  if (!canAcceptDateRange.value) {
    return
  }
  emit('apply', {
    start: draftDateRange.value.start,
    end: draftDateRange.value.end,
  })
  open.value = false
}
</script>
