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
    ['/ru/practitioner/reports', 'Отметить отчёт проверенным'],
    ['/ru/practitioner/complaints', 'Рассмотреть жалобу'],
    ['/ru/practitioner/chat', 'Написать пациенту'],
    ['/ru/practitioner/devices', 'Выдать изделие пациенту'],
    ['/ru/practitioner/profile', 'Изменить телефон специалиста'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByText(label)).toBeVisible()
  }
})
