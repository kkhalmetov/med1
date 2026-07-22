import {
  clearSession,
  parseBackendSession,
  readSession,
  sessionCookieNames,
  writeSession,
  type SessionStore,
} from '../auth/session'
import { backendRequestSignal, logBackendRequestFailure } from './observability'
import { resolveBackendOperation } from './policy'

export type { SessionStore } from '../auth/session'

const DEFAULT_BACKEND_BASE_URL = 'http://45.141.100.245:8080/disabled-support-service/api/v1'
const PRIVATE_AUTH_OPERATIONS = new Set([
  'authenticate',
  'refreshAccessToken',
  'logout',
  'updatePassword',
])
const OPERATION_TIMEOUTS_MS: Readonly<Partial<Record<string, number>>> = {
  shortReview: 100_000,
}

function backendBaseUrl() {
  const value = process.env.BACKEND_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL
  const parsed = new URL(value)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid backend protocol')
  return parsed.toString().replace(/\/$/, '')
}

function safeResponse(response: Response, requestId: string) {
  const headers = new Headers()
  for (const name of ['content-type', 'content-disposition']) {
    const value = response.headers.get(name)
    if (value) headers.set(name, value)
  }
  headers.set('cache-control', 'private, no-store, max-age=0')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-request-id', requestId)
  return new Response(response.body, { status: response.status, headers })
}

async function refreshSession(store: SessionStore, requestId: string) {
  const refreshToken = store.get(sessionCookieNames.refresh)
  if (!refreshToken) return null

  const response = await fetch(`${backendBaseUrl()}/auth/refresh-access-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-request-id': requestId },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
    signal: backendRequestSignal(),
  })
  if (!response.ok) return null
  const session = parseBackendSession(await response.json())
  if (session) writeSession(store, session)
  return session
}

function validateContentType(contentTypes: string[], request: Request) {
  if (contentTypes.length === 0) return true
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim()
  return Boolean(contentType && contentTypes.includes(contentType))
}

async function hasBodyBytes(request: Request) {
  if (!request.body) return false
  const reader = request.body.getReader()
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) return false
      if (chunk.value.byteLength > 0) {
        await reader.cancel()
        return true
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function performBackendRequest(
  request: Request,
  path: string,
  store: SessionStore,
  requestId: string,
): Promise<Response> {
  const url = new URL(request.url)
  const operation = resolveBackendOperation(request.method, path, url.searchParams)
  if (!operation || PRIVATE_AUTH_OPERATIONS.has(operation.operationId)) {
    return Response.json({ code: 'NOT_FOUND' }, { status: 404 })
  }
  if (!validateContentType(operation.contentTypes, request)) {
    return Response.json({ code: 'UNSUPPORTED_CONTENT_TYPE' }, { status: 415 })
  }
  if (operation.contentTypes.length === 0 && (await hasBodyBytes(request))) {
    return Response.json({ code: 'UNSUPPORTED_CONTENT_TYPE' }, { status: 415 })
  }
  const rawBody =
    operation.contentTypes.length > 0 && request.body ? await request.arrayBuffer() : undefined

  const contentType = request.headers.get('content-type')
  const send = (accessToken?: string) => {
    const headers: Record<string, string> = {
      accept: request.headers.get('accept') ?? '*/*',
      'x-request-id': requestId,
    }
    if (contentType) headers['content-type'] = contentType
    if (accessToken) headers.authorization = `Bearer ${accessToken}`
    return fetch(`${backendBaseUrl()}${path}${url.search}`, {
      method: request.method,
      headers,
      ...(rawBody === undefined ? {} : { body: rawBody }),
      cache: 'no-store',
      redirect: 'manual',
      signal: backendRequestSignal(OPERATION_TIMEOUTS_MS[operation.operationId]),
    })
  }

  const current = readSession(store)
  let response = await send(current.accessToken)
  if (response.status === 401 && current.refreshToken) {
    const refreshed = await refreshSession(store, requestId)
    if (refreshed) response = await send(refreshed.accessToken)
    else clearSession(store)
  }
  return safeResponse(response, requestId)
}

export async function proxyBackendRequest(
  request: Request,
  path: string,
  store: SessionStore,
): Promise<Response> {
  const requestId = crypto.randomUUID()
  try {
    return await performBackendRequest(request, path, store, requestId)
  } catch (error) {
    logBackendRequestFailure('backend_proxy_failed', requestId, error)
    return Response.json(
      { code: 'BACKEND_UNAVAILABLE' },
      {
        status: 503,
        headers: {
          'cache-control': 'private, no-store, max-age=0',
          'x-request-id': requestId,
        },
      },
    )
  }
}
