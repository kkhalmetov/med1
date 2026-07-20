import { describe, expect, it } from 'vitest'
import { validateImageSelection } from '@/shared/media/image-pipeline'

function file(name: string, type: string, size: number) {
  return new File([new Uint8Array(size)], name, { type })
}

describe('image upload policy', () => {
  it('accepts browser JPEG, PNG and WebP within source limit', () => {
    expect(
      validateImageSelection(
        [file('a.jpg', 'image/jpeg', 10), file('b.webp', 'image/webp', 10)],
        5,
      ),
    ).toHaveLength(2)
  })

  it('rejects unsupported types, oversized sources and excessive count', () => {
    expect(() => validateImageSelection([file('a.gif', 'image/gif', 10)], 1)).toThrow(
      'UNSUPPORTED_IMAGE_TYPE',
    )
    expect(() =>
      validateImageSelection([file('a.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1)], 1),
    ).toThrow('IMAGE_TOO_LARGE')
    expect(() =>
      validateImageSelection([file('a.jpg', 'image/jpeg', 1), file('b.jpg', 'image/jpeg', 1)], 1),
    ).toThrow('TOO_MANY_IMAGES')
  })
})
