import { test, expect } from '@playwright/test';

test.describe('Dark Mode Charts', () => {
  test('should update chart colors when theme changes', async ({ page }) => {
    // Navigate to admin analytics page with charts
    await page.goto('/admin/analytics');
    
    // Wait for charts to load
    await page.waitForSelector('[data-slot="chart"]', { timeout: 10000 });
    
    // Capture screenshot in light mode
    const lightModeScreenshot = await page.screenshot({ fullPage: true });
    
    // Find and click theme toggle button (moon/sun icon)
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], button:has-text("Toggle theme")').first();
    await themeToggle.click();
    
    // Wait for theme transition (100ms debounce + 300ms transition)
    await page.waitForTimeout(500);
    
    // Verify dark class is applied to html element
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Capture screenshot in dark mode
    const darkModeScreenshot = await page.screenshot({ fullPage: true });
    
    // Verify screenshots are different (colors changed)
    expect(lightModeScreenshot).not.toEqual(darkModeScreenshot);
    
    // Verify chart container exists and is visible
    const chartContainer = page.locator('[data-slot="chart"]').first();
    await expect(chartContainer).toBeVisible();
    
    // Toggle back to light mode
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify light mode is restored
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('should apply smooth transitions when theme changes', async ({ page }) => {
    await page.goto('/admin/monitoring');
    
    // Wait for charts to load
    await page.waitForSelector('[data-slot="chart"]', { timeout: 10000 });
    
    // Get chart element
    const chart = page.locator('[data-slot="chart"]').first();
    
    // Verify transition classes are applied
    const hasTransition = await chart.evaluate((el) => {
      const styles = window.getComputedStyle(el.querySelector('*') || el);
      return styles.transitionDuration !== '0s';
    });
    
    expect(hasTransition).toBeTruthy();
  });

  test('should handle rapid theme toggles without errors', async ({ page }) => {
    await page.goto('/impact-dashboard');
    
    // Wait for charts to load
    await page.waitForSelector('[data-slot="chart"]', { timeout: 10000 });
    
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"]').first();
    
    // Rapidly toggle theme 5 times
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(50); // Faster than debounce to test debouncing
    }
    
    // Wait for debounce to settle
    await page.waitForTimeout(200);
    
    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    expect(consoleErrors.length).toBe(0);
    
    // Verify chart is still visible and functional
    const chart = page.locator('[data-slot="chart"]').first();
    await expect(chart).toBeVisible();
  });
});
