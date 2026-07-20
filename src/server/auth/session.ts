export const sessionCookieNames = {
  access: 'qadam_access',
  refresh: 'qadam_refresh',
  role: 'qadam_role',
  userId: 'qadam_user',
} as const

export interface SessionStore {
  get(name: string): string | undefined
  set(name: string, value: string): void
  delete(name: string): void
}

export interface BackendSession {
  accessToken: string
  refreshToken: string
  role: 'PATIENT' | 'PRACTITIONER' | 'ADMIN'
  userId: string
}

export function readSession(store: SessionStore) {
  return {
    accessToken: store.get(sessionCookieNames.access),
    refreshToken: store.get(sessionCookieNames.refresh),
    role: store.get(sessionCookieNames.role),
    userId: store.get(sessionCookieNames.userId),
  }
}

export function writeSession(store: SessionStore, session: BackendSession) {
  store.set(sessionCookieNames.access, session.accessToken)
  store.set(sessionCookieNames.refresh, session.refreshToken)
  store.set(sessionCookieNames.role, session.role)
  store.set(sessionCookieNames.userId, session.userId)
}

export function clearSession(store: SessionStore) {
  for (const name of Object.values(sessionCookieNames)) store.delete(name)
}

export function parseBackendSession(value: unknown): BackendSession | null {
  if (!value || typeof value !== 'object') return null
  const session = value as Record<string, unknown>
  if (
    typeof session.access_token !== 'string' ||
    typeof session.refresh_token !== 'string' ||
    typeof session.user_id !== 'string' ||
    !['PATIENT', 'PRACTITIONER', 'ADMIN'].includes(String(session.role))
  ) {
    return null
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    role: session.role as BackendSession['role'],
    userId: session.user_id,
  }
}
