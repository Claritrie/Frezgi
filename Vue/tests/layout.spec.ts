import { test, expect } from '@playwright/test';

const statement = 'The Sony Gaming division will not last the year 2028';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('guide-seen', 'true'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Write your resolution' }).click();
  const input = page.getByRole('textbox', { name: 'Your resolution' });
  await input.fill(statement);
  await input.press('Enter');
  await page.mouse.move(0, 0);
});

test('hint follows the rendered resolution height, including its hover menu', async ({ page }) => {
  const node = page.locator('.resolution-node');
  const hint = page.locator('.empty-hint');
  for (const hovered of [false, true, false]) {
    if (hovered) await node.hover();
    else await page.mouse.move(0, 0);
    await expect.poll(async () => {
      const box = await node.boundingBox();
      const help = await hint.boundingBox();
      return help!.y - (box!.y + box!.height);
    }).toBeGreaterThanOrEqual(16);
  }
});
