import { test, expect } from '@playwright/test';

test.describe('Impact Calculator', () => {
  test('should load calculator page', async ({ page }) => {
    await page.goto('/calculadora');
    await expect(page.locator('h1')).toContainText('Calculadora');
  });

  test('should calculate S-ROI', async ({ page }) => {
    await page.goto('/calculadora');
    await page.fill('input[name="investment"]', '100000');
    await page.click('button:has-text("Calculate")');
    await expect(page.locator('text=/S-ROI/')).toBeVisible({ timeout: 10000 });
  });
});
