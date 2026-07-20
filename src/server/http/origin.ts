export function hasValidMutationOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false

  const directOrigin = new URL(request.url).origin
  if (origin === directOrigin) return true

  // Reverse proxies expose the public browser origin through the first forwarded values.
  // The platform owns these headers; browser JavaScript cannot set Host or X-Forwarded-*.
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host')?.split(',')[0]?.trim()
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const protocol = forwardedProtocol || new URL(request.url).protocol.replace(':', '')
  if (!host || !['http', 'https'].includes(protocol)) return false

  try {
    return origin === new URL(`${protocol}://${host}`).origin
  } catch {
    return false
  }
}
