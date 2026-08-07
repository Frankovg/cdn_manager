<template>
  <Sheet v-model:open="open">
    <SheetContent
      v-if="image"
      side="right"
      class="flex h-dvh w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-line bg-paper p-0 sm:max-w-[42rem] sm:border-l"
    >
      <SheetHeader
        class="shrink-0 border-b border-line px-5 py-4 pr-14 sm:px-7 sm:py-5"
      >
        <SheetTitle class="font-display text-xl font-medium"
          >Detalles de imagen</SheetTitle
        >
        <SheetDescription class="truncate text-xs text-muted">
          {{ image.originalFilename }}
        </SheetDescription>
      </SheetHeader>
      <form class="min-h-0 flex-1 overflow-y-auto" @submit.prevent="save">
        <div class="space-y-6 px-5 py-5 sm:px-7 sm:py-7">
          <div
            class="flex min-h-56 items-center justify-center overflow-hidden border border-line bg-zinc-100 sm:min-h-72"
          >
            <img
              class="max-h-[30rem] w-full object-contain"
              :src="image.publicUrl"
              :alt="image.title"
            />
          </div>
          <div class="grid gap-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <div class="space-y-4">
              <div>
                <p
                  class="mb-1 font-mono text-[0.62rem] tracking-[0.15em] text-muted uppercase"
                >
                  Propiedades
                </p>
                <p class="text-[0.68rem] text-muted">
                  Actualiza los metadatos descriptivos de esta imagen.
                </p>
              </div>
              <label class="block text-xs text-muted">
                Título
                <Input
                  v-model="editTitle"
                  class="mt-1.5"
                  type="text"
                  required
                />
              </label>
              <label class="block text-xs text-muted">
                Descripción
                <Textarea
                  v-model="editDescription"
                  class="mt-1.5 min-h-28"
                  rows="4"
                  placeholder="Añade una descripción opcional…"
                />
              </label>
              <p v-if="editError" class="text-xs text-coral" role="alert">
                {{ editError }}
              </p>
            </div>
            <dl
              class="space-y-3 border-t border-line pt-4 text-xs sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0"
            >
              <div>
                <dt class="text-[0.62rem] text-muted">Nombre original</dt>
                <dd class="mt-1 wrap-break-words text-ink">
                  {{ image.originalFilename }}
                </dd>
              </div>
              <div>
                <dt class="text-[0.62rem] text-muted">Tipo MIME</dt>
                <dd class="mt-1 wrap-break-word text-ink">
                  {{ image.mimeType }}
                </dd>
              </div>
              <div>
                <dt class="text-[0.62rem] text-muted">Tamaño</dt>
                <dd class="mt-1 text-ink">{{ formatSize(image.sizeBytes) }}</dd>
              </div>
              <div>
                <dt class="text-[0.62rem] text-muted">Subida</dt>
                <dd class="mt-1 text-ink">
                  {{ formatDate(image.uploadedAt) }}
                </dd>
              </div>
              <div>
                <dt class="text-[0.62rem] text-muted">Subida por</dt>
                <dd class="mt-1 wrap-break-word text-ink">
                  {{
                    image.authorName || image.authorEmail || "Autor desconocido"
                  }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <SheetFooter
          class="sticky bottom-0 mt-auto flex-row justify-end border-t border-line bg-paper px-5 py-3 sm:px-7"
        >
          <SheetClose as-child
            ><Button type="button" variant="outline" @click="cancel"
              >Cancelar</Button
            ></SheetClose
          >
          <Button
            type="button"
            variant="outline"
            @click.stop="emit('copy', image)"
            ><CopyIcon :size="13" :stroke-width="1.8" />{{
              copied ? "Copiada" : "Copiar URL"
            }}</Button
          >
          <Button type="submit" :disabled="saving">{{
            saving ? "Guardando…" : "Guardar cambios"
          }}</Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { CopyIcon } from "lucide-vue-next";
import type { ImageRecord } from "@/services/convex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const props = defineProps<{
  open: boolean;
  image: ImageRecord | null;
  copied: boolean;
  saveImage: (
    image: ImageRecord,
    title: string,
    description?: string,
  ) => Promise<void>;
}>();

const emit = defineEmits<{
  "update:open": [open: boolean];
  copy: [image: ImageRecord];
}>();

const open = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const editTitle = ref("");
const editDescription = ref("");
const editError = ref<string | null>(null);

watch(
  () => props.image,
  (image) => {
    if (image) {
      editTitle.value = image.title;
      editDescription.value = image.description ?? "";
      editError.value = null;
    }
  },
  { immediate: true },
);

function cancel(): void {
  open.value = false;
  editError.value = null;
}

const saving = ref(false);

async function save(): Promise<void> {
  if (!props.image) {
    return;
  }
  if (!editTitle.value.trim() || saving.value) {
    editError.value = "El título es obligatorio.";
    return;
  }
  saving.value = true;
  editError.value = null;
  try {
    await props.saveImage(props.image, editTitle.value, editDescription.value);
    open.value = false;
  } catch (error) {
    editError.value =
      error instanceof Error ? error.message : "No se pudo guardar.";
  } finally {
    saving.value = false;
  }
}

function formatSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`;
}
function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(
    timestamp,
  );
}
</script>
