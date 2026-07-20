export type PwaCacheDisposition = 'cache-first' | 'network-only'

export function getPwaCacheDisposition(pathname: string, destination: string): PwaCacheDisposition {
  if (destination === 'document' || pathname.startsWith('/api/')) return 'network-only'

  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/icons/')) {
    return 'cache-first'
  }

  return 'network-only'
}
