import { test, expect } from '@playwright/test';

test('manager should process orders, manage products, handle clients, and logout', async ({ page }) => {
  await page.goto('http://localhost:4201/login');
  await page.locator('input[name="email"]').fill('carles.manager@lavurger.com');
  await page.locator('input[name="password"]').fill('Carles1234');
  await page.getByRole('button', { name: 'Iniciar sessió' }).click();

  await page.getByRole('link', { name: 'Cuina' }).click();
  await page.getByRole('button', { name: '→ Preparació' }).first().click();
  await page.getByRole('button', { name: '→ Llest' }).first().click();
  await page.getByRole('button', { name: '✓ Despatxar' }).first().click();

  await page.getByRole('link', { name: 'Monitor' }).click();
  await page.getByRole('button', { name: /ENTREGAR|COBRAR/i }).first().click();

  await page.getByRole('link', { name: 'Històric' }).click();
  await page.getByText(/ORD-/).first().click();
  await page.locator('.fixed.inset-0').getByRole('button').first().click();

  await page.getByRole('link', { name: 'Productes' }).click();
  await page.getByRole('button', { name: 'Nou producte' }).click();

  const uniqueProductName = `Vurger Carles ${Date.now()}`;

  await page.getByRole('textbox').nth(1).fill(uniqueProductName);
  await page.getByRole('spinbutton').first().fill('5');

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Seleccionar imatge').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('tests/fixtures/bur-clas.png');
  await page.getByRole('button', { name: 'Desar producte' }).click();

  await page.getByRole('textbox', { name: 'Cercar producte...' }).fill(uniqueProductName);
  await expect(page.getByText(uniqueProductName)).toBeVisible();

  await page.locator('.hover\\:bg-admin-red-lt').first().click();

  await page.getByRole('button', { name: 'Eliminar producte' }).click();

  await page.waitForTimeout(1000);

  await page.getByRole('link', { name: 'Clients' }).click();

  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: /Bloquejar client|Desbloquejar client/i }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /Bloquejar client|Desbloquejar client/i }).first().click();

  await page.getByRole('button', { name: /Editar client/i }).first().click();
  await page.getByRole('button', { name: 'Cancel·lar' }).click();

  await page.getByText('CA Manager').click();
  await page.getByRole('button', { name: 'Tancar sessió' }).click();

  await expect(page).toHaveURL(/.*login.*/);
});
