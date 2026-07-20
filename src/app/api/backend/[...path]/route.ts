import type { NextRequest } from 'next/server'
import { proxyBackendRequest } from '@/server/backend/proxy'
import { createCookieSessionStore } from '@/server/auth/cookie-store'
import { hasValidMutationOrigin } from '@/server/http/origin'

interface BackendRouteContext {
  params: Promise<{ path: string[] }>
}

function isMutationAllowed(request: NextRequest) {
  if (['GET', 'HEAD'].includes(request.method)) return true
  return hasValidMutationOrigin(request)
}

async function handle(request: NextRequest, context: BackendRouteContext) {
  if (!isMutationAllowed(request)) {
    return Response.json({ code: 'INVALID_ORIGIN' }, { status: 403 })
  }
  const { path: segments } = await context.params
  const path = `/${segments.join('/')}`
  return proxyBackendRequest(request, path, await createCookieSessionStore())
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const PUT = handle
export const DELETE = handle
