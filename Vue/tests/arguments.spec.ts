import { test, expect, Locator } from '@playwright/test';

async function isArgumentElementVisible(page, argumentText: String): Promise<boolean> {
  const element: Locator = page.getByText(argumentText);
  return await element.isVisible();
}

const RESOLUTION = 'Homework should be optional';

test.describe('Can add arguments', () => {
  test.beforeEach(async ({ page }) => {
    // Skip the first-visit welcome guide so the canvas is usable
    await page.addInitScript(() => localStorage.setItem('guide-seen', 'true'));
    await page.goto('/');

    // A resolution must be written before reasons can be added
    await page.getByRole('button', { name: 'Write your resolution' }).click();
    await page.getByRole('textbox', { name: 'Your resolution' }).fill(RESOLUTION);
    await page.getByRole('textbox', { name: 'Your resolution' }).press('Enter');
  });

  test('should add a positive argument', async ({ page }) => {
    await page.getByText(RESOLUTION).hover();
    await page.getByText('👍').click();
    await page.getByRole('textbox', { name: `Supporting: "${RESOLUTION}"` }).fill('This is a really good point, couldn\'t agree more');
    await page.getByRole('textbox', { name: `Supporting: "${RESOLUTION}"` }).press('Enter');
    const isVisible = await isArgumentElementVisible(page, 'This is a really good point, couldn\'t agree more');
    expect(isVisible).toBe(true);
  });

  test('should add an exploring argument', async ({ page }) => {
    await page.getByText(RESOLUTION).hover();
    await page.getByText('✋').click();
    await page.getByRole('textbox', { name: `Exploring: "${RESOLUTION}"` }).fill('This certainly needs to be discussed further');
    await page.getByRole('textbox', { name: `Exploring: "${RESOLUTION}"` }).press('Enter');
    const isVisible = await isArgumentElementVisible(page, 'This certainly needs to be discussed further');
    expect(isVisible).toBe(true);
  });

  test('should add a negative argument', async ({page}) => {
    await page.getByText(RESOLUTION).hover();
    await page.getByText('👎').click();
    await page.getByRole('textbox', { name: `Opposing: "${RESOLUTION}"` }).fill('I can\'t believe you would say something so atrocious');
    await page.getByRole('textbox', { name: `Opposing: "${RESOLUTION}"` }).press('Enter');

    const isVisible = await isArgumentElementVisible(page, 'I can\'t believe you would say something so atrocious')
    expect(isVisible).toBe(true);
  });
});

test.describe('Resolution comes first', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('guide-seen', 'true'));
    await page.goto('/');
  });

  test('should not offer reasons before the resolution is written', async ({ page }) => {
    await page.getByText('Main Resolution').hover();
    await expect(page.getByRole('button', { name: 'Write your resolution' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add a supporting reason' })).toHaveCount(0);
  });

  test('should not accept the placeholder text as the resolution', async ({ page }) => {
    await page.getByRole('button', { name: 'Write your resolution' }).click();
    const box = page.getByRole('textbox', { name: 'Your resolution' });
    await expect(box).toHaveValue('');
    await box.fill('Main Resolution');
    await box.press('Enter');
    await expect(page.getByText('Write your own statement to examine.')).toBeVisible();
  });
});
