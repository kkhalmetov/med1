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
    } else if (url.pathname.endsWith('/reports')) {
      await route.fulfill({
        json: [{ id: 'r1', patientFullName: 'Айша Серик', statusColor: 'RED' }],
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

test('practitioner workspace fits a 360 px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 820 })
  await page.goto('/ru/practitioner/patients')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
