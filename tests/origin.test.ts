import { describe, expect, it } from 'vitest'
import { hasValidMutationOrigin } from '@/server/http/origin'

function proxiedRequest(origin?: string) {
  const headers = new Headers({
    host: '127.0.0.1:3100',
    'x-forwarded-host': 'qadam.example',
    'x-forwarded-proto': 'https',
  })
  if (origin) headers.set('origin', origin)
  return new Request('http://localhost:3100/api/auth/login', { method: 'POST', headers })
}

describe('mutation origin validation', () => {
  it('accepts the browser origin reconstructed from trusted proxy headers', () => {
    expect(hasValidMutationOrigin(proxiedRequest('https://qadam.example'))).toBe(true)
  })

  it('rejects a foreign or missing origin', () => {
    expect(hasValidMutationOrigin(proxiedRequest('https://attacker.example'))).toBe(false)
    expect(hasValidMutationOrigin(proxiedRequest())).toBe(false)
  })

  it('accepts a direct same-origin request without proxy headers', () => {
    const request = new Request('https://qadam.example/api/auth/login', {
      method: 'POST',
      headers: { origin: 'https://qadam.example' },
    })
    expect(hasValidMutationOrigin(request)).toBe(true)
  })
})
