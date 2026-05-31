import { test, expect } from '@playwright/test';

test('should process a dine-in order through all kitchen states and charge it', async ({ page }) => {
  await page.goto('http://localhost:4200/menu?table=4');
  await page.locator('.grid >> button').first().click();
  await page.locator('button').filter({ hasText: /Anar a pagar|Demanar/i }).click();

  await page.getByText('Pagar a la barra').click();

  await page.getByRole('button', { name: /Enviar comanda/i }).click();
  await expect(page).toHaveURL(/.*order-status.*/);

  await page.goto('http://localhost:4201/login');
  await page.locator('input[name="email"]').fill('admin@lavurger.com');
  await page.locator('input[name="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sessió' }).click();

  await page.getByRole('button', { name: '→ Preparació' }).first().click();
  await page.getByRole('button', { name: '→ Llest' }).first().click();
  await page.getByRole('button', { name: '✓ Despatxar' }).first().click();

  await page.getByRole('link', { name: 'Monitor' }).click();
  await page.getByRole('button', { name: 'COBRAR' }).first().click();

  await expect(page).toHaveURL(/.*monitor.*/);
});
