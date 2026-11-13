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


test('colour panel toggle aligns with its edge and closed controls cannot receive focus', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('guide-seen', 'true'));
  await page.goto('/');
  const toggle = page.locator('.toggle-panel-btn');
  const panel = page.locator('#color-settings');
  await expect(panel).toHaveAttribute('inert', '');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).not.toHaveAttribute('inert');
  await expect.poll(async () => {
    const edge = (await panel.boundingBox())!;
    return Math.abs((await toggle.boundingBox())!.x - (edge.x + edge.width) - 5);
  }).toBeLessThan(1);
  const swatch = page.getByLabel('Supporting background', { exact: true });
  await swatch.fill('#123456');
  await expect(swatch).toHaveValue('#123456');
  await page.getByRole('button', { name: 'Reset Colors' }).click();
  await expect(swatch).toHaveValue('#33845b');
});
