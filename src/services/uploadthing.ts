import { generateVueHelpers } from '@uploadthing/vue'
import type { AnyFileRoute } from 'uploadthing/types'
import { PUBLIC_UPLOAD_ENDPOINT_URL } from 'astro:env/client'
// Keep this shape local so the browser project never has to import the server router module.
type UploadRouter = { imageUploader: AnyFileRoute }

/**
 * Typed, framework-neutral UploadThing helpers. The router is imported as a type only, so the
 * server token and Clerk secret can never be pulled into the Vite browser bundle.
 */
export const { useUploadThing } = generateVueHelpers<UploadRouter>({
  url: PUBLIC_UPLOAD_ENDPOINT_URL ?? '/api/upload',
})
