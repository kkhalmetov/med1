import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { installSession } from './helpers/session'

test.beforeEach(async ({ context, page }) => {
  await installSession(context, 'ADMIN')
  await page.route('**/api/backend/**', async (route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({
        json: { id: 'created-1', name: 'Реабилитолог', code: 'REHAB' },
        status: 201,
      })
    else await route.fulfill({ json: [] })
  })
})

test('admin dashboard and registries are accessible @a11y', async ({ page }) => {
  await page.goto('/ru/admin')
  await expect(page.getByRole('heading', { name: 'Управление Qadam' })).toBeVisible()
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])

  await page.goto('/ru/admin/qualifications')
  const create = page.getByRole('article').filter({ hasText: 'Создать квалификацию' })
  await create.getByRole('button').first().click()
  await create.locator('input[name="name"]').fill('Реабилитолог')
  await create.getByRole('button', { name: /Выполнить/ }).click()
  await expect(create.getByText('Реабилитолог')).toBeVisible()
})

test('admin can reach practitioner, organization, device, export and dispense tools', async ({
  page,
}) => {
  for (const [path, label] of [
    ['/ru/admin/organizations', 'Создать медицинскую организацию'],
    ['/ru/admin/practitioners', 'Зарегистрировать специалиста'],
    ['/ru/admin/devices', 'Добавить изделие'],
    ['/ru/admin/dispenses', 'Скачать пациентов в CSV'],
    ['/ru/admin/profile', 'Сменить пароль'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByText(label)).toBeVisible()
  }
})
