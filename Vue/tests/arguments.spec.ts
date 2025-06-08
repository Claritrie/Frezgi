import { test, expect, Locator } from '@playwright/test';

async function isArgumentElementVisible(page, argumentText: String): Promise<boolean> {
  const element: Locator = page.getByText(argumentText);
  return await element.isVisible();
}

test.describe('Can add arguments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://frezgi.com/');
  });

  test('should add a positive argument', async ({ page }) => {
    await page.getByText('Main Resolution').hover();
    await page.getByText('👍').click();
    await page.getByRole('textbox', { name: 'Supporting: "Main Resolution"' }).fill('This is a really good point, couldn\'t agree more');
    await page.getByRole('textbox', { name: 'Supporting: "Main Resolution"' }).press('Enter');
    const isVisible = await isArgumentElementVisible(page, 'This is a really good point, couldn\'t agree more');
    expect(isVisible).toBe(true);
  });

  test('should add an exploring argument', async ({ page }) => {
    await page.getByText('Main Resolution').hover();
    await page.getByText('✋').click();
    await page.getByRole('textbox', { name: 'Exploring: "Main Resolution"' }).fill('This certainly needs to be discussed further');
    await page.getByRole('textbox', { name: 'Exploring: "Main Resolution"' }).press('Enter');
    const isVisible = await isArgumentElementVisible(page, 'This certainly needs to be discussed further');
    expect(isVisible).toBe(true);
  });

  test('should add a negative argument', async ({page}) => {
    await page.getByText('Main Resolution').hover();
    await page.getByText('👎').click();
    await page.getByRole('textbox', { name: 'Opposing: "Main Resolution"' }).fill('I can\'t believe you would say something so atrocious');
    await page.getByRole('textbox', { name: 'Opposing: "Main Resolution"' }).press('Enter');

    const isVisible = await isArgumentElementVisible(page, 'I can\'t believe you would say something so atrocious')
    expect(isVisible).toBe(true);
  });
});


// test('Should meet performance metrics', async ({ page }) => {
//   // run a lighthouse scan??
//   expect(true).toBe(true)
// })
