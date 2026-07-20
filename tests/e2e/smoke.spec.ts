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
  expect(
    results.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
  ).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
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

test('protects role areas and exposes keyboard-reachable patient navigation', async ({
  context,
  page,
}) => {
  await context.addCookies([
    { name: 'qadam_access', value: 'e2e-access', domain: '127.0.0.1', path: '/' },
    { name: 'qadam_role', value: 'PATIENT', domain: '127.0.0.1', path: '/' },
    {
      name: 'qadam_user',
      value: '00000000-0000-4000-8000-000000000001',
      domain: '127.0.0.1',
      path: '/',
    },
  ])

  await page.goto('/ru/patient')
  await expect(page.getByRole('heading', { name: 'Ваш сегодняшний шаг' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Меню' }).first()).toBeVisible()

  await page.goto('/ru/admin')
  await expect(page).toHaveURL(/\/ru\/patient$/)
})

test('executes a patient backend workflow from the localized workspace', async ({
  context,
  page,
}) => {
  await context.addCookies([
    { name: 'qadam_access', value: 'e2e-access', domain: '127.0.0.1', path: '/' },
    { name: 'qadam_role', value: 'PATIENT', domain: '127.0.0.1', path: '/' },
    {
      name: 'qadam_user',
      value: '00000000-0000-4000-8000-000000000001',
      domain: '127.0.0.1',
      path: '/',
    },
  ])
  await page.route('**/api/backend/reports/my', (route) =>
    route.fulfill({ json: [{ id: 'report-1', painLevel: 3, statusColor: 'GREEN' }] }),
  )
  await page.goto('/ru/patient/reports')

  const createReport = page.getByRole('article').filter({ hasText: 'Отправить ежедневный отчёт' })
  await createReport.getByRole('button').click()
  await expect(createReport.locator('input[name="painLevel"]')).toHaveAttribute('min', '0')
  await expect(createReport.locator('input[name="discomfortLevel"]')).toHaveAttribute('min', '1')

  const history = page.getByRole('article').filter({ hasText: 'Моя история отчётов' })
  await history.getByRole('button').first().click()
  await history.getByRole('button', { name: /Выполнить/ }).click()
  await expect(history.getByText('Стабильное состояние')).toBeVisible()
  await expect(history.getByText('3')).toBeVisible()
})
