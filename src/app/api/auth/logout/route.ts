import { logoutBackendSession } from '@/server/auth/backend'
import { createCookieSessionStore } from '@/server/auth/cookie-store'
import { hasValidMutationOrigin } from '@/server/http/origin'

export async function POST(request: Request) {
  if (!hasValidMutationOrigin(request)) {
    return Response.json({ code: 'INVALID_ORIGIN' }, { status: 403 })
  }
  await logoutBackendSession(await createCookieSessionStore())
  return Response.json(
    { ok: true },
    { headers: { 'cache-control': 'private, no-store, max-age=0' } },
  )
}
