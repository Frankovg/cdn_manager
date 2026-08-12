import { ref, watch, type Ref } from 'vue'
import type { ConvexClient } from 'convex/browser'
import { toast } from 'vue-sonner'
import type { Id } from '../../convex/_generated/dataModel'
import type { UploadedFile } from '@/components/FileUploader.vue'
import { getImages, recordUploadedImage, updateImageMetadata, type ImageRecord } from '@/services/convex'

interface ImageLibrary {
  images: Ref<ImageRecord[]>
  imagesLoading: Ref<boolean>
  imagesError: Ref<string | null>
  loadImages: () => Promise<void>
  handleUploaded: (uploaded: UploadedFile[]) => Promise<void>
  saveImage: (image: ImageRecord, title: string, description?: string) => Promise<void>
}

function getErrorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback
}

function isOptimisticProjectId(projectId: Id<'projects'> | ''): boolean {
  return projectId.startsWith('optimistic-project-')
}

export function useImageLibrary(convex: ConvexClient, selectedProjectId: Ref<Id<'projects'> | ''>): ImageLibrary {
  const images = ref<ImageRecord[]>([])
  const imagesLoading = ref(false)
  const imagesError = ref<string | null>(null)

  function resetImages(): void {
    images.value = []
    imagesLoading.value = false
    imagesError.value = null
  }

  async function loadImages(): Promise<void> {
    const projectId = selectedProjectId.value
    if (!projectId || isOptimisticProjectId(projectId)) {
      resetImages()
      return
    }
    imagesLoading.value = true
    imagesError.value = null
    try {
      const loadedImages = await getImages(convex, projectId)
      if (selectedProjectId.value === projectId) {
        images.value = loadedImages
      }
    } catch (reason) {
      if (selectedProjectId.value === projectId) {
        imagesError.value = getErrorMessage(reason, 'No se pudieron cargar las imágenes.')
      }
    } finally {
      if (selectedProjectId.value === projectId) {
        imagesLoading.value = false
      }
    }
  }

  async function handleUploaded(uploaded: UploadedFile[]): Promise<void> {
    if (!selectedProjectId.value) {
      return
    }
    const failed: string[] = []

    for (const file of uploaded) {
      try {
        await recordUploadedImage(convex, {
          projectId: selectedProjectId.value,
          fileKey: file.key,
          publicUrl: file.ufsUrl,
          originalFilename: file.name,
          sizeBytes: file.sizeBytes,
          mimeType: file.mimeType,
        })
      } catch {
        failed.push(file.name)
      }
    }

    await loadImages()

    const registered = uploaded.length - failed.length
    if (failed.length) {
      toast.error('No se pudieron registrar: ' + failed.join(', '), {
        duration: 3500,
      })
    }

    if (!registered) {
      return
    }
    if (registered === 1 && !failed.length) {
      try {
        await navigator.clipboard.writeText(uploaded[0].ufsUrl)
        toast.success('URL copiada automáticamente', { duration: 2500 })
      } catch {
        toast.success('Imagen registrada', {
          description: 'Copia la URL desde su tarjeta.',
          duration: 2500,
        })
      }
      return
    }

    toast.success(registered === 1 ? 'Imagen registrada' : `${registered} imágenes registradas`, { duration: 2500 })
  }

  async function saveImage(image: ImageRecord, title: string, description?: string): Promise<void> {
    const previousTitle = image.title
    const previousDescription = image.description
    const nextTitle = title.trim()
    const nextDescription = description?.trim() || undefined

    image.title = nextTitle
    image.description = nextDescription

    try {
      await updateImageMetadata(convex, image._id, image.projectId, nextTitle, nextDescription)
      toast.success('Metadatos guardados', { duration: 2500 })
    } catch (reason) {
      image.title = previousTitle
      image.description = previousDescription
      const message = getErrorMessage(reason, 'No se pudieron guardar los metadatos.')
      toast.error(message, { duration: 3500 })
      throw reason
    }
  }

  watch(selectedProjectId, (projectId, previousProjectId) => {
    if (isOptimisticProjectId(previousProjectId) && projectId && !isOptimisticProjectId(projectId)) {
      resetImages()
      return
    }
    void loadImages()
  })

  return {
    images,
    imagesLoading,
    imagesError,
    loadImages,
    handleUploaded,
    saveImage,
  }
}
