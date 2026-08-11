<template>
  <article class="group overflow-hidden border border-line bg-surface">
    <div class="relative aspect-square bg-zinc-100">
      <button
        class="absolute inset-0 z-0 block size-full text-left focus-visible:outline-none"
        type="button"
        :aria-label="`Ver detalles de ${image.title}`"
        @click="emit('open', image)"
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
      </button>
      <div v-if="failedPreview" class="absolute inset-0 grid place-items-center p-4 text-center text-xs text-muted">No se pudo previsualizar</div>
    </div>
    <div class="p-3">
      <h3 class="truncate font-medium" :title="image.title">
        {{ image.title }}
      </h3>
      <p class="mt-1 truncate text-xs text-muted" :title="image.originalFilename">
        {{ image.originalFilename }}
      </p>
      <p class="mt-2 truncate text-xs text-muted" :title="image.authorName || image.authorEmail || 'Autor desconocido'">
        {{ image.authorName || image.authorEmail || 'Autor desconocido' }}
      </p>
      <div class="mt-3 flex items-center justify-between gap-2">
        <p class="truncate text-[0.68rem] text-muted">{{ formatSize(image.sizeBytes) }} · {{ formatDate(image.uploadedAt) }}</p>
        <Button
          class="flex shrink-0 items-center gap-1 p-0 text-[0.68rem] font-semibold text-blue hover:underline"
          variant="link"
          size="sm"
          type="button"
          @click.stop="emit('copy', image)"
        >
          <CopyIcon :size="12" :stroke-width="1.8" />
          {{ copied ? 'Copiada' : 'Copiar URL' }}
        </Button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyIcon, LoaderCircleIcon } from 'lucide-vue-next'
import type { ImageRecord } from '@/services/convex'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

defineProps<{
  image: ImageRecord
  copied: boolean
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
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(timestamp)
}
</script>
