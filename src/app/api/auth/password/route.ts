import { passwordSchema } from '@/features/auth/schema'
import { updateBackendPassword } from '@/server/auth/backend'
import { createCookieSessionStore } from '@/server/auth/cookie-store'
import { hasValidMutationOrigin } from '@/server/http/origin'

export async function PATCH(request: Request) {
  if (!hasValidMutationOrigin(request)) {
    return Response.json({ code: 'INVALID_ORIGIN' }, { status: 403 })
  }
  const input = passwordSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return Response.json({ code: 'BAD_REQUEST' }, { status: 400 })
  const result = await updateBackendPassword(
    { old_password: input.data.oldPassword, new_password: input.data.newPassword },
    await createCookieSessionStore(),
  )
  return Response.json(result.data, {
    status: result.status,
    headers: { 'cache-control': 'private, no-store, max-age=0' },
  })
}
