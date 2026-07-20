const BACKEND_TIMEOUT_MS = 10_000

function errorField(error: unknown, field: 'code' | 'name') {
  if (!error || typeof error !== 'object' || !(field in error)) return undefined
  const value = (error as Record<string, unknown>)[field]
  return typeof value === 'string' ? value : undefined
}

export function backendRequestSignal() {
  return AbortSignal.timeout(BACKEND_TIMEOUT_MS)
}

export function logBackendRequestFailure(
  event: 'backend_auth_failed' | 'backend_proxy_failed',
  requestId: string,
  error: unknown,
) {
  const cause =
    error && typeof error === 'object' && 'cause' in error ? (error.cause as unknown) : undefined
  console.error(
    JSON.stringify({
      event,
      requestId,
      errorName: errorField(error, 'name'),
      errorCode: errorField(error, 'code') ?? errorField(cause, 'code'),
    }),
  )
}
