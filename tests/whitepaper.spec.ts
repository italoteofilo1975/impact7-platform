import { test, expect } from '@playwright/test';

/**
 * E2E Test: Whitepaper Download Flow
 * Tests: Homepage → Whitepaper → Form Fill → Download
 */
test.describe('Whitepaper Download', () => {
  test('should navigate to whitepaper page and show form', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Click "Download Whitepaper" button
    await page.getByRole('link', { name: 'Download Whitepaper' }).first().click();
    
    // Verify whitepaper page loaded
    await expect(page).toHaveURL('/whitepaper');
    await expect(page.getByText('IMPACT7 Whitepaper')).toBeVisible();
    
    // Verify whitepaper details
    await expect(page.getByText('140 pages')).toBeVisible();
    await expect(page.getByText('PDF')).toBeVisible();
    await expect(page.getByText('v2.0')).toBeVisible();
    
    // Verify table of contents
    await expect(page.getByText('Table of Contents')).toBeVisible();
    await expect(page.getByText('Introduction to Social Impact')).toBeVisible();
    await expect(page.getByText('The Impact Equation: I = (E × C⁷) / R')).toBeVisible();
    
    // Verify download form is present
    await expect(page.getByLabel('Full Name *')).toBeVisible();
    await expect(page.getByLabel('Email *')).toBeVisible();
    await expect(page.getByLabel('Organization (optional)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download Free Whitepaper' })).toBeVisible();
  });
  
  test('should validate required fields', async ({ page }) => {
    await page.goto('/whitepaper');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Download Free Whitepaper' }).click();
    
    // Verify validation errors appear (HTML5 validation)
    const nameInput = page.getByLabel('Full Name *');
    const emailInput = page.getByLabel('Email *');
    
    await expect(nameInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('required', '');
  });
  
  test('should fill form with valid data', async ({ page }) => {
    await page.goto('/whitepaper');
    
    // Fill form with valid data
    await page.getByLabel('Full Name *').fill('Test User');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Organization (optional)').fill('Test Organization');
    
    // Verify form is filled
    await expect(page.getByLabel('Full Name *')).toHaveValue('Test User');
    await expect(page.getByLabel('Email *')).toHaveValue('test@example.com');
    await expect(page.getByLabel('Organization (optional)')).toHaveValue('Test Organization');
  });
});
