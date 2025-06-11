/**
 * The purpose of this test is to run a lighthouse performance test
 * These will be run per commit to ensure that any new additions to the application do not result in a performance dip
 */

import playwright from 'playwright';
import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { desktopConfig } from 'lighthouse';

const thresholds = {
  performance: 80,
  accessibility: 80,
  'best-practices': 80,
  seo: 90
}

test.describe('Initial Page Load', () => {
  test('Should meet the thresholds', async ({browserName}) => {
    // We only run this test for chromium based browsers due to lighthouse being a chrome tool
    test.skip(browserName !== 'chromium');

    const browser = await playwright['chromium'].launch({
      args: ['--remote-debugging-port=9222'],
    });
    const page = await browser.newPage();
    await page.goto('/');

    await playAudit({
      page: page,
      thresholds: thresholds,
      config: desktopConfig,
      port: 9222,
      reports: {
        formats: {
          html: true, //defaults to false
        },
        name: `lighthouse-${new Date().toISOString()}`, //defaults to `lighthouse-${new Date().getTime()}`
        directory: `${process.cwd()}/lighthouse`, //defaults to `${process.cwd()}/lighthouse`
      },
    });

    await browser.close();
  });
});

// TODO: When arguments can be persisted, write a spec to validate the performance when there are a large quantity to render on page load