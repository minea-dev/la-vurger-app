import { test, expect } from '@playwright/test';

test('should complete a full guest checkout with credit card payment successfully', async ({ page }) => {
  await page.goto('http://localhost:4200/menu');

  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: '🌯 Vurritos' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: '🍟 Acompanyaments' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: '🥤 Begudes' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: '🍨 Postres' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

  await page.getByRole('button', { name: /Anar a pagar/ }).click();
  await page.getByRole('button', { name: '🍔 Continuar i demanar sense' }).click();

  await page.getByRole('textbox', { name: 'Ex: María Pérez' }).fill('María Pérez');
  await page.getByRole('textbox', { name: 'Ex: 612345678' }).fill('612345698');

  await page.getByRole('textbox', { name: '4242 4242 4242' }).fill('4242 4242 4242 4242');
  await page.getByRole('textbox', { name: 'MM / YY' }).fill('01/27');
  await page.getByRole('textbox', { name: '•••' }).fill('123');

  await page.getByRole('textbox', { name: 'Ex: sense ceba, al·lèrgia als' }).fill('Sense ceba');

  await page.getByRole('button', { name: /Enviar comanda/ }).click();

  await expect(page).toHaveURL(/.*order-status.*/);
});
