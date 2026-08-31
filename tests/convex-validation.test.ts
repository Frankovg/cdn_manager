import { describe, expect, it } from 'vitest'
import type { UserIdentity } from 'convex/server'
import { hasProjectsPermission } from '../convex/auth'
import { MAX_IMAGE_SIZE_BYTES, normalizeRequiredText, validateImageFile, validatePublicUploadThingUrl } from '../convex/validation'

function identity(claims: Record<string, unknown> = {}): UserIdentity {
  return {
    tokenIdentifier: 'https://clerk.example|user_123',
    subject: 'user_123',
    issuer: 'https://clerk.example',
    ...claims,
  }
}

describe('project permission', () => {
  it('only accepts the projects: true boolean issued by Clerk', () => {
    expect(hasProjectsPermission(identity({ projects: true }))).toBe(true)
    expect(hasProjectsPermission(identity({ projects: 'true' }))).toBe(false)
    expect(hasProjectsPermission(identity({ projects: false }))).toBe(false)
    expect(hasProjectsPermission(identity({ public_metadata: { projects: true } }))).toBe(false)
    expect(hasProjectsPermission(identity())).toBe(false)
  })
})

describe('image validation', () => {
  it('accepts JPG, JPEG, PNG, WebP, and SVG files up to 4 MB', () => {
    expect(() => validateImageFile('foto.jpg', 'image/jpeg', MAX_IMAGE_SIZE_BYTES)).not.toThrow()
    expect(() => validateImageFile('foto.JPEG', 'image/jpeg', 1)).not.toThrow()
    expect(() => validateImageFile('foto.png', 'image/png', 1)).not.toThrow()
    expect(() => validateImageFile('foto.webp', 'image/webp', 1)).not.toThrow()
    expect(() => validateImageFile('logo.svg', 'image/svg+xml', 1)).not.toThrow()
  })

  it('rejects unsupported MIME types, extensions, and file sizes', () => {
    expect(() => validateImageFile('photo.gif', 'image/gif', 1)).toThrow('Only JPG, JPEG, PNG, WebP, and SVG')
    expect(() => validateImageFile('photo.png', 'image/jpeg', 1)).toThrow('Only JPG, JPEG, PNG, WebP, and SVG')
    expect(() => validateImageFile('logo.svg', 'image/png', 1)).toThrow('Only JPG, JPEG, PNG, WebP, and SVG')
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', MAX_IMAGE_SIZE_BYTES + 1)).toThrow('at most 4 MB')
  })

  it('only accepts stable public URLs matching the file key', () => {
    expect(() => validatePublicUploadThingUrl('https://app-id.ufs.sh/f/file_123.jpg', 'file_123.jpg')).not.toThrow()
    expect(() => validatePublicUploadThingUrl('https://app-id.ufs.sh/f/other.jpg', 'file_123.jpg')).toThrow('does not match the stable UploadThing format')
  })

  it('normalizes required fields and rejects whitespace', () => {
    expect(normalizeRequiredText('  Title  ', 'Title')).toBe('Title')
    expect(() => normalizeRequiredText('   ', 'Title')).toThrow('Title is required')
  })
})
