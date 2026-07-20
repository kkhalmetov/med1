import { describe, expect, it, vi } from 'vitest'
import { authenticateCredentials } from '@/server/auth/backend'
import { sessionCookieOptions } from '@/server/auth/cookie-store'
import type { SessionStore } from '@/server/auth/session'

function sessionStore() {
  const values: Record<string, string> = {}
  const store: SessionStore = {
    get: (name) => values[name],
    set: (name, value) => {
      values[name] = value
    },
    delete: (name) => {
      delete values[name]
    },
  }
  return { store, values }
}

describe('authentication boundary', () => {
  it('stores backend tokens server-side and returns metadata only', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        role: 'PATIENT',
        user_id: '00000000-0000-4000-8000-000000000001',
        access_token: 'access-fixture',
        refresh_token: 'refresh-fixture',
      }),
    )
    const { store, values } = sessionStore()

    const result = await authenticateCredentials(
      { email: 'patient@example.test', password: 'valid-password' },
      store,
      fetcher,
    )

    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { role: 'PATIENT', userId: '00000000-0000-4000-8000-000000000001' },
    })
    expect(JSON.stringify(result)).not.toContain('access-fixture')
    expect(values).toMatchObject({
      qadam_access: 'access-fixture',
      qadam_refresh: 'refresh-fixture',
      qadam_role: 'PATIENT',
    })
  })

  it.each([400, 401])('does not create a session after backend %s', async (status) => {
    const { store, values } = sessionStore()
    const result = await authenticateCredentials(
      { email: 'patient@example.test', password: 'wrong' },
      store,
      vi.fn().mockResolvedValue(Response.json({}, { status })),
    )

    expect(result).toMatchObject({ ok: false, status })
    expect(values).toEqual({})
  })

  it('uses HttpOnly, SameSite and Secure production cookies', () => {
    expect(sessionCookieOptions('qadam_access', true)).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })
  })
})
