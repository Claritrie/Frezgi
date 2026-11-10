import { defineConfig, devices } from '@playwright/test';
import dotenv from "dotenv"

dotenv.config({ path: './.env'});

// Tests run against the local dev server by default. Set PLAYWRIGHT_BASE_URL
// (for example in .env) to test another address, such as the live site.
const LOCAL_URL = 'http://localhost:5173';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || LOCAL_URL;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'dot' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Start the dev server for local runs, or reuse one that is already running */
  webServer: baseURL === LOCAL_URL ? {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: LOCAL_URL,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});
