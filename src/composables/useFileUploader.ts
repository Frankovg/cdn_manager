import { computed, ref, watch, type Ref } from 'vue'
import { useAuth } from '@clerk/vue'
import { toast } from 'vue-sonner'
import { useUploadThing } from '@/services/uploadthing'
import { validateImageFile } from '@/services/upload-validation'

export interface UploadedFile {
  name: string
  ufsUrl: string
  key: string
  sizeBytes: number
  mimeType: string
}

export interface UploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
}

interface FileUploader {
  files: Ref<UploadItem[]>
  isUploading: Ref<boolean>
  addFiles: (incoming: File[]) => void
  clear: () => void
  retry: (item: UploadItem) => void
}

function validate(file: File): string | null {
  try {
    validateImageFile(file.name, file.type, file.size)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : 'El archivo no es válido.'
  }
}

export function useFileUploader(projectId: Ref<string>, onUploaded: (files: UploadedFile[], projectId: string) => void): FileUploader {
  const files = ref<UploadItem[]>([])
  const progress = ref(0)
  const { getToken } = useAuth()
  const uploadProjectId = ref(projectId.value)

  const { startUpload } = useUploadThing('imageUploader', {
    uploadProgressGranularity: 'fine',
    headers: async () => {
      const token = await getToken.value({ template: 'convex' })
      if (!token) {
        throw new Error('Tu sesión no es válida para subir imágenes.')
      }
      return {
        Authorization: `Bearer ${token}`,
        'X-CDN-Project-ID': uploadProjectId.value,
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

  function addFiles(incoming: File[]): void {
    const additions = incoming.map((file) => {
      const error = validate(file)
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        status: error ? ('error' as const) : ('pending' as const),
        progress: 0,
        ...(error ? { error } : {}),
      }
    })
    files.value = [...files.value, ...additions]
    void upload()
  }

  function clear(): void {
    files.value = []
  }

  watch(projectId, () => {
    clear()
    progress.value = 0
  })

  function retry(item: UploadItem): void {
    const error = validate(item.file)
    item.error = error ?? undefined
    item.status = error ? 'error' : 'pending'
    item.progress = 0
    if (!error) {
      void upload()
    }
  }

  const isUploading = ref(false)
  const readyFiles = computed(() => files.value.filter((item) => item.status === 'pending'))

  async function upload(): Promise<void> {
    if (!readyFiles.value.length || isUploading.value) {
      return
    }
    uploadProjectId.value = projectId.value
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
        onUploaded(successes, uploadProjectId.value)
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
      if (readyFiles.value.length) {
        void upload()
      }
    }
  }

  return {
    files,
    isUploading,
    addFiles,
    clear,
    retry,
  }
}
