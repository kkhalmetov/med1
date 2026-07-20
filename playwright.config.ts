import { defineConfig, devices } from '@playwright/test'

const port = 3100
const localBaseUrl = `http://127.0.0.1:${port}`
const externalBaseUrl = process.env.E2E_BASE_URL
const useProductionServer = Boolean(process.env.CI || process.env.PLAYWRIGHT_PRODUCTION)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseUrl ?? localBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', testMatch: 'smoke.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', testMatch: 'smoke.spec.ts', use: { ...devices['Pixel 7'] } },
    { name: 'patient', testMatch: 'patient.spec.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'practitioner',
      testMatch: 'practitioner.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    { name: 'admin', testMatch: 'admin.spec.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'live',
      testMatch: 'live.spec.ts',
      use: { ...devices['Desktop Chrome'], trace: 'off', screenshot: 'off', video: 'off' },
    },
  ],
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: useProductionServer
            ? `pnpm start --hostname 127.0.0.1 --port ${port}`
            : `pnpm dev --hostname 127.0.0.1 --port ${port}`,
          url: localBaseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
})
