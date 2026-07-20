import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('opens the localized Qadam shell', async ({ page }) => {
  await page.goto('/ru')

  await expect(page).toHaveTitle(/Qadam/)
  await expect(
    page.getByRole('heading', { name: 'Поддержка после выдачи протеза или ортеза' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Войти в Qadam' }).first()).toBeVisible()
  await page.screenshot({ path: 'test-results/qadam-landing.png', fullPage: true })
})

test('has no serious accessibility findings or horizontal overflow', async ({ page }) => {
  await page.goto('/kk')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious')).toEqual(
    [],
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('never stores an API response in Service Worker Cache Storage', async ({ page }) => {
  await page.goto('/ru')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    await fetch('/api/auth/session')
  })

  const cachedApiUrls = await page.evaluate(async () => {
    const urls: string[] = []
    for (const cacheName of await caches.keys()) {
      for (const request of await (await caches.open(cacheName)).keys()) {
        if (new URL(request.url).pathname.startsWith('/api/')) urls.push(request.url)
      }
    }
    return urls
  })
  expect(cachedApiUrls).toEqual([])
})
