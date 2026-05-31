import { test, expect } from '@playwright/test';

test('should register a new user during checkout and complete order', async ({ page }) => {
  await page.goto('http://localhost:4200/menu');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: '🌯 Vurritos' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

  await page.getByRole('button', { name: /Anar a pagar/ }).click();
  await page.getByRole('button', { name: 'Registrar-se' }).click();

  const uniqueEmail = `pepo.${Date.now()}@gmail.com`;

  await page.getByRole('textbox', { name: 'Nom complet' }).fill('Pepo');
  await page.getByRole('textbox', { name: 'Correu electrònic' }).fill(uniqueEmail);
  await page.getByRole('textbox', { name: 'Telèfon mòbil' }).fill('666666666');

  await page.getByRole('textbox', { name: 'Contrasenya' }).fill('Pepo1234');
  await page.getByRole('button', { name: 'Registrar-se' }).click();

  const botonEntrar = page.getByRole('button', { name: 'Entrar' });
  await botonEntrar.waitFor({ state: 'visible' });

  await page.getByRole('textbox', { name: 'Correu electrònic' }).fill(uniqueEmail);
  await page.getByRole('textbox', { name: 'Contrasenya' }).fill('Pepo1234');
  await botonEntrar.click();

  await page.waitForTimeout(1500);

  await page.getByRole('textbox', { name: '4242 4242 4242' }).fill('4242 4242 4242 4242');
  await page.getByRole('textbox', { name: 'MM / YY' }).fill('01/27');
  await page.getByRole('textbox', { name: '•••' }).fill('123');

  await page.getByRole('button', { name: /Enviar comanda/ }).click();

  await expect(page).toHaveURL(/.*order-status.*/);
});
