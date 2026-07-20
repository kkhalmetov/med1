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
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])

  await page.goto('/ru/patient/reports')
  const report = page.getByRole('article').filter({ hasText: 'Отправить ежедневный отчёт' })
  await report.getByRole('button').first().click()
  await report.locator('input[name="deviceId"]').fill('00000000-0000-4000-8000-000000000002')
  await report.locator('input[name="painLevel"]').fill('2')
  await report.locator('input[name="discomfortLevel"]').fill('3')
  await report.locator('input[name="mobilityLevel"]').fill('8')
  await report.locator('input[name="sleepQuality"]').fill('7')
  await report.getByRole('button', { name: /Выполнить/ }).click()
  await expect(report.getByText('Стабильное состояние')).toBeVisible()
})

test('patient complaint, chat, devices and profile actions are exposed', async ({ page }) => {
  for (const [path, label] of [
    ['/ru/patient/complaints', 'Создать жалобу'],
    ['/ru/patient/chat', 'Написать специалисту'],
    ['/ru/patient/devices', 'Мои акты выдачи'],
    ['/ru/patient/profile', 'Изменить профиль пациента'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByText(label)).toBeVisible()
  }
})
