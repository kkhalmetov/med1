import { ApiError, apiErrorFromResponse } from './error'

type QueryValue = boolean | number | string | null | undefined

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | unknown[] | null
  query?: Record<string, QueryValue | QueryValue[]>
  timeoutMs?: number
}

function appendQuery(searchParams: URLSearchParams, key: string, value: QueryValue | QueryValue[]) {
  const values = Array.isArray(value) ? value : [value]
  for (const item of values) {
    if (item !== undefined && item !== null) searchParams.append(key, String(item))
  }
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  )
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, query, signal, timeoutMs = 20_000, ...init } = options
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) appendQuery(searchParams, key, value)
  const queryString = searchParams.toString()
  const requestPath = `/api/backend${path}${queryString ? `?${queryString}` : ''}`

  const timeoutController = new AbortController()
  const timer = window.setTimeout(() => timeoutController.abort(), timeoutMs)
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal

  const requestHeaders = new Headers(headers)
  let requestBody: BodyInit | null | undefined
  if (body !== undefined && body !== null) {
    if (isBodyInit(body)) requestBody = body
    else {
      requestHeaders.set('content-type', 'application/json')
      requestBody = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(requestPath, {
      ...init,
      ...(requestBody === undefined ? {} : { body: requestBody }),
      credentials: 'same-origin',
      headers: requestHeaders,
      signal: requestSignal,
    })
    const payload = await parseResponse(response)
    if (!response.ok) throw apiErrorFromResponse(response.status, payload)
    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (signal?.aborted) {
      throw new ApiError('Request aborted', {
        status: 0,
        code: 'ABORTED',
        retryable: false,
        cause: error,
      })
    }
    if (timeoutController.signal.aborted) {
      throw new ApiError('Request timed out', {
        status: 408,
        code: 'TIMEOUT',
        retryable: true,
        cause: error,
      })
    }
    throw new ApiError('Network request failed', {
      status: 0,
      code: 'NETWORK',
      retryable: true,
      cause: error,
    })
  } finally {
    window.clearTimeout(timer)
  }
}
