import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should load contact page', async ({ page }) => {
    await page.goto('/contato');
    await expect(page.locator('h1')).toContainText('Contato');
  });

  test('should show contact form', async ({ page }) => {
    await page.goto('/contato');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contato');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/required/i, text=/obrigatório/i')).toHaveCount({ min: 1 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/contato');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/email/i')).toBeVisible();
  });
});
