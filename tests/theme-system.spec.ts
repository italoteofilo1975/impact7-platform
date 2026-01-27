import { test, expect } from '@playwright/test';

test.describe('Theme System Mode', () => {
  test('should follow OS preference when system theme is selected', async ({ page }) => {
    await page.goto('/');

    // Set OS preference to dark mode
    await page.emulateMedia({ colorScheme: 'dark' });

    // Open theme selector and select "System"
    await page.click('button[aria-label*="Tema"]');
    await page.click('text=System');

    // Wait for theme to apply
    await page.waitForTimeout(500);

    // Verify dark class is applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // Change OS preference to light mode
    await page.emulateMedia({ colorScheme: 'light' });

    // Wait for theme to update
    await page.waitForTimeout(500);

    // Verify dark class is removed
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('should show resolved theme in system mode indicator', async ({ page }) => {
    await page.goto('/');

    // Set OS preference to dark mode
    await page.emulateMedia({ colorScheme: 'dark' });

    // Open theme selector and select "System"
    await page.click('button[aria-label*="Tema"]');
    await page.click('text=System');

    // Wait for dropdown to close
    await page.waitForTimeout(300);

    // Open dropdown again to see indicator
    await page.click('button[aria-label*="Tema"]');

    // Verify "System (Dark)" is shown
    await expect(page.locator('text=System').first()).toContainText('Dark');
  });

  test('should persist system theme selection in localStorage', async ({ page }) => {
    await page.goto('/');

    // Select system theme
    await page.click('button[aria-label*="Tema"]');
    await page.click('text=System');

    // Reload page
    await page.reload();

    // Wait for page to load
    await page.waitForTimeout(500);

    // Open dropdown and verify system is still selected
    await page.click('button[aria-label*="Tema"]');
    
    // Verify checkmark is on System option
    const systemOption = page.locator('text=System').first();
    const parent = systemOption.locator('..');
    await expect(parent).toContainText('✓');
  });

  test('should update theme immediately when OS preference changes', async ({ page }) => {
    await page.goto('/');

    // Select system theme
    await page.click('button[aria-label*="Tema"]');
    await page.click('text=System');

    // Set OS to light
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(300);

    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Change OS to dark
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(300);

    await expect(htmlElement).toHaveClass(/dark/);

    // Change back to light
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(300);

    await expect(htmlElement).not.toHaveClass(/dark/);
  });
});
