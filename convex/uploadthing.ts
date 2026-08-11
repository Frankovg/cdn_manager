import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

interface CompletedUploadPayload {
  projectId: Id<'projects'>
  fileKey: string
  publicUrl: string
  originalFilename: string
  sizeBytes: number
  mimeType: string
  uploadedByClerkId: string
  authorName?: string
  authorEmail?: string
}

function requiredCallbackSecret(): string {
  const secret = process.env.UPLOADTHING_CALLBACK_SECRET
  if (!secret) {
    throw new Error('UPLOADTHING_CALLBACK_SECRET is missing in Convex.')
  }
  return secret
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const authenticate = httpAction(async (ctx, request) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return unauthorized()
  }
  return Response.json({
    clerkUserId: identity.subject,
    ...(identity.name || identity.preferredUsername ? { authorName: identity.name ?? identity.preferredUsername } : {}),
    ...(identity.email ? { authorEmail: identity.email } : {}),
  })
})

function isCompletedUploadPayload(value: unknown): value is CompletedUploadPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const payload = value as Record<string, unknown>
  return (
    typeof payload.projectId === 'string' &&
    typeof payload.fileKey === 'string' &&
    typeof payload.publicUrl === 'string' &&
    typeof payload.originalFilename === 'string' &&
    typeof payload.sizeBytes === 'number' &&
    typeof payload.mimeType === 'string' &&
    typeof payload.uploadedByClerkId === 'string' &&
    (payload.authorName === undefined || typeof payload.authorName === 'string') &&
    (payload.authorEmail === undefined || typeof payload.authorEmail === 'string')
  )
}

export const complete = httpAction(async (ctx, request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  if (request.headers.get('Authorization') !== `Bearer ${requiredCallbackSecret()}`) {
    return unauthorized()
  }

  try {
    const payload: unknown = await request.json()
    if (!isCompletedUploadPayload(payload)) {
      return new Response(JSON.stringify({ error: 'Invalid upload.' }), { status: 400 })
    }
    await ctx.runMutation(internal.images.recordCompletedUpload, payload)
    return new Response(null, { status: 204 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The upload could not be recorded.'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

export const validateProject = httpAction(async (ctx, request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  if (request.headers.get('Authorization') !== `Bearer ${requiredCallbackSecret()}`) {
    return unauthorized()
  }
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || typeof (body as { projectId?: unknown }).projectId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid project.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const project = await ctx.runQuery(internal.projects.getForUpload, { projectId: (body as { projectId: string }).projectId as Id<'projects'> })
    if (!project) {
      return new Response(JSON.stringify({ error: 'The project does not exist.' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(null, { status: 204 })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid project.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
})
