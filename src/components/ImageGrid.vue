<template>
  <section class="mt-8">
    <div class="mb-5 space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            class="mb-1 font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase"
          >
            Catálogo de {{ projectName }}
          </p>
          <h2 class="font-display text-2xl font-medium">
            {{ filteredImages.length }} imagenes
          </h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label class="relative min-w-64 text-xs text-muted">
            <SearchIcon
              class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted"
              :size="15"
              :stroke-width="1.8"
              aria-hidden="true"
            />
            <Input
              v-model="search"
              type="search"
              class="pl-9"
              placeholder="Título, descripción o archivo…"
            />
          </label>
          <ImageDateFilterDialog
            v-model:open="dateDialogOpen"
            :date-range="appliedDateRange"
            @apply="applyDateRange"
          />
        </div>
      </div>
      <div v-if="dateRangeLabel" class="flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink"
        >
          {{ dateRangeLabel }}
          <button
            class="inline-flex size-4 items-center justify-center rounded-full text-muted transition hover:bg-zinc-100 hover:text-ink"
            type="button"
            aria-label="Quitar filtro de fecha"
            @click="clearDateRange"
          >
            <XIcon :size="12" :stroke-width="2" />
          </button>
        </span>
      </div>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
      aria-live="polite"
    >
      <div
        v-for="index in 8"
        :key="index"
        class="aspect-square animate-pulse bg-zinc-200"
      />
    </div>
    <div
      v-else-if="error"
      class="border border-red-200 bg-red-50 p-5 text-sm text-red-800"
      role="alert"
    >
      {{ error }}
    </div>
    <div
      v-else-if="!images.length"
      class="border border-dashed border-line bg-surface p-10 text-center"
    >
      <p class="font-display text-xl">Este proyecto todavía está vacío.</p>
      <p class="mt-2 text-sm text-muted">
        Sube la primera imagen para empezar a construir la biblioteca.
      </p>
    </div>
    <div
      v-else-if="!filteredImages.length"
      class="border border-dashed border-line bg-surface p-10 text-center"
    >
      <p class="font-display text-xl">No hay coincidencias.</p>
      <p class="mt-2 text-sm text-muted">
        Prueba con otro título, descripción, nombre de archivo o rango de
        fechas.
      </p>
    </div>
    <div
      v-else
      class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
    >
      <ImageCard
        v-for="image in filteredImages"
        :key="image._id"
        :image="image"
        :copied="copiedId === image._id"
        @open="openImageDetails"
        @copy="copyUrl"
      />
    </div>

    <ImageDetailsSheet
      v-model:open="imageSheetOpen"
      :image="selectedImage"
      :copied="selectedImage ? copiedId === selectedImage._id : false"
      :save-image="saveImage"
      @copy="copyUrl"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from "vue";
import type { DateRange } from "reka-ui";
import { getLocalTimeZone } from "@internationalized/date";
import { SearchIcon, XIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { Id } from "../../convex/_generated/dataModel";
import type { ImageRecord } from "@/services/convex";
import { Input } from "@/components/ui/input";
import ImageCard from "@/components/ImageCard.vue";
import ImageDateFilterDialog from "@/components/ImageDateFilterDialog.vue";
import ImageDetailsSheet from "@/components/ImageDetailsSheet.vue";

const props = defineProps<{
  images: ImageRecord[];
  loading: boolean;
  error: string | null;
  projectName: string;
  saveImage: (
    image: ImageRecord,
    title: string,
    description?: string,
  ) => Promise<void>;
}>();

const dateDialogOpen = ref(false);
const appliedDateRange = ref(emptyDateRange()) as Ref<DateRange>;

const hasDateRange = computed(() =>
  Boolean(appliedDateRange.value.start && appliedDateRange.value.end),
);

const dateRangeLabel = computed(() => {
  const { start, end } = appliedDateRange.value;
  if (!start || !end) return null;
  const formatter = new Intl.DateTimeFormat("es", { dateStyle: "medium" });
  const timeZone = getLocalTimeZone();
  return `${formatter.format(start.toDate(timeZone))} – ${formatter.format(end.toDate(timeZone))}`;
});

const search = ref("");

const filteredImages = computed(() => {
  const query = search.value.trim().toLowerCase();
  return props.images.filter((image) => {
    if (
      hasDateRange.value &&
      !isUploadedInRange(image.uploadedAt, appliedDateRange.value)
    )
      return false;
    if (!query) return true;
    return [image.title, image.description, image.originalFilename].some(
      (value) => value?.toLowerCase().includes(query),
    );
  });
});

function emptyDateRange(): DateRange {
  return { start: undefined, end: undefined };
}

function applyDateRange(range: DateRange): void {
  appliedDateRange.value = range;
}

function clearDateRange(): void {
  appliedDateRange.value = emptyDateRange();
}

function isUploadedInRange(uploadedAt: number, range: DateRange): boolean {
  if (!range.start || !range.end) return true;
  const timeZone = getLocalTimeZone();
  const start = range.start.toDate(timeZone).getTime();
  const end = range.end.toDate(timeZone).getTime() + 24 * 60 * 60 * 1000 - 1;
  return uploadedAt >= start && uploadedAt <= end;
}

const imageSheetOpen = ref(false);
const selectedImage = ref<ImageRecord | null>(null);

function openImageDetails(image: ImageRecord): void {
  selectedImage.value = image;
  imageSheetOpen.value = true;
}

const copiedId = ref<Id<"images"> | null>(null);

async function copyUrl(image: ImageRecord): Promise<void> {
  try {
    await navigator.clipboard.writeText(image.publicUrl);
  } catch {
    const input = document.createElement("input");
    input.value = image.publicUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  toast.success("URL copiada", { duration: 2200 });
  copiedId.value = image._id;
  window.setTimeout(() => {
    if (copiedId.value === image._id) copiedId.value = null;
  }, 1800);
}
</script>
