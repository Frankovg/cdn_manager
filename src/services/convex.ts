import { ConvexClient } from 'convex/browser'
import { anyApi } from 'convex/server'
import type { Id } from '../../convex/_generated/dataModel'

export interface AuthenticatedHealth {
  subject: string
  issuer: string
  authenticated: true
  name: string | null
  email: string | null
}

export interface Project {
  _id: Id<'projects'>
  name: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface ImageRecord {
  _id: Id<'images'>
  projectId: Id<'projects'>
  publicUrl: string
  fileKey: string
  uploadedByClerkId: string
  authorName?: string
  authorEmail?: string
  uploadedAt: number
  originalFilename: string
  sizeBytes: number
  mimeType: string
  title: string
  description?: string
}

type ClerkConvexGetToken = (options: {
  template: 'convex'
  skipCache: boolean
}) => Promise<string | null>

/**
 * Attach the Clerk JWT template to Convex. When Convex asks for a forced refresh
 * (expired/rejected token), skip Clerk's cache so a fresh JWT is issued.
 */
export function attachClerkToken(client: ConvexClient, getToken: ClerkConvexGetToken): void {
  client.setAuth(async ({ forceRefreshToken }) => {
    return getToken({
      template: 'convex',
      skipCache: forceRefreshToken,
    })
  })
}

/**
 * Minimal connectivity check used by the private smoke-test page. The function reference is
 * intentionally typed at the boundary so generated Convex code can evolve independently.
 */
export async function getAuthenticatedHealth(client: ConvexClient): Promise<AuthenticatedHealth> {
  return client.query(anyApi.health.authenticated, {}) as Promise<AuthenticatedHealth>
}

export async function getProjects(client: ConvexClient): Promise<Project[]> {
  return client.query(anyApi.projects.list, {}) as Promise<Project[]>
}

export async function createProject(client: ConvexClient, name: string): Promise<Id<'projects'>> {
  return client.mutation(anyApi.projects.create, { name }) as Promise<Id<'projects'>>
}

export async function getProjectsManagementPermission(client: ConvexClient): Promise<boolean> {
  return client.query(anyApi.projects.canManage, {}) as Promise<boolean>
}

export async function renameProject(client: ConvexClient, projectId: Id<'projects'>, name: string): Promise<void> {
  await client.mutation(anyApi.projects.rename, { projectId, name })
}

export async function getImages(client: ConvexClient, projectId: Id<'projects'>): Promise<ImageRecord[]> {
  return client.query(anyApi.images.listByProject, { projectId }) as Promise<ImageRecord[]>
}

export async function recordUploadedImage(
  client: ConvexClient,
  image: { projectId: Id<'projects'>; fileKey: string; publicUrl: string; originalFilename: string; sizeBytes: number; mimeType: string },
): Promise<Id<'images'>> {
  return client.mutation(anyApi.images.recordUploadedImage, image) as Promise<Id<'images'>>
}

export async function updateImageMetadata(
  client: ConvexClient,
  imageId: Id<'images'>,
  title: string,
  description?: string,
): Promise<void> {
  await client.mutation(anyApi.images.updateMetadata, { imageId, title, description })
}
