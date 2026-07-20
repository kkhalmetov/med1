import type { BrowserContext } from '@playwright/test'

export type TestRole = 'PATIENT' | 'PRACTITIONER' | 'ADMIN'

export async function installSession(context: BrowserContext, role: TestRole) {
  await context.addCookies([
    { name: 'qadam_access', value: 'e2e-access', domain: '127.0.0.1', path: '/' },
    { name: 'qadam_role', value: role, domain: '127.0.0.1', path: '/' },
    {
      name: 'qadam_user',
      value: '00000000-0000-4000-8000-000000000001',
      domain: '127.0.0.1',
      path: '/',
    },
  ])
}
