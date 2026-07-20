import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveBackendOperation } from '@/server/backend/policy'
import { proxyBackendRequest } from '@/server/backend/proxy'

afterEach(() => vi.unstubAllGlobals())

describe('protected binary proxy', () => {
  it('preserves bytes, media type and download filename', async () => {
    const fixture = new Uint8Array([0, 1, 2, 127, 128, 254, 255])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(fixture, {
          headers: {
            'content-type': 'application/pdf',
            'content-disposition': 'attachment; filename="patient-report.pdf"',
          },
        }),
      ),
    )

    const response = await proxyBackendRequest(
      new Request('http://qadam.test/api/backend/files?path=reports/patient-report.pdf'),
      '/files',
      { get: () => 'access', set: vi.fn(), delete: vi.fn() },
    )
    const received = new Uint8Array(await response.arrayBuffer())

    expect(createHash('sha256').update(received).digest('hex')).toBe(
      createHash('sha256').update(fixture).digest('hex'),
    )
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(response.headers.get('content-disposition')).toContain('patient-report.pdf')
    expect(response.headers.get('cache-control')).toContain('no-store')
  })

  it.each(['../secret', '/absolute/path', 'https://outside.test/file', 'folder\\file'])(
    'rejects malformed protected file path %s',
    (path) => {
      expect(resolveBackendOperation('GET', '/files', new URLSearchParams({ path }))).toBeNull()
    },
  )
})
