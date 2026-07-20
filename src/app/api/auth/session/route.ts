import { createCookieSessionStore } from '@/server/auth/cookie-store'
import { readSession } from '@/server/auth/session'

export async function GET() {
  const session = readSession(await createCookieSessionStore())
  if (!session.accessToken || !session.role || !session.userId) {
    return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }
  return Response.json(
    { role: session.role, userId: session.userId },
    { headers: { 'cache-control': 'private, no-store, max-age=0' } },
  )
}
