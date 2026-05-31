import { test, expect } from '@playwright/test';

test('should complete a dine-in order with pay-at-counter method successfully', async ({ page }) => {
  await page.goto('http://localhost:4200/menu?table=4');

  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: '🍟 Acompanyaments' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

  await page.getByRole('button', { name: '🌯 Vurritos' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: /Anar a pagar/ }).click();

  await page.locator('label').filter({ hasText: /Pagar a la barra/ }).click();

  await page.getByRole('textbox', { name: /Ex: sense ceba/ }).fill('Sense ceba');

  await page.getByRole('button', { name: /Enviar comanda/ }).click();

  await expect(page).toHaveURL(/.*order-status.*/);
});
