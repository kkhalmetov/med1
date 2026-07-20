import {
  clearSession,
  parseBackendSession,
  readSession,
  sessionCookieNames,
  writeSession,
  type SessionStore,
} from '../auth/session'
import { resolveBackendOperation } from './policy'

export type { SessionStore } from '../auth/session'

const DEFAULT_BACKEND_BASE_URL = 'http://45.141.100.245:8080/disabled-support-service/api/v1'
const PRIVATE_AUTH_OPERATIONS = new Set([
  'authenticate',
  'refreshAccessToken',
  'logout',
  'updatePassword',
])

function backendBaseUrl() {
  const value = process.env.BACKEND_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL
  const parsed = new URL(value)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid backend protocol')
  return parsed.toString().replace(/\/$/, '')
}

function safeResponse(response: Response) {
  const headers = new Headers()
  for (const name of ['content-type', 'content-disposition', 'content-length']) {
    const value = response.headers.get(name)
    if (value) headers.set(name, value)
  }
  headers.set('cache-control', 'private, no-store, max-age=0')
  headers.set('x-content-type-options', 'nosniff')
  return new Response(response.body, { status: response.status, headers })
}

async function refreshSession(store: SessionStore) {
  const refreshToken = store.get(sessionCookieNames.refresh)
  if (!refreshToken) return null

  const response = await fetch(`${backendBaseUrl()}/auth/refresh-access-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  })
  if (!response.ok) return null
  const session = parseBackendSession(await response.json())
  if (session) writeSession(store, session)
  return session
}

function validateContentType(contentTypes: string[], request: Request) {
  if (contentTypes.length === 0) return request.body === null
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim()
  return Boolean(contentType && contentTypes.includes(contentType))
}

async function performBackendRequest(
  request: Request,
  path: string,
  store: SessionStore,
): Promise<Response> {
  const url = new URL(request.url)
  const operation = resolveBackendOperation(request.method, path, url.searchParams)
  if (!operation || PRIVATE_AUTH_OPERATIONS.has(operation.operationId)) {
    return Response.json({ code: 'NOT_FOUND' }, { status: 404 })
  }
  if (!validateContentType(operation.contentTypes, request)) {
    return Response.json({ code: 'UNSUPPORTED_CONTENT_TYPE' }, { status: 415 })
  }

  const rawBody = request.body ? await request.arrayBuffer() : undefined
  const contentType = request.headers.get('content-type')
  const send = (accessToken?: string) => {
    const headers: Record<string, string> = { accept: request.headers.get('accept') ?? '*/*' }
    if (contentType) headers['content-type'] = contentType
    if (accessToken) headers.authorization = `Bearer ${accessToken}`
    return fetch(`${backendBaseUrl()}${path}${url.search}`, {
      method: request.method,
      headers,
      ...(rawBody === undefined ? {} : { body: rawBody }),
      cache: 'no-store',
      redirect: 'manual',
    })
  }

  const current = readSession(store)
  let response = await send(current.accessToken)
  if (response.status === 401 && current.refreshToken) {
    const refreshed = await refreshSession(store)
    if (refreshed) response = await send(refreshed.accessToken)
    else clearSession(store)
  }
  return safeResponse(response)
}

export async function proxyBackendRequest(
  request: Request,
  path: string,
  store: SessionStore,
): Promise<Response> {
  try {
    return await performBackendRequest(request, path, store)
  } catch {
    return Response.json(
      { code: 'BACKEND_UNAVAILABLE' },
      {
        status: 503,
        headers: { 'cache-control': 'private, no-store, max-age=0' },
      },
    )
  }
}
