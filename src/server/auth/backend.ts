import {
  clearSession,
  parseBackendSession,
  readSession,
  writeSession,
  type SessionStore,
} from './session'

const DEFAULT_BACKEND_BASE_URL = 'http://45.141.100.245:8080/disabled-support-service/api/v1'

function backendUrl(path: string) {
  const base = process.env.BACKEND_API_BASE_URL ?? DEFAULT_BACKEND_BASE_URL
  return `${base.replace(/\/$/, '')}${path}`
}

type Fetcher = typeof fetch

export interface Credentials {
  email: string
  password: string
}

export async function authenticateCredentials(
  credentials: Credentials,
  store: SessionStore,
  fetcher: Fetcher = fetch,
) {
  let response: Response
  try {
    response = await fetcher(backendUrl('/auth/make-auth'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    })
  } catch {
    return { ok: false as const, status: 503, data: { code: 'BACKEND_UNAVAILABLE' } }
  }
  if (!response.ok) {
    clearSession(store)
    return {
      ok: false as const,
      status: response.status,
      data: { code: response.status === 401 ? 'INVALID_CREDENTIALS' : 'BAD_REQUEST' },
    }
  }

  const session = parseBackendSession(await response.json())
  if (!session) {
    clearSession(store)
    return { ok: false as const, status: 502, data: { code: 'INVALID_BACKEND_RESPONSE' } }
  }
  writeSession(store, session)
  return {
    ok: true as const,
    status: 200,
    data: { role: session.role, userId: session.userId },
  }
}

export async function logoutBackendSession(store: SessionStore, fetcher: Fetcher = fetch) {
  const { accessToken } = readSession(store)
  try {
    if (accessToken) {
      await fetcher(backendUrl('/auth/logout'), {
        method: 'POST',
        headers: { authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      })
    }
  } catch {
    // Local session termination must succeed even when the backend is unavailable.
  } finally {
    clearSession(store)
  }
}

export async function updateBackendPassword(
  input: { old_password: string; new_password: string },
  store: SessionStore,
  fetcher: Fetcher = fetch,
) {
  const { accessToken } = readSession(store)
  if (!accessToken) return { status: 401, data: { code: 'UNAUTHORIZED' } }
  let response: Response
  try {
    response = await fetcher(backendUrl('/auth/password/update'), {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    })
  } catch {
    return { status: 503, data: { code: 'BACKEND_UNAVAILABLE' } }
  }
  return {
    status: response.status,
    data: response.ok ? { ok: true } : { code: response.status === 400 ? 'BAD_REQUEST' : 'ERROR' },
  }
}
