import { authenticateCredentials } from '@/server/auth/backend'
import { createCookieSessionStore } from '@/server/auth/cookie-store'
import { hasValidMutationOrigin } from '@/server/http/origin'
import { loginSchema } from '@/features/auth/schema'

export async function POST(request: Request) {
  if (!hasValidMutationOrigin(request)) {
    return Response.json({ code: 'INVALID_ORIGIN' }, { status: 403 })
  }
  const input = loginSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return Response.json({ code: 'BAD_REQUEST' }, { status: 400 })

  const result = await authenticateCredentials(input.data, await createCookieSessionStore())
  return Response.json(result.data, {
    status: result.status,
    headers: { 'cache-control': 'private, no-store, max-age=0' },
  })
}
