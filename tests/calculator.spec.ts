import { test, expect } from '@playwright/test';

/**
 * E2E Test: Impact Calculator Flow
 * Tests: Homepage → Calculator → Calculation → Results
 */
test.describe('Impact Calculator', () => {
  test('should navigate to calculator and perform calculation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Verify homepage loaded
    await expect(page.getByText('Transform your Social Impact with Science')).toBeVisible();
    
    // Click "Calculate Impact" button
    await page.getByRole('link', { name: 'Calculate Impact' }).first().click();
    
    // Verify calculator page loaded
    await expect(page).toHaveURL('/calculadora');
    await expect(page.getByText('Impact Calculator')).toBeVisible();
    
    // Fill calculator form with default values (sliders are already set)
    // Just click "Calculate Impact" button
    await page.getByRole('button', { name: 'Calculate Impact' }).click();
    
    // Wait for results to appear
    await expect(page.getByText('Analysis Result')).toBeVisible({ timeout: 10000 });
    
    // Verify S-ROI result is displayed
    await expect(page.getByText(/Estimated S-ROI/i)).toBeVisible();
    await expect(page.getByText(/\d+\.?\d*x/)).toBeVisible(); // Matches "26.0x" format
    
    // Verify social value is displayed
    await expect(page.getByText(/Social Value Generated/i)).toBeVisible();
    await expect(page.getByText(/\$[\d,]+/)).toBeVisible(); // Matches "$2,604,167" format
    
    // Verify recommendation is displayed
    await expect(page.getByText(/Recommendation/i)).toBeVisible();
    
    // Verify action buttons are present
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Schedule Consulting' })).toBeVisible();
  });
  
  test('should show reference benchmarks', async ({ page }) => {
    await page.goto('/calculadora');
    
    // Verify reference benchmarks section exists
    await expect(page.getByText('Reference Benchmarks')).toBeVisible();
    await expect(page.getByText(/Minimum Recommended S-ROI/i)).toBeVisible();
    await expect(page.getByText(/Average S-ROI/i)).toBeVisible();
    await expect(page.getByText(/Top 10% S-ROI/i)).toBeVisible();
  });
});
