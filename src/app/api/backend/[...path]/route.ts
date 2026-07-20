import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { proxyBackendRequest } from '@/server/backend/proxy'
import type { SessionStore } from '@/server/auth/session'

interface BackendRouteContext {
  params: Promise<{ path: string[] }>
}

async function cookieStore(): Promise<SessionStore> {
  const jar = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  return {
    get: (name) => jar.get(name)?.value,
    set: (name, value) => {
      jar.set(name, value, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: name === 'qadam_refresh' ? 60 * 60 * 24 * 30 : 60 * 30,
      })
    },
    delete: (name) => jar.delete(name),
  }
}

function isMutationAllowed(request: NextRequest) {
  if (['GET', 'HEAD'].includes(request.method)) return true
  return request.headers.get('origin') === new URL(request.url).origin
}

async function handle(request: NextRequest, context: BackendRouteContext) {
  if (!isMutationAllowed(request)) {
    return Response.json({ code: 'INVALID_ORIGIN' }, { status: 403 })
  }
  const { path: segments } = await context.params
  const path = `/${segments.join('/')}`
  return proxyBackendRequest(request, path, await cookieStore())
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const PUT = handle
export const DELETE = handle
