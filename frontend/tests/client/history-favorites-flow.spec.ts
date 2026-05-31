import { test, expect } from '@playwright/test';

test('should manage favorites, reorder from history, and checkout successfully', async ({ page }) => {
  await page.goto('http://localhost:4200/menu');
  await page.locator('header').getByRole('button').click();
  await page.getByRole('button', { name: 'Iniciar sessió' }).click();

  await page.getByRole('textbox', { name: 'Correu electrònic' }).fill('pepo@gmail.com');
  await page.getByRole('textbox', { name: 'Contrasenya' }).fill('Pepo1234');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.waitForTimeout(1000);

  await page.locator('.grid button').first().click();

  await page.getByRole('button', { name: '🍟 Acompanyaments' }).click();
  await page.locator('.grid button').nth(1).click();

  await page.locator('header').getByRole('button').click();
  await page.getByRole('button', { name: 'Favorits' }).click();

  await page.waitForTimeout(1000);

  const cajonFavoritos = page.locator('div')
    .filter({ has: page.getByRole('heading', { name: 'Els teus favorits' }) })
    .filter({ has: page.getByText('Anar a pagar') })
    .last();

  await cajonFavoritos.getByRole('button').filter({ hasText: /^$/ }).last().click();

  await page.waitForTimeout(500);

  await cajonFavoritos.getByRole('button').first().click();

  await page.waitForTimeout(500);

  await page.locator('header').getByRole('button').click();
  await page.getByRole('button', { name: 'Les meues comandes' }).click();

  await page.getByText(/Comanda #ORD-/).first().click();
  await page.getByRole('button', { name: 'Tornar a demanar' }).click();

  await page.getByRole('textbox', { name: '4242 4242 4242' }).fill('4242 4242 4242 4242');
  await page.getByRole('textbox', { name: 'MM / YY' }).fill('01/27');
  await page.getByRole('textbox', { name: '•••' }).fill('123');

  await page.getByRole('button', { name: /Enviar comanda/ }).click();

  await expect(page).toHaveURL(/.*order-status.*/);
});
