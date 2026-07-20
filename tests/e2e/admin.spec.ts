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
  await page.getByRole('button', { name: 'Добавить квалификацию' }).click()
  await page.getByLabel('Название').fill('Реабилитолог')
  await page.getByLabel('Код').fill('REHAB')
  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/backend/qualifications') && request.method() === 'POST',
  )
  await page.getByRole('button', { name: 'Добавить квалификацию' }).last().click()
  expect((await requestPromise).postDataJSON()).toEqual({ name: 'Реабилитолог', code: 'REHAB' })
  await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
})

test('admin can reach practitioner, organization, device, export and dispense tools', async ({
  page,
}) => {
  for (const [path, label] of [
    ['/ru/admin/organizations', 'Добавить организацию'],
    ['/ru/admin/practitioners', 'Зарегистрировать специалиста'],
    ['/ru/admin/devices', 'Добавить ТСР'],
    ['/ru/admin/dispenses', 'Акты выдачи'],
    ['/ru/admin/profile', 'Сменить пароль'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByText(label).first()).toBeVisible()
    await expect(page.getByText(/\b(GET|POST|PATCH)\b/)).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Выполнить|Запустить/ })).toHaveCount(0)
  }
})

test('admin dispense search controls share one baseline', async ({ page }) => {
  await page.goto('/ru/admin/dispenses')
  const input = page.getByLabel('Идентификатор пациента')
  const filter = page.getByRole('group', { name: 'Фильтр' })
  const inputBox = await input.boundingBox()
  const filterBox = await filter.boundingBox()
  expect(inputBox).not.toBeNull()
  expect(filterBox).not.toBeNull()
  expect(
    Math.abs(inputBox!.y + inputBox!.height - (filterBox!.y + filterBox!.height)),
  ).toBeLessThanOrEqual(2)
})

test('admin photo attachment uses the Qadam file picker', async ({ page }) => {
  await page.goto('/ru/admin/practitioners')
  await page.getByRole('button', { name: 'Зарегистрировать специалиста' }).click()
  const picker = page.locator('.product-file-control')
  await expect(picker).toBeVisible()
  await expect(picker.getByText('Выбрать фото')).toBeVisible()
  await expect(picker.locator('input[type="file"]')).toHaveClass(/sr-only/)
})

test('admin registry fits a 360 px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 820 })
  await page.goto('/ru/admin/practitioners')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
