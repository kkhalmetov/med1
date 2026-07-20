import { delay, HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiRequest } from '@/shared/api/client'
import { ApiError } from '@/shared/api/error'
import { server } from './mocks/server'

describe('API client', () => {
  it('returns a typed JSON response and serializes query values', async () => {
    server.use(
      http.get('/api/backend/patients/me', ({ request }) => {
        expect(new URL(request.url).searchParams.get('only_observable')).toBe('true')
        return HttpResponse.json({ id: 'patient-1' })
      }),
    )

    await expect(
      apiRequest<{ id: string }>('/patients/me', { query: { only_observable: true } }),
    ).resolves.toEqual({ id: 'patient-1' })
  })

  it('normalizes validation failures without dropping backend details', async () => {
    server.use(
      http.post('/api/backend/reports', () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: { painLevel: 'required' } },
          { status: 400 },
        ),
      ),
    )

    const error = await apiRequest('/reports', { method: 'POST', body: {} }).catch(
      (reason: unknown) => reason,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, retryable: false, code: 'BAD_REQUEST' })
    expect((error as ApiError).details).toEqual({ painLevel: 'required' })
  })

  it('classifies request timeout as retryable', async () => {
    server.use(
      http.get('/api/backend/reports/my', async () => {
        await delay(100)
        return HttpResponse.json([])
      }),
    )

    await expect(apiRequest('/reports/my', { timeoutMs: 5 })).rejects.toMatchObject({
      code: 'TIMEOUT',
      retryable: true,
    })
  })

  it('does not retry a caller-aborted request', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(apiRequest('/patients/me', { signal: controller.signal })).rejects.toMatchObject({
      code: 'ABORTED',
      retryable: false,
    })
  })
})
