import { ref, watch, type Ref } from "vue";
import type { ConvexClient } from "convex/browser";
import { toast } from "vue-sonner";
import type { Id } from "../../convex/_generated/dataModel";
import type { UploadedFile } from "@/components/FileUploader.vue";
import {
  getImages,
  recordUploadedImage,
  updateImageMetadata,
  type ImageRecord,
} from "@/services/convex";

interface ImageLibrary {
  images: Ref<ImageRecord[]>;
  imagesLoading: Ref<boolean>;
  imagesError: Ref<string | null>;
  loadImages: () => Promise<void>;
  handleUploaded: (uploaded: UploadedFile[]) => Promise<void>;
  saveImage: (
    image: ImageRecord,
    title: string,
    description?: string,
  ) => Promise<void>;
}

function getErrorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback;
}

export function useImageLibrary(
  convex: ConvexClient | null,
  selectedProjectId: Ref<Id<"projects"> | "">,
): ImageLibrary {
  const images = ref<ImageRecord[]>([]);
  const imagesLoading = ref(false);
  const imagesError = ref<string | null>(null);

  async function loadImages(): Promise<void> {
    if (!convex || !selectedProjectId.value) {
      images.value = [];
      imagesError.value = null;
      return;
    }
    imagesLoading.value = true;
    imagesError.value = null;
    try {
      images.value = await getImages(convex, selectedProjectId.value);
    } catch (reason) {
      imagesError.value = getErrorMessage(
        reason,
        "No se pudieron cargar las imágenes.",
      );
    } finally {
      imagesLoading.value = false;
    }
  }

  async function handleUploaded(uploaded: UploadedFile[]): Promise<void> {
    if (!convex || !selectedProjectId.value) {
      return;
    }
    const failed: string[] = [];

    for (const file of uploaded) {
      try {
        await recordUploadedImage(convex, {
          projectId: selectedProjectId.value,
          fileKey: file.key,
          publicUrl: file.ufsUrl,
          originalFilename: file.name,
          sizeBytes: file.sizeBytes,
          mimeType: file.mimeType,
        });
      } catch {
        failed.push(file.name);
      }
    }

    await loadImages();

    const registered = uploaded.length - failed.length;
    if (failed.length) {
      toast.error("No se pudieron registrar: " + failed.join(", "), {
        duration: 3500,
      });
    }

    if (!registered) {
      return;
    }
    if (registered === 1 && !failed.length) {
      try {
        await navigator.clipboard.writeText(uploaded[0].ufsUrl);
        toast.success("URL copiada automáticamente", { duration: 2500 });
      } catch {
        toast.success("Imagen registrada", {
          description: "Copia la URL desde su tarjeta.",
          duration: 2500,
        });
      }
      return;
    }

    toast.success(
      registered === 1
        ? "Imagen registrada"
        : `${registered} imágenes registradas`,
      { duration: 2500 },
    );
  }

  async function saveImage(
    image: ImageRecord,
    title: string,
    description?: string,
  ): Promise<void> {
    if (!convex) {
      return;
    }
    try {
      await updateImageMetadata(convex, image._id, title, description);
      const current = images.value.find((item) => item._id === image._id);
      if (current) {
        current.title = title.trim();
        current.description = description?.trim() || undefined;
      }
      toast.success("Metadatos guardados", { duration: 2500 });
    } catch (reason) {
      const message = getErrorMessage(
        reason,
        "No se pudieron guardar los metadatos.",
      );
      toast.error(message, { duration: 3500 });
      throw reason;
    }
  }

  watch(selectedProjectId, () => {
    void loadImages();
  });

  return {
    images,
    imagesLoading,
    imagesError,
    loadImages,
    handleUploaded,
    saveImage,
  };
}
