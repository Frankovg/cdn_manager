<template>
  <section class="border border-line bg-surface p-5 md:p-6">
    <div
      class="border border-dashed p-6 text-center transition md:p-10"
      :class="{
        'border-mint bg-mint/5': isDragging,
        'border-line bg-paper': !isDragging,
      }"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="dropFiles"
    >
      <p class="mb-2 hidden font-display text-xl md:block">Arrastra tus imágenes aquí</p>
      <p class="font-mono mb-2 text-sm text-muted">JPG · PNG · WebP · SVG · Max 4MB</p>
      <input
        ref="fileInput"
        class="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg"
        multiple
        @change="selectFiles"
      />
      <Button variant="outline" type="button" @click="openFilePicker">Elegir archivos</Button>
    </div>

    <div v-if="files.length" class="mt-5 space-y-2" aria-live="polite">
      <div v-for="item in files" :key="item.id" class="flex items-center gap-3 border-b border-line py-2 text-sm">
        <span class="grid size-7 shrink-0 place-items-center bg-mint/10 text-mint">
          <UploadIcon :size="14" :stroke-width="1.8" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ item.file.name }}</p>
          <p class="text-xs text-muted">{{ formatSize(item.file.size) }}</p>
          <p v-if="item.error" class="truncate text-xs text-pink">
            {{ item.error }}
          </p>
          <div v-if="item.status === 'uploading'" class="mt-1 h-1 bg-raised">
            <div class="h-1 bg-mint transition-all" :style="{ width: `${item.progress}%` }" />
          </div>
        </div>
        <span class="text-xs" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
        <Button v-if="item.status === 'error'" variant="link" size="sm" type="button" @click="retry(item)">
          <RefreshCwIcon :size="13" :stroke-width="1.8" />
          Reintentar
        </Button>
      </div>
    </div>

    <div v-if="files.length" class="mt-5 flex flex-wrap items-center justify-end gap-3">
      <Button v-if="files.length && !isUploading" variant="outline" type="button" @click="clear">Limpiar selección</Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { RefreshCwIcon, UploadIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useFileUploader, type UploadedFile, type UploadItem } from '@/composables/useFileUploader'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{ uploaded: [files: UploadedFile[], projectId: string] }>()

const { files, isUploading, addFiles, clear, retry } = useFileUploader(toRef(props, 'projectId'), (uploaded, projectId) => {
  emit('uploaded', uploaded, projectId)
})

const fileInput = ref<HTMLInputElement | null>(null)

function openFilePicker(): void {
  if (!fileInput.value) {
    throw new Error('file input is not mounted.')
  }
  fileInput.value.click()
}

function selectFiles(event: Event): void {
  const input = event.target as HTMLInputElement
  addFiles(input.files ? Array.from(input.files) : [])
  input.value = ''
}

const isDragging = ref(false)

function dropFiles(event: DragEvent): void {
  isDragging.value = false
  addFiles(event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [])
}

watch(
  () => props.projectId,
  () => {
    isDragging.value = false
  },
)

function formatSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`
}

function statusLabel(status: UploadItem['status']): string {
  return {
    pending: 'Pendiente',
    uploading: 'Subiendo',
    completed: 'Completado',
    error: 'Error',
  }[status]
}

function statusClass(status: UploadItem['status']): string {
  return {
    pending: 'text-muted',
    uploading: 'text-warning',
    completed: 'text-mint',
    error: 'text-pink',
  }[status]
}
</script>
