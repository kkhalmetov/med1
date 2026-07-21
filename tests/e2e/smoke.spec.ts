import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('opens the localized QadamAI shell and explains the AI overview', async ({ page }) => {
  await page.goto('/ru')

  await expect(page).toHaveTitle(/QadamAI/)
  await expect(page.getByRole('heading', { name: 'Поддержка после выдачи ТСР' })).toBeVisible()
  const signIn = page.getByRole('link', { name: 'Войти в QadamAI' }).first()
  const howItWorks = page.getByRole('link', { name: 'Как это работает' })
  const github = page.getByRole('link', { name: 'GitHub' })
  await expect(signIn).toBeVisible()
  await expect(github).toBeVisible()
  await expect(github).toHaveAttribute('href', 'https://github.com/yevgn/shymkent-hub-hackathon')
  await expect(github).toHaveAttribute('target', '_blank')
  await expect(signIn).toHaveCSS('text-decoration-line', 'none')
  await expect(howItWorks).toHaveCSS('text-decoration-line', 'none')
  await expect(page.locator('.hero__assurance')).toHaveCount(0)
  await expect(page.locator('.brand img').first()).toHaveAttribute('src', /\/icons\/qadamm-q\.svg/)
  await expect(page.getByRole('heading', { name: 'ИИ собирает важное в один обзор' })).toBeVisible()
  await expect(page.getByText('Собирает контекст', { exact: true })).toBeVisible()
  await expect(page.getByText('Выделяет важное', { exact: true })).toBeVisible()
  await expect(page.getByText('Помогает специалисту', { exact: true })).toBeVisible()
  await expect(
    page.getByText('ИИ не ставит диагноз и не заменяет клиническое решение.'),
  ).toBeVisible()
  const footerLogo = page.locator('footer').getByRole('link', { name: 'QadamAI' })
  await expect(footerLogo).toHaveAttribute('href', /#top$/)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await footerLogo.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.screenshot({ path: 'test-results/qadam-landing.png', fullPage: true })
})

test('explains the QadamAI overview in Kazakh', async ({ page }) => {
  await page.goto('/kk')

  await expect(page).toHaveTitle(/QadamAI/)
  await expect(
    page.getByRole('heading', { name: 'ЖИ маңызды деректерді бір шолуға жинайды' }),
  ).toBeVisible()
  await expect(page.getByText('Контексті жинайды', { exact: true })).toBeVisible()
  await expect(page.getByText('Маңыздысын бөліп көрсетеді', { exact: true })).toBeVisible()
  await expect(page.getByText('Маманға көмектеседі', { exact: true })).toBeVisible()
  await expect(
    page.getByText('ЖИ диагноз қоймайды және клиникалық шешімді алмастырмайды.'),
  ).toBeVisible()
})

test('login copy, error and submit content fit at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 820 })
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ json: { message: 'Unauthorized' }, status: 401 }),
  )
  await page.goto('/ru/login')

  await expect(page.getByRole('link', { name: 'Вернуться на главную' })).toBeVisible()
  await page.getByLabel('Электронная почта').fill('wrong@example.kz')
  await page.getByLabel('Пароль').fill('wrong-password')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.locator('.form-alert')).toHaveText('Проверьте почту или пароль')

  const button = page.getByRole('button', { name: 'Войти' })
  const box = await button.boundingBox()
  const iconBox = await button.locator('svg').boundingBox()
  expect(box).not.toBeNull()
  expect(iconBox).not.toBeNull()
  expect(iconBox!.x + iconBox!.width).toBeLessThanOrEqual(box!.x + box!.width)
})

test('login validation uses one red alert without inline field messages', async ({ page }) => {
  await page.goto('/ru/login')
  await page.getByLabel('Электронная почта').fill('not-an-email')
  await page.getByRole('button', { name: 'Войти' }).click()

  await expect(page.locator('.form-alert')).toHaveText('Проверьте почту или пароль')
  await expect(page.locator('.field__message--error')).toHaveCount(0)
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
  await expect(page.getByText('Только под наблюдением')).toHaveCount(0)

  await page.goto('/ru/admin')
  await expect(page).toHaveURL(/\/ru\/patient$/)
})

test('patient reports use a product form without technical API controls', async ({
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
  await page.route('**/api/backend/device-dispenses/me**', (route) =>
    route.fulfill({
      json: [{ id: 'dispense-1', deviceId: 'device-1', deviceName: 'ТСР для ноги' }],
    }),
  )
  await page.route('**/api/backend/reports/my', (route) =>
    route.fulfill({ json: [{ id: 'report-1', painLevel: 3, statusColor: 'GREEN' }] }),
  )
  await page.goto('/ru/patient/reports')

  await expect(page.getByRole('heading', { name: 'Ежедневные отчёты' })).toBeVisible()
  await page.getByRole('button', { name: 'Заполнить отчёт' }).click()
  await expect(page.locator('input[name="discomfortLevel"]')).toHaveAttribute('min', '0')
  await expect(page.locator('input[name="discomfortLevel"]')).toHaveAttribute('max', '10')
  await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Выполнить|Запустить/ })).toHaveCount(0)
})

test('keeps core pages within 360–1440 px without horizontal overflow', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  for (const width of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ru')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
})
