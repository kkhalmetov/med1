import { describe, expect, it } from 'vitest'
import { getPwaCacheDisposition } from '@/shared/pwa/cache-policy'

describe('PWA cache policy', () => {
  it.each([
    ['/api/auth/me', ''],
    ['/api/v1/chat/files/123', 'image'],
    ['/ru', 'document'],
    ['/patient/reports', 'document'],
  ])('never caches protected or navigational request %s', (pathname, destination) => {
    expect(getPwaCacheDisposition(pathname, destination)).toBe('network-only')
  })

  it.each([
    ['/_next/static/chunks/app-abc.js', 'script'],
    ['/icons/qadamm-q.svg', 'image'],
  ])('caches immutable application asset %s', (pathname, destination) => {
    expect(getPwaCacheDisposition(pathname, destination)).toBe('cache-first')
  })
})
