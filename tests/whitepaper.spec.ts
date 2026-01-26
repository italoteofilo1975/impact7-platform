import { test, expect } from '@playwright/test';

test.describe('Whitepaper Download', () => {
  test('should load whitepaper page', async ({ page }) => {
    await page.goto('/whitepaper');
    await expect(page.locator('h1')).toContainText('Whitepaper');
  });

  test('should show download form', async ({ page }) => {
    await page.goto('/whitepaper');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Download")')).toBeVisible();
  });

  test('should validate email', async ({ page }) => {
    await page.goto('/whitepaper');
    await page.fill('input[name="email"]', 'invalid');
    await page.click('button:has-text("Download")');
    await expect(page.locator('text=/email/i')).toBeVisible();
  });
});
