import { expect, test } from '@playwright/test'

const accounts = [
  ['PATIENT', process.env.E2E_PATIENT_EMAIL, process.env.E2E_PATIENT_PASSWORD],
  ['PRACTITIONER', process.env.E2E_PRACTITIONER_EMAIL, process.env.E2E_PRACTITIONER_PASSWORD],
  ['ADMIN', process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD],
] as const

for (const [role, email, password] of accounts) {
  test(`live login smoke for ${role}`, async ({ page }) => {
    test.skip(
      !email || !password,
      'Live credentials are supplied only through environment variables',
    )
    await page.goto('/ru/login')
    const result = await page.evaluate(
      async (credentials) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(credentials),
        })
        const body = (await response.json()) as { role?: string; code?: string }
        return { status: response.status, role: body.role, code: body.code }
      },
      { email, password },
    )
    expect(result).toMatchObject({ status: 200, role })
    await page.goto(`/ru/${role.toLowerCase()}`)
    await expect(page).toHaveURL(new RegExp(`/ru/${role.toLowerCase()}/?$`))
  })
}
