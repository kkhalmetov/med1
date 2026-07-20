import { describe, expect, it } from 'vitest'
import { pollingAllowed } from '@/features/chat/polling'

describe('chat polling lifecycle', () => {
  it.each([
    ['visible', true, true],
    ['visible', false, false],
    ['hidden', true, false],
    ['hidden', false, false],
  ] as const)('visibility=%s online=%s permits=%s', (visibility, online, expected) => {
    expect(pollingAllowed(visibility, online)).toBe(expected)
  })
})
