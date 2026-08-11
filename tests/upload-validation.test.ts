import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_SIZE_BYTES, validateImageFile } from '../src/services/upload-validation'

describe('immediate file validation', () => {
  it('accepts valid JPG, JPEG, and PNG files', () => {
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', 1)).not.toThrow()
    expect(() => validateImageFile('photo.JPEG', 'image/jpeg', 1)).not.toThrow()
    expect(() => validateImageFile('photo.png', 'image/png', MAX_IMAGE_SIZE_BYTES)).not.toThrow()
  })

  it('rejects mismatched extensions or MIME types', () => {
    expect(() => validateImageFile('photo.gif', 'image/gif', 1)).toThrow('Only JPG, JPEG, and PNG')
    expect(() => validateImageFile('photo.png', 'image/jpeg', 1)).toThrow('Only JPG, JPEG, and PNG')
  })

  it('rejects empty files or files larger than 4 MB', () => {
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', 0)).toThrow('at most 4 MB')
    expect(() => validateImageFile('photo.jpg', 'image/jpeg', MAX_IMAGE_SIZE_BYTES + 1)).toThrow('at most 4 MB')
  })
})
