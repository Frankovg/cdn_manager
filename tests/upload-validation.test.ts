import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_SIZE_BYTES, validateImageFile } from '../src/services/upload-validation'

describe('immediate file validation', () => {
  it('accepts valid JPG, JPEG, PNG, WebP, and SVG files', () => {
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', 1)).not.toThrow()
    expect(() => validateImageFile('photo.JPEG', 'image/jpeg', 1)).not.toThrow()
    expect(() => validateImageFile('photo.png', 'image/png', MAX_IMAGE_SIZE_BYTES)).not.toThrow()
    expect(() => validateImageFile('photo.webp', 'image/webp', 1)).not.toThrow()
    expect(() => validateImageFile('logo.svg', 'image/svg+xml', 1)).not.toThrow()
  })

  it('rejects mismatched extensions or MIME types', () => {
    expect(() => validateImageFile('photo.gif', 'image/gif', 1)).toThrow('Only JPG, JPEG, PNG, WebP, and SVG')
    expect(() => validateImageFile('photo.png', 'image/jpeg', 1)).toThrow('Only JPG, JPEG, PNG, WebP, and SVG')
    expect(() => validateImageFile('logo.svg', 'image/png', 1)).toThrow('Only JPG, JPEG, PNG, WebP, and SVG')
  })

  it('rejects empty files or files larger than 4 MB', () => {
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', 0)).toThrow('at most 4 MB')
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', MAX_IMAGE_SIZE_BYTES + 1)).toThrow('at most 4 MB')
  })
})
