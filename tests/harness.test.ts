import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from './mocks/server'

describe('test harness', () => {
  it('intercepts HTTP requests through MSW', async () => {
    server.use(http.get('https://qadam.test/health', () => HttpResponse.json({ ok: true })))

    const response = await fetch('https://qadam.test/health')

    await expect(response.json()).resolves.toEqual({ ok: true })
  })
})
