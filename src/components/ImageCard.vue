<template>
  <article class="group overflow-hidden border border-line bg-surface">
    <div class="relative aspect-square bg-zinc-100">
      <button
        class="group/image absolute inset-0 z-0 block size-full text-left focus-visible:outline-none"
        type="button"
        aria-label="Copiar URL"
        @click="emit('copy', image)"
      >
        <div v-if="isLoadingPreview" class="absolute inset-0 flex items-center justify-center">
          <LoaderCircleIcon :size="24" :stroke-width="1.8" class="animate-spin text-slate-500" />
        </div>
        <img
          :class="cn('size-full object-cover transition duration-300 group-hover:scale-[1.02]', { 'opacity-0': isLoadingPreview || failedPreview })"
          :src="image.publicUrl"
          :alt="image.title"
          loading="lazy"
          @load="isLoadingPreview = false"
          @error="handlePreviewError"
        />
        <span
          class="pointer-events-none absolute top-3 right-3 rounded-sm bg-ink px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover/image:opacity-100 group-focus-visible/image:opacity-100"
          role="tooltip"
        >
          Copiar URL
        </span>
      </button>
      <div v-if="failedPreview" class="absolute inset-0 grid place-items-center p-4 text-center text-xs text-muted">No se pudo previsualizar</div>
    </div>
    <div class="p-3 space-y-0.5">
      <h3 class="truncate font-medium" :title="image.title">
        {{ image.title }}
      </h3>
      <p class="truncate text-xs text-muted" :title="image.originalFilename">
        {{ image.originalFilename }}
      </p>
      <p class="truncate text-xs text-muted" :title="image.authorName || image.authorEmail || 'Autor desconocido'">
        {{ image.authorName || image.authorEmail || 'Autor desconocido' }}
      </p>
      <div class="min-w-0 space-y-0.5">
        <p class="truncate text-xs text-muted">{{ formatSize(image.sizeBytes) }}</p>
        <div class="flex items-center justify-between gap-1">
          <p class="truncate text-xs text-muted">{{ formatDate(image.uploadedAt) }}</p>
          <Button class="flex items-center gap-1" variant="outline" size="sm" type="button" @click="emit('open', image)">
            <EyeIcon :size="13" :stroke-width="1.8" />
            Ver
          </Button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyIcon, EyeIcon, LoaderCircleIcon } from 'lucide-vue-next'
import type { ImageRecord } from '@/services/convex'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

defineProps<{
  image: ImageRecord
}>()

const emit = defineEmits<{
  open: [image: ImageRecord]
  copy: [image: ImageRecord]
}>()

const failedPreview = ref(false)
const isLoadingPreview = ref(true)

function handlePreviewError() {
  failedPreview.value = true
  isLoadingPreview.value = false
}

function formatSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}
</script>
