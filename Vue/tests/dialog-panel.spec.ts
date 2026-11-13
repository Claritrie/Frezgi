import { test, expect } from '@playwright/test';

for (const width of [1280, 320]) {
  test(`long dialog labels stay inside the dialog at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 480 });
    await page.addInitScript(() => localStorage.setItem('guide-seen', 'true'));
    await page.goto('/');
    await page.getByRole('button', { name: 'Write your resolution' }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('sdfsasdf'.repeat(10));
    await page.getByRole('dialog').getByRole('textbox').press('Enter');
    await page.locator('.resolution-node').hover();
    await page.getByRole('button', { name: 'Add a supporting reason' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(16);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 16);
    await page.getByRole('dialog').getByRole('textbox').fill('A reason');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(dialog).toHaveCount(0);
  });
}
