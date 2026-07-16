import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321';
const managePreview = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== '1' && !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/artifacts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL,
    actionTimeout: 8_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      testMatch: [
        '**/smoke.spec.ts',
        '**/interactions.spec.ts',
        '**/accessibility.spec.ts',
        '**/case-studies.spec.ts',
        '**/seo.spec.ts',
        '**/cohesion.spec.ts',
        '**/ui-integrity.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      testMatch: ['**/smoke.spec.ts', '**/case-studies-mobile.spec.ts', '**/cohesion.spec.ts', '**/ui-integrity.spec.ts'],
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'reduced-motion',
      testMatch: ['**/smoke.spec.ts', '**/reduced-motion.spec.ts', '**/case-studies-motion.spec.ts', '**/cohesion.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
    {
      name: 'no-js',
      testMatch: ['**/no-js.spec.ts', '**/case-studies-no-js.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        javaScriptEnabled: false,
      },
    },
  ],
  ...(managePreview
    ? { webServer: {
        command: 'npm run preview -- --host 127.0.0.1 --port 4321',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
        stdout: 'pipe',
        stderr: 'pipe',
      } }
    : {}),
});
