import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/internal/gemini/route'

const validPayload = {
  contents: [{ parts: [{ text: 'Summarize this synthetic patient history.' }] }],
}

function relayRequest(payload: unknown = validPayload, secret?: string) {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (secret) headers.set('authorization', `Bearer ${secret}`)

  return new Request('http://qadam.test/api/internal/gemini', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
}

afterEach(() => {
  delete process.env.GEMINI_API_KEY
  delete process.env.GEMINI_RELAY_SECRET
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Gemini server relay', () => {
  it('rejects missing or invalid credentials before calling Gemini', async () => {
    process.env.GEMINI_API_KEY = 'server-api-key'
    process.env.GEMINI_RELAY_SECRET = 'relay-secret'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const missing = await POST(relayRequest())
    const invalid = await POST(relayRequest(validPayload, 'wrong-secret'))

    expect(missing.status).toBe(401)
    expect(invalid.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports missing server configuration without exposing details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await POST(relayRequest(validPayload, 'anything'))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ code: 'AI_RELAY_UNAVAILABLE' })
  })

  it('rejects a request outside the backend Gemini contract', async () => {
    process.env.GEMINI_API_KEY = 'server-api-key'
    process.env.GEMINI_RELAY_SECRET = 'relay-secret'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(
      relayRequest({ model: 'caller-controlled', contents: [] }, 'relay-secret'),
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a declared body larger than 256 KiB', async () => {
    process.env.GEMINI_API_KEY = 'server-api-key'
    process.env.GEMINI_RELAY_SECRET = 'relay-secret'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const request = relayRequest(validPayload, 'relay-secret')
    request.headers.set('content-length', String(256 * 1024 + 1))

    const response = await POST(request)

    expect(response.status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('forwards valid input to the fixed Gemini model using a header key', async () => {
    process.env.GEMINI_API_KEY = 'server-api-key'
    process.env.GEMINI_RELAY_SECRET = 'relay-secret'
    const geminiResponse = {
      candidates: [{ content: { parts: [{ text: 'Stable follow-up.' }] } }],
    }
    const fetchMock = vi.fn().mockResolvedValue(Response.json(geminiResponse))
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout')
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(relayRequest(validPayload, 'relay-secret'))

    expect(response.status).toBe(200)
    const responseBody = await response.json()
    expect(responseBody).toEqual(geminiResponse)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'x-goog-api-key': 'server-api-key',
        }),
        body: JSON.stringify(validPayload),
      }),
    )
    expect(timeoutSpy).toHaveBeenCalledWith(90_000)
    expect(JSON.stringify(responseBody)).not.toContain('server-api-key')
  })

  it('converts Gemini and network failures to safe responses', async () => {
    process.env.GEMINI_API_KEY = 'server-api-key'
    process.env.GEMINI_RELAY_SECRET = 'relay-secret'
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ error: { message: 'sensitive detail' } }, { status: 429 }),
      )
      .mockRejectedValueOnce(new TypeError('network failure'))
    vi.stubGlobal('fetch', fetchMock)

    const upstreamFailure = await POST(relayRequest(validPayload, 'relay-secret'))
    const networkFailure = await POST(relayRequest(validPayload, 'relay-secret'))

    expect(upstreamFailure.status).toBe(503)
    await expect(upstreamFailure.json()).resolves.toEqual({ code: 'AI_UPSTREAM_UNAVAILABLE' })
    expect(networkFailure.status).toBe(503)
    await expect(networkFailure.json()).resolves.toEqual({ code: 'AI_UPSTREAM_UNAVAILABLE' })
    expect(errorLog).toHaveBeenCalledTimes(2)
  })
})
