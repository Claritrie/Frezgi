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

for (const width of [1280, 375]) {
  test(`action tooltips stay above the hint at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const node = page.locator('.resolution-node');
    await node.hover();
    for (const label of ['Add a supporting reason', 'Add an opposing reason', 'Add a point to explore']) {
      const button = page.getByRole('button', { name: label });
      await button.hover();
      await expect.poll(async () => {
        const bottom = await button.evaluate(element => {
          const tip = getComputedStyle(element, '::after');
          const scale = element.getBoundingClientRect().height / element.offsetHeight;
          return element.getBoundingClientRect().top +
            (parseFloat(tip.top) + parseFloat(tip.lineHeight) +
             parseFloat(tip.paddingTop) + parseFloat(tip.paddingBottom)) * scale;
        });
        return (await page.locator('.empty-hint').boundingBox())!.y - bottom;
      }).toBeGreaterThanOrEqual(8);
    }
  });
}
