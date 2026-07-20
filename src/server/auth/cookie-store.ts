import { cookies } from 'next/headers'
import type { SessionStore } from './session'

export function sessionCookieOptions(name: string, secure: boolean) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: name === 'qadam_refresh' ? 60 * 60 * 24 * 30 : 60 * 30,
  }
}

export async function createCookieSessionStore(): Promise<SessionStore> {
  const jar = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  return {
    get: (name) => jar.get(name)?.value,
    set: (name, value) => jar.set(name, value, sessionCookieOptions(name, secure)),
    delete: (name) => jar.delete(name),
  }
}
