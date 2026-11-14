import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const stored = {
  version: 1,
  resolution: { id: 'resolution', type: 'resolution', text: 'A saved resolution', position: { x: 250, y: 120 } },
  points: [{ id: 'point-7', type: 'pro', text: 'A reason outside the viewport', position: { x: -450, y: 1400 } }],
  links: [{ source: 'resolution', target: 'point-7' }],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('guide-seen', 'true'));
});

test('restores content, links and geometry; edits survive reload; new trie can be cancelled', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(data => localStorage.setItem('frezgi-trie-v1', JSON.stringify(data)), stored);
  await page.reload();
  const resolution = page.locator('[data-node-id="resolution"]');
  await expect(resolution).toContainText('A saved resolution');
  await expect(resolution).toHaveCSS('left', '250px');
  await expect(page.locator('.lines path')).toHaveCount(1);
  await resolution.dblclick();
  await page.getByRole('textbox', { name: 'Your resolution' }).fill('An edited resolution');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.reload();
  await expect(resolution).toContainText('An edited resolution');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'New trie' }).click();
  await expect(resolution).toContainText('An edited resolution');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'New trie' }).click();
  await expect(page.locator('.node')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Write your resolution' })).toBeVisible();
  await expect(page.locator('.lines path')).toHaveCount(0);
});

test('exports the entire trie with opaque or transparent background', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(data => localStorage.setItem('frezgi-trie-v1', JSON.stringify(data)), stored);
  await page.reload();
  for (const background of [true, false]) {
    await page.getByRole('checkbox', { name: 'Include background' }).setChecked(background);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export PNG' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('A saved resolution.png');
    const bytes = await readFile((await download.path())!);
    const pixels = await page.evaluate(async base64 => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      return { width: image.width, height: image.height,
        // Branding is present even when the rest of the background is transparent.
        brand: Array.from(ctx.getImageData(230, image.height - 130, 1, 1).data),
        alpha: ctx.getImageData(0, 0, 1, 1).data[3],
        // The off-screen supporting point must be drawn at its translated position.
        point: Array.from(ctx.getImageData(374, 2800, 1, 1).data) };
    }, bytes.toString('base64'));
    expect(pixels.width).toBeGreaterThan(2000);
    expect(pixels.height).toBeGreaterThan(3000);
    expect(pixels.brand).toEqual([23, 28, 38, 255]);
    expect(pixels.alpha).toBe(background ? 255 : 0);
    expect(pixels.point).toEqual([51, 132, 91, 255]);
  }
});

test('invalid saved data does not prevent starting a trie', async ({ page }) => {
  await page.goto('/');
  const cyclic = structuredClone(stored);
  cyclic.links[0].source = 'point-7';
  await page.evaluate(data => localStorage.setItem('frezgi-trie-v1', JSON.stringify(data)), cyclic);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Write your resolution' })).toBeVisible();
});

test('storage failure is visible while editing remains usable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'frezgi-trie-v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Unable to save');
  await page.getByRole('button', { name: 'Write your resolution' }).click();
  await page.getByRole('textbox', { name: 'Your resolution' }).fill('Still editable');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('[data-node-id="resolution"]')).toContainText('Still editable');
});

for (const width of [320, 1280]) {
  test(`brand and trie title fit in screenshots at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const header = page.locator('.trie-header');
    await expect(header).toContainText('Frezgi');
    await expect(header).toContainText('Untitled trie');
    await expect(header.locator('img')).toHaveJSProperty('complete', true);
    const bounds = (await header.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThan(width - 40);
    await page.screenshot({ path: `/tmp/frezgi-brand-${width}.png` });
  });
}
