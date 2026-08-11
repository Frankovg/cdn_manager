import { createRouteHandler, createUploadthing, UploadThingError, type FileRouter } from 'uploadthing/server'
import { CONVEX_ACTIONS_URL, UPLOADTHING_CALLBACK_SECRET, UPLOADTHING_TOKEN } from 'astro:env/server'
import { validateImageFile, validatePublicUploadThingUrl } from '../../convex/validation.js'

const f = createUploadthing()

async function authenticateUploadRequest(request: Request): Promise<{
  clerkUserId: string
  authorName?: string
  authorEmail?: string
}> {
  const authorization = request.headers.get('Authorization')
  if (!authorization) {
    throw new UploadThingError('You must sign in to upload images.')
  }
  try {
    const response = await fetch(`${CONVEX_ACTIONS_URL}/uploadthing-auth`, {
      headers: { Authorization: authorization },
    })
    if (!response.ok) {
      throw new Error('Convex rejected the session.')
    }
    const identity: unknown = await response.json()
    if (!identity || typeof identity !== 'object' || typeof (identity as { clerkUserId?: unknown }).clerkUserId !== 'string') {
      throw new Error('Convex did not return a valid identity.')
    }
    const user = identity as {
      clerkUserId: string
      authorName?: unknown
      authorEmail?: unknown
    }
    return {
      clerkUserId: user.clerkUserId,
      ...(typeof user.authorName === 'string' && user.authorName ? { authorName: user.authorName } : {}),
      ...(typeof user.authorEmail === 'string' && user.authorEmail ? { authorEmail: user.authorEmail } : {}),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Convex rejected the UploadThing session (origin: ${request.headers.get('origin') ?? 'no origin'}): ${message}`)
    throw new UploadThingError('The Clerk session is invalid, expired, or does not belong to this origin.')
  }
}

function readProjectId(request: Request): string {
  const projectId = request.headers.get('X-CDN-Project-ID')?.trim()
  if (!projectId) {
    throw new Error('Specify the project before uploading images.')
  }
  return projectId
}

async function persistCompletedUpload(payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${CONVEX_ACTIONS_URL}/uploadthing-complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPLOADTHING_CALLBACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`The uploaded image could not be recorded in Convex (${response.status}): ${detail}`)
  }
}

async function validateProjectExists(projectId: string): Promise<void> {
  const response = await fetch(`${CONVEX_ACTIONS_URL}/uploadthing-project`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPLOADTHING_CALLBACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId }),
  })
  if (!response.ok) {
    throw new UploadThingError('The selected project does not exist.')
  }
}

/** Server-only UploadThing endpoints served by Astro's /api/upload route. */
export const uploadRouter = {
  imageUploader: f({
    'image/jpeg': {
      maxFileSize: '4MB',
      acl: 'public-read',
      contentDisposition: 'inline',
    },
    'image/png': {
      maxFileSize: '4MB',
      acl: 'public-read',
      contentDisposition: 'inline',
    },
  })
    .middleware(async ({ req, files }) => {
      const user = await authenticateUploadRequest(req)
      const projectId = readProjectId(req)
      await validateProjectExists(projectId)
      for (const file of files) {
        validateImageFile(file.name, file.type, file.size)
      }
      return { ...user, projectId }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      validateImageFile(file.name, file.type, file.size)
      validatePublicUploadThingUrl(file.ufsUrl, file.key)
      await persistCompletedUpload({
        projectId: metadata.projectId,
        fileKey: file.key,
        publicUrl: file.ufsUrl,
        originalFilename: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        uploadedByClerkId: metadata.clerkUserId,
        ...(metadata.authorName ? { authorName: metadata.authorName } : {}),
        ...(metadata.authorEmail ? { authorEmail: metadata.authorEmail } : {}),
      })
      return { fileKey: file.key, ufsUrl: file.ufsUrl }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

const uploadThingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    token: UPLOADTHING_TOKEN,
  },
})

export async function handleUploadThingRequest(request: Request): Promise<Response> {
  return uploadThingHandler(request)
}
