import { afterEach, describe, expect, it, vi } from 'vitest'
import { backendOperations, resolveBackendOperation } from '@/server/backend/policy'
import { proxyBackendRequest, type SessionStore } from '@/server/backend/proxy'

function samplePath(template: string) {
  return template.replaceAll(/\{[^}]+\}/g, '00000000-0000-4000-8000-000000000001')
}

function sampleQuery(operation: (typeof backendOperations)[number]) {
  const query = new URLSearchParams()
  for (const parameter of operation.query) {
    if (parameter.required)
      query.set(parameter.name, parameter.name === 'path' ? 'photo/test.jpg' : 'true')
  }
  return query
}

function createSession(
  values: Record<string, string> = {},
): SessionStore & { values: Record<string, string> } {
  return {
    values,
    get(name) {
      return this.values[name]
    },
    set(name, value) {
      this.values[name] = value
    },
    delete(name) {
      delete this.values[name]
    },
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('backend operation policy', () => {
  it('contains and resolves every one of the 52 Swagger operations', () => {
    expect(backendOperations).toHaveLength(52)
    for (const operation of backendOperations) {
      expect(
        resolveBackendOperation(
          operation.method,
          samplePath(operation.path),
          sampleQuery(operation),
        ),
      ).toMatchObject({ operationId: operation.operationId })
    }
  })

  it('rejects unknown methods, paths, query keys and traversal', () => {
    expect(resolveBackendOperation('DELETE', '/patients/me', new URLSearchParams())).toBeNull()
    expect(resolveBackendOperation('GET', '/internal/health', new URLSearchParams())).toBeNull()
    expect(
      resolveBackendOperation('GET', '/patients/me', new URLSearchParams({ admin: 'true' })),
    ).toBeNull()
    expect(resolveBackendOperation('GET', '/../files', new URLSearchParams())).toBeNull()
  })
})

describe('backend proxy', () => {
  it('forwards JSON without exposing the access token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const session = createSession({ qadam_access: 'server-access-token' })
    const request = new Request('http://qadam.test/api/backend/reports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ painLevel: 2 }),
    })

    const response = await proxyBackendRequest(request, '/reports', session)

    expect(await response.json()).toEqual({ ok: true })
    expect(response.headers.get('authorization')).toBeNull()
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual(
      expect.objectContaining({ authorization: 'Bearer server-access-token' }),
    )
  })

  it('refreshes once after 401, rotates cookies and retries', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        Response.json({
          role: 'PATIENT',
          user_id: '00000000-0000-4000-8000-000000000001',
          access_token: 'rotated-access',
          refresh_token: 'rotated-refresh',
        }),
      )
      .mockResolvedValueOnce(Response.json({ id: 'patient-1' }))
    vi.stubGlobal('fetch', fetchMock)
    const session = createSession({
      qadam_access: 'expired-access',
      qadam_refresh: 'valid-refresh',
    })

    const response = await proxyBackendRequest(
      new Request('http://qadam.test/api/backend/patients/me'),
      '/patients/me',
      session,
    )

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(session.values.qadam_access).toBe('rotated-access')
    expect(session.values.qadam_refresh).toBe('rotated-refresh')
    await expect(response.json()).resolves.toEqual({ id: 'patient-1' })
  })

  it('keeps multipart content type and body for backend upload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ id: 'complaint-1' }, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const form = new FormData()
    form.set('request', JSON.stringify({ reason: 'DISCOMFORT' }))
    form.set('photos', new File(['image'], 'device.webp', { type: 'image/webp' }))

    const response = await proxyBackendRequest(
      new Request('http://qadam.test/api/backend/device-complains', {
        method: 'POST',
        body: form,
      }),
      '/device-complains',
      createSession({ qadam_access: 'access' }),
    )

    expect(response.status).toBe(201)
    expect(fetchMock.mock.calls[0]?.[1]?.headers['content-type']).toMatch(
      /^multipart\/form-data; boundary=/,
    )
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeInstanceOf(ArrayBuffer)
  })

  it('clears session when refresh fails and never loops', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }))
    vi.stubGlobal('fetch', fetchMock)
    const session = createSession({ qadam_access: 'expired', qadam_refresh: 'invalid' })

    const response = await proxyBackendRequest(
      new Request('http://qadam.test/api/backend/patients/me'),
      '/patients/me',
      session,
    )

    expect(response.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(session.values).toEqual({})
  })
})
