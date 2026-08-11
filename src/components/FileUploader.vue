<template>
  <section class="border border-line bg-surface p-5 md:p-6">
    <div
      class="border border-dashed p-6 text-center transition md:p-10"
      :class="{
        'border-blue bg-blue/5': isDragging,
        'border-line bg-paper': !isDragging,
      }"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="dropFiles"
    >
      <p class="mb-2 hidden font-display text-xl md:block">Arrastra tus imágenes aquí</p>
      <p class="mb-2 text-sm text-muted">Puedes elegir hasta 10 archivos de una vez.</p>
      <p class="font-mono mb-2 text-sm text-muted">JPG · PNG · Max 4MB</p>
      <input ref="fileInput" class="sr-only" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple @change="selectFiles" />
      <Button variant="outline" type="button" @click="openFilePicker">Elegir archivos</Button>
    </div>

    <div v-if="files.length" class="mt-5 space-y-2" aria-live="polite">
      <div v-for="item in files" :key="item.id" class="flex items-center gap-3 border-b border-line py-2 text-sm">
        <span class="grid size-7 shrink-0 place-items-center bg-blue/10 text-blue">
          <UploadIcon :size="14" :stroke-width="1.8" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ item.file.name }}</p>
          <p class="text-xs text-muted">{{ formatSize(item.file.size) }}</p>
          <p v-if="item.error" class="truncate text-xs text-coral">
            {{ item.error }}
          </p>
          <div v-if="item.status === 'uploading'" class="mt-1 h-1 bg-zinc-100">
            <div class="h-1 bg-blue transition-all" :style="{ width: `${item.progress}%` }" />
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
      <Button
        v-if="readyFiles.length || isUploading"
        class="disabled:pointer-events-none disabled:opacity-50"
        type="button"
        :disabled="!readyFiles.length || isUploading"
        @click="upload"
      >
        {{ isUploading ? `Subiendo ${Math.round(progress)}%…` : 'Subir selección' }}
      </Button>
      <Button v-if="files.length && !isUploading" variant="ghost" type="button" @click="clear">Limpiar selección</Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '@clerk/vue'
import { RefreshCwIcon, UploadIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useUploadThing } from '@/services/uploadthing'
import { validateImageFile } from '@/services/upload-validation'
import { Button } from '@/components/ui/button'

interface UploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
}

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{ uploaded: [files: UploadedFile[]] }>()

export interface UploadedFile {
  name: string
  ufsUrl: string
  key: string
  sizeBytes: number
  mimeType: string
}

const files = ref<UploadItem[]>([])
const progress = ref(0)
const { getToken } = useAuth()
const { startUpload } = useUploadThing('imageUploader', {
  uploadProgressGranularity: 'fine',
  headers: async () => {
    const token = await getToken.value({ template: 'convex' })
    if (!token) {
      throw new Error('Tu sesión no es válida para subir imágenes.')
    }
    return {
      Authorization: `Bearer ${token}`,
      'X-CDN-Project-ID': props.projectId,
    }
  },
  onUploadProgress: (value) => {
    progress.value = value
    files.value.forEach((item) => {
      if (item.status === 'uploading') {
        item.progress = value
      }
    })
  },
})

function formatSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`
}

function validate(file: File): string | null {
  try {
    validateImageFile(file.name, file.type, file.size)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : 'El archivo no es válido.'
  }
}

function addFiles(incoming: File[]): void {
  const additions = incoming.slice(0, 10).map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    status: validate(file) ? ('error' as const) : ('pending' as const),
    progress: 0,
    ...(validate(file) ? { error: validate(file) ?? undefined } : {}),
  }))
  files.value = [...files.value, ...additions]
  if (incoming.length > 10) {
    toast.warning('Solo se pueden subir 10 archivos por lote.', {
      duration: 3500,
    })
  }
}

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

function clear(): void {
  files.value = []
}

function retry(item: UploadItem): void {
  const error = validate(item.file)
  item.error = error ?? undefined
  item.status = error ? 'error' : 'pending'
  item.progress = 0
}

const isUploading = ref(false)
const readyFiles = computed(() => files.value.filter((item) => item.status === 'pending' || item.status === 'error'))

async function upload(): Promise<void> {
  if (!readyFiles.value.length || isUploading.value) {
    return
  }
  const batch = readyFiles.value.filter((item) => !validate(item.file))
  if (!batch.length) {
    return
  }
  batch.forEach((item) => {
    item.progress = 0
    item.error = undefined
  })
  isUploading.value = true
  progress.value = 0
  try {
    const successes: UploadedFile[] = []
    for (const item of batch) {
      item.status = 'uploading'
      item.progress = 0
      try {
        const uploaded = await startUpload([item.file])
        const result = uploaded?.[0]
        if (!result) {
          throw new Error('UploadThing no devolvió el archivo.')
        }
        item.status = 'completed'
        item.progress = 100
        successes.push({
          name: result.name,
          ufsUrl: result.ufsUrl,
          key: result.key,
          sizeBytes: result.size,
          mimeType: result.type,
        })
      } catch (reason) {
        item.status = 'error'
        item.error = reason instanceof Error ? reason.message : 'No se pudo subir el archivo.'
      }
    }
    if (successes.length) {
      emit('uploaded', successes)
    }
    const errors = files.value.filter((item) => item.status === 'error').length
    if (errors) {
      toast.error(successes.length ? `${successes.length} completadas · ${errors} con error.` : 'No se pudieron subir las imágenes.', {
        duration: 3500,
      })
    }
  } catch (error) {
    batch.forEach((item) => {
      item.status = 'error'
      item.error = error instanceof Error ? error.message : 'Falló la subida.'
    })
    toast.error(error instanceof Error ? error.message : 'No se pudieron subir las imágenes.', {
      duration: 3500,
    })
  } finally {
    isUploading.value = false
  }
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
    uploading: 'text-blue',
    completed: 'text-green-700',
    error: 'text-coral',
  }[status]
}
</script>
