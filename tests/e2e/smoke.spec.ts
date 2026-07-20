import { expect, test } from '@playwright/test'

test('opens the localized Qadam shell', async ({ page }) => {
  await page.goto('/ru')

  await expect(page).toHaveTitle(/Qadam/)
  await expect(page.getByRole('heading', { name: 'Qadam' })).toBeVisible()
})
