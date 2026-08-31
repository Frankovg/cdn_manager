export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024
export const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] as const

const fileKeyPattern = /^[A-Za-z0-9._-]+$/
const extensionByMimeType: Record<(typeof ACCEPTED_IMAGE_MIME_TYPES)[number], readonly string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
}

function domainError(message: string): never {
  throw new Error(message)
}

export function normalizeRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim()
  if (!normalized) {
    domainError(`${fieldName} is required.`)
  }
  return normalized
}

export function validateImageFile(filename: string, mimeType: string, sizeBytes: number): void {
  const extensions = extensionByMimeType[mimeType as keyof typeof extensionByMimeType]
  const normalizedFilename = filename.trim().toLowerCase()

  if (!extensions || !extensions.some((extension) => normalizedFilename.endsWith(extension))) {
    domainError('Only JPG, JPEG, PNG, WebP, and SVG images are accepted.')
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    domainError('The file must be at most 4 MB.')
  }
}

export function validateFileKey(fileKey: string): void {
  if (!fileKeyPattern.test(fileKey)) {
    domainError('The UploadThing file key is invalid.')
  }
}

export function validatePublicUploadThingUrl(publicUrl: string, fileKey: string): void {
  validateFileKey(fileKey)

  let parsed: URL
  try {
    parsed = new URL(publicUrl)
  } catch {
    domainError('The UploadThing public URL is invalid.')
  }

  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.ufs.sh') || parsed.pathname !== `/f/${fileKey}` || parsed.search || parsed.hash) {
    domainError('The public URL does not match the stable UploadThing format.')
  }
}
