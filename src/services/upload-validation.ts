export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024

const extensionsByMime: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function validateImageFile(name: string, type: string, size: number): void {
  const extensions = extensionsByMime[type]
  if (!extensions || !extensions.some((extension) => name.toLowerCase().endsWith(extension))) {
    throw new Error('Only JPG, JPEG, PNG, and WebP images are accepted.')
  }
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('The file must be at most 4 MB.')
  }
}
