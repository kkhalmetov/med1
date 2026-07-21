import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { installSession } from './helpers/session'

test.beforeEach(async ({ context, page }) => {
  await installSession(context, 'PRACTITIONER')
  await page.route('**/api/backend/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/patients')) {
      await route.fulfill({
        json: [{ id: 'p1', firstName: 'Айша', lastName: 'Серик', status: 'RED' }],
      })
    } else if (url.pathname.endsWith('/reports/r1/check')) {
      await route.fulfill({
        json: { id: 'r1', patientId: 'p1', checkedAt: '2026-07-20T18:12:30.000000' },
      })
    } else if (url.pathname.endsWith('/reports')) {
      await route.fulfill({
        json: [
          {
            id: 'r1',
            patientId: 'p1',
            patientFullName: 'Айша Серик',
            statusColor: 'RED',
            submittedAt: '2026-07-20T17:14:41.579395',
            painLevel: 3,
            discomfortLevel: 3,
            mobilityLevel: 3,
            sleepQuality: 3,
            comment: 'Тестовый отчёт',
          },
        ],
      })
    } else {
      await route.fulfill({ json: [] })
    }
  })
})

test('practitioner queues are prioritized and accessible @a11y', async ({ page }) => {
  await page.goto('/ru/practitioner')
  await expect(page.getByText('Требует срочного внимания')).toBeVisible()
  await expect(page.getByText('Серик Айша')).toBeVisible()
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])
})

test('practitioner can reach every workflow group', async ({ page }) => {
  for (const [path, label] of [
    ['/ru/practitioner/patients', 'Зарегистрировать пациента'],
    ['/ru/practitioner/reports', 'Отчёты пациентов'],
    ['/ru/practitioner/complaints', 'Жалобы пациентов'],
    ['/ru/practitioner/chat', 'Выберите пациента'],
    ['/ru/practitioner/devices', 'Выдать ТСР'],
    ['/ru/practitioner/profile', 'Контактные данные'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByText(label).first()).toBeVisible()
    await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Выполнить|Запустить/ })).toHaveCount(0)
  }
})

test('practitioner checks a report from the patient queue', async ({ page }) => {
  await page.goto('/ru/practitioner/reports')
  await page.getByRole('button', { name: /Айша Серик/ }).click()
  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/backend/reports/r1/check') && request.method() === 'PATCH',
  )
  await page.getByRole('button', { name: 'Отметить проверенным' }).click()
  await requestPromise
  await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
})

test('checked report updates immediately and keeps actions visually separated', async ({
  page,
}) => {
  await page.route('**/api/backend/reports/r1/check', (route) =>
    route.fulfill({
      json: {
        id: 'r1',
        patientId: 'p1',
        patientFullName: 'Айша Серик',
        checkedAt: '2026-07-20T18:12:30.000000',
      },
    }),
  )
  await page.goto('/ru/practitioner/reports')
  await page.getByRole('button', { name: /Айша Серик/ }).click()

  const reportPanel = page.locator('.product-layout .product-panel').nth(1)
  const details = reportPanel.locator('.detail-list')
  const actions = reportPanel.locator('.toolbar')
  await page.getByRole('button', { name: 'Отметить проверенным' }).click()
  const notice = reportPanel.getByRole('status').filter({ hasText: 'Отчёт отмечен проверенным' })

  await expect(page.getByRole('button', { name: 'Отметить проверенным' })).toBeDisabled()
  await expect(notice).toBeVisible()
  const [detailsBox, actionsBox, noticeBox] = await Promise.all([
    details.boundingBox(),
    actions.boundingBox(),
    notice.boundingBox(),
  ])
  expect(actionsBox!.y - (detailsBox!.y + detailsBox!.height)).toBeGreaterThanOrEqual(16)
  expect(noticeBox!.y - (actionsBox!.y + actionsBox!.height)).toBeGreaterThanOrEqual(12)
})

test('report check shows a specific service error instead of a generic failure', async ({
  page,
}) => {
  await page.route('**/api/backend/reports/r1/check', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Внутренняя ошибка сервера' }),
    }),
  )
  await page.goto('/ru/practitioner/reports')
  await page.getByRole('button', { name: /Айша Серик/ }).click()
  await page.getByRole('button', { name: 'Отметить проверенным' }).click()

  await expect(page.locator('.form-alert')).toHaveText('Сервис временно недоступен.')
  await expect(page.getByText('Не удалось выполнить действие. Попробуйте ещё раз.')).toHaveCount(0)
})

test('patient status history distinguishes a backend outage from empty history', async ({
  page,
}) => {
  await page.route('**/api/backend/patients/p1/status-history', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Внутренняя ошибка сервера' }),
    }),
  )
  await page.goto('/ru/practitioner/patients')
  await page.getByRole('button', { name: /Серик Айша/ }).click()

  await expect(page.getByText('История статусов временно недоступна.')).toBeVisible()
  await expect(page.getByText('Не удалось выполнить действие. Попробуйте ещё раз.')).toHaveCount(0)
})

test('practitioner sees the status timeline returned by the recovered backend', async ({
  page,
}) => {
  await page.route('**/api/backend/patients/p1/status-history', (route) =>
    route.fulfill({
      json: [
        {
          id: 'history-1',
          patientId: 'p1',
          status: 'YELLOW',
          changedByPractitionerId: 'practitioner-1',
          changedByFullName: 'Тестовый Специалист',
          changedAt: '2026-07-21T06:00:00.000000',
          comment: 'Статус обновлён',
        },
      ],
    }),
  )
  await page.goto('/ru/practitioner/patients')
  await page.getByRole('button', { name: /Серик Айша/ }).click()

  const history = page.getByRole('heading', { name: 'История статусов' }).locator('..')
  await expect(history.getByText('Тестовый Специалист')).toBeVisible()
  await expect(history.getByText(/Статус обновлён/)).toBeVisible()
  await expect(page.getByText('История статусов временно недоступна.')).toHaveCount(0)
})

test('practitioner photo attachment uses the Qadam file picker', async ({ page }) => {
  await page.goto('/ru/practitioner/patients')
  await page.getByRole('button', { name: 'Зарегистрировать пациента' }).click()
  const picker = page.locator('.product-file-control')
  await expect(picker).toBeVisible()
  await expect(picker.getByText('Выбрать фото')).toBeVisible()
  await expect(picker.locator('input[type="file"]')).toHaveClass(/sr-only/)
})

test('practitioner workspace fits a 360 px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 820 })
  await page.goto('/ru/practitioner/patients')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await expect(
    page.locator('.app-shell__topbar').getByRole('link', { name: 'Qadam' }),
  ).toHaveAttribute('href', '/ru/practitioner')
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible()
})
