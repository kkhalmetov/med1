import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { installSession } from './helpers/session'

test.beforeEach(async ({ context, page }) => {
  await installSession(context, 'PATIENT')
  await page.route('**/api/backend/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    if (pathname.endsWith('/patients/me')) {
      await route.fulfill({
        json: {
          firstName: 'Алия',
          status: 'GREEN',
          practitionerFullName: 'Дәрігер',
          currentDevices: [],
        },
      })
    } else if (pathname.endsWith('/device-dispenses/me')) {
      await route.fulfill({
        json: [{ id: 'dispense-1', deviceId: 'device-1', deviceName: 'Ортез для ноги' }],
      })
    } else if (pathname.endsWith('/chat/messages/unread')) {
      await route.fulfill({
        json: [
          { id: 'message-1', senderType: 'PRACTITIONER', content: 'Первое сообщение' },
          { id: 'message-2', senderType: 'PRACTITIONER', content: 'Второе сообщение' },
        ],
      })
    } else if (route.request().method() === 'POST') {
      await route.fulfill({ json: { id: 'created-1', statusColor: 'GREEN' }, status: 201 })
    } else {
      await route.fulfill({ json: [] })
    }
  })
})

test('patient dashboard, report and role accessibility @a11y', async ({ page }) => {
  await page.goto('/ru/patient')
  await expect(page.getByRole('heading', { name: 'Здравствуйте, Алия' })).toBeVisible()
  await expect(page.getByText('Только под наблюдением')).toHaveCount(0)
  const chatCard = page
    .getByRole('heading', { name: 'Чат со специалистом' })
    .locator('xpath=ancestor::section[1]')
  await expect(chatCard.locator('strong')).toHaveText('2')
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])

  await page.goto('/ru/patient/reports')
  await page.getByRole('button', { name: 'Заполнить отчёт' }).click()
  await page.getByLabel('Изделие').selectOption('device-1')
  await page.getByLabel('Уровень боли').fill('2')
  await page.getByLabel('Дискомфорт').fill('0')
  await page.getByLabel('Подвижность').fill('8')
  await page.getByLabel('Качество сна').fill('7')
  const requestPromise = page.waitForRequest(
    (request) => request.url().endsWith('/api/backend/reports') && request.method() === 'POST',
  )
  await page.getByRole('button', { name: 'Отправить' }).click()
  const payload = (await requestPromise).postDataJSON()
  expect(payload).toMatchObject({ deviceId: 'device-1', painLevel: 2, discomfortLevel: 0 })
  await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
})

test('patient cannot submit a second report on the same local day', async ({ page }) => {
  const submittedAt = new Date().toISOString()
  await page.route('**/api/backend/reports/my', (route) =>
    route.fulfill({
      json: [{ id: 'report-today', submittedAt, painLevel: 2, discomfortLevel: 1 }],
    }),
  )

  await page.goto('/ru/patient')
  await expect(page.getByText('Отчёт за сегодня отправлен')).toBeVisible()
  await expect(page.getByRole('link', { name: /Заполнить отчёт/ })).toHaveCount(0)

  await page.goto('/ru/patient/reports')
  await expect(page.getByText('Следующий отчёт можно заполнить завтра.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Заполнить отчёт' })).toHaveCount(0)
})

test('successful report submission closes the form and locks the current day', async ({ page }) => {
  const ownReports: Array<Record<string, unknown>> = []
  await page.route('**/api/backend/reports/my', (route) => route.fulfill({ json: ownReports }))
  await page.route('**/api/backend/reports', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback()
    const report = {
      id: 'report-created',
      submittedAt: new Date().toISOString(),
      painLevel: 2,
      discomfortLevel: 1,
    }
    ownReports.unshift(report)
    await route.fulfill({ json: report, status: 201 })
  })

  await page.goto('/ru/patient/reports')
  await page.getByRole('button', { name: 'Заполнить отчёт' }).click()
  await page.getByLabel('Изделие').selectOption('device-1')
  await page.getByLabel('Уровень боли').fill('2')
  await page.getByLabel('Дискомфорт').fill('1')
  await page.getByRole('button', { name: 'Отправить' }).click()

  await expect(page.getByText('Отчёт за сегодня отправлен')).toBeVisible()
  await expect(page.getByText('Следующий отчёт можно заполнить завтра.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Заполнить отчёт' })).toHaveCount(0)
  await expect(page.locator('.action-panel')).toHaveCount(0)
})

test('patient cannot open the report form while daily history is unavailable', async ({ page }) => {
  await page.route('**/api/backend/reports/my', (route) =>
    route.fulfill({ json: { message: 'Service unavailable' }, status: 500 }),
  )

  await page.goto('/ru/patient/reports')

  await expect(page.getByRole('button', { name: 'Заполнить отчёт' })).toHaveCount(0)
  await expect(page.getByText('Не удалось выполнить действие. Попробуйте ещё раз.')).toBeVisible()
})

test('patient complaint, chat, devices and profile actions are exposed', async ({ page }) => {
  for (const [path, label] of [
    ['/ru/patient/complaints', 'Создать жалобу'],
    ['/ru/patient/chat', 'Сообщение'],
    ['/ru/patient/devices', 'Мои ТСР'],
    ['/ru/patient/profile', 'Личные данные'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByText(label).first()).toBeVisible()
    if (path.endsWith('/chat')) {
      await expect(page.getByText('2 непрочитанных')).toBeVisible()
    }
    await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
  }
})

test('patient photo attachment uses the QadamAI file picker', async ({ page }) => {
  await page.goto('/ru/patient/complaints')
  await page.getByRole('button', { name: 'Создать жалобу' }).click()
  const picker = page.locator('.product-file-control')
  await expect(picker).toBeVisible()
  await expect(picker.getByText('Выбрать фото')).toBeVisible()
  await expect(picker.locator('input[type="file"]')).toHaveClass(/sr-only/)
})

test('patient product routes fit a 360 px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 820 })
  for (const path of ['reports', 'complaints', 'chat', 'devices', 'profile']) {
    await page.goto(`/ru/patient/${path}`)
    const viewport = await page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= window.innerWidth,
      overflow: Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 0.5)
        .slice(0, 5)
        .map((element) => ({
          className: element.className,
          right: Math.round(element.getBoundingClientRect().right),
          tag: element.tagName,
        })),
    }))
    expect(
      viewport.fits,
      `/ru/patient/${path} must fit the 360 px viewport; overflow: ${JSON.stringify(viewport.overflow)}`,
    ).toBe(true)
  }
})

test('patient mobile shell marks only the current route and keeps account actions available', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 820 })
  await page.goto('/ru/patient/chat')

  const navigation = page.locator('.bottom-nav')
  await expect(navigation.getByRole('link', { name: 'Чат' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(navigation.getByRole('link', { name: 'Главная' })).not.toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(
    page.locator('.app-shell__topbar').getByRole('link', { name: 'QadamAI' }),
  ).toHaveAttribute('href', '/ru/patient')
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: 'test-results/qadam-mobile-shell.png', fullPage: true })
  await page.locator('.app-shell__topbar').getByRole('link', { name: 'QadamAI' }).click()
  await expect(page).toHaveURL(/\/ru\/patient$/)
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible()
})
