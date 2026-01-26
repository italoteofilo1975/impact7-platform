import { test, expect } from '@playwright/test';

/**
 * E2E Test: Contact Form Flow
 * Tests: Homepage → Contact → Form Fill → Submit
 */
test.describe('Contact Form', () => {
  test('should navigate to contact page and show form', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Click "Contact" button in header
    await page.getByRole('link', { name: 'Contact' }).first().click();
    
    // Verify contact page loaded
    await expect(page).toHaveURL('/contato');
    await expect(page.getByText('Entre em Contato')).toBeVisible();
    
    // Verify contact information
    await expect(page.getByText('contato@impact7.com.br')).toBeVisible();
    await expect(page.getByText('+55 (11) 99999-9999')).toBeVisible();
    await expect(page.getByText('São Paulo, SP - Brasil')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.getByLabel('Nome Completo *')).toBeVisible();
    await expect(page.getByLabel('Email *')).toBeVisible();
    await expect(page.getByLabel('Telefone')).toBeVisible();
    await expect(page.getByLabel('Organização')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Selecione um assunto' })).toBeVisible();
    await expect(page.getByPlaceholder('Descreva como podemos ajudar...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar Mensagem' })).toBeVisible();
  });
  
  test('should validate required fields', async ({ page }) => {
    await page.goto('/contato');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Enviar Mensagem' }).click();
    
    // Verify validation errors appear (HTML5 validation)
    const nameInput = page.getByLabel('Nome Completo *');
    const emailInput = page.getByLabel('Email *');
    
    await expect(nameInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('required', '');
  });
  
  test('should fill form with valid data', async ({ page }) => {
    await page.goto('/contato');
    
    // Fill form with valid data
    await page.getByLabel('Nome Completo *').fill('Test User');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Telefone').fill('(11) 99999-9999');
    await page.getByLabel('Organização').fill('Test Organization');
    await page.getByPlaceholder('Descreva como podemos ajudar...').fill('This is a test message for E2E testing.');
    
    // Verify form is filled
    await expect(page.getByLabel('Nome Completo *')).toHaveValue('Test User');
    await expect(page.getByLabel('Email *')).toHaveValue('test@example.com');
    await expect(page.getByLabel('Telefone')).toHaveValue('(11) 99999-9999');
    await expect(page.getByLabel('Organização')).toHaveValue('Test Organization');
    await expect(page.getByPlaceholder('Descreva como podemos ajudar...')).toHaveValue('This is a test message for E2E testing.');
  });
  
  test('should show FAQ section', async ({ page }) => {
    await page.goto('/contato');
    
    // Verify FAQ section exists
    await expect(page.getByText('Perguntas Frequentes')).toBeVisible();
    await expect(page.getByText('Quanto custa uma consultoria?')).toBeVisible();
    await expect(page.getByText('Vocês atendem todo o Brasil?')).toBeVisible();
    await expect(page.getByText('Qual o prazo de resposta?')).toBeVisible();
  });
});
