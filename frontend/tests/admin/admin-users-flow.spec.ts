import { test, expect } from '@playwright/test';

test('super admin should create, edit, toggle status of staff users, and logout', async ({ page }) => {
  await page.goto('http://localhost:4201/login');
  await page.locator('input[name="email"]').fill('admin@lavurger.com');
  await page.locator('input[name="password"]').fill('1234');
  await page.getByRole('button', { name: 'Iniciar sessió' }).click();

  await page.getByRole('link', { name: 'Usuaris' }).click();

  const timestamp = Date.now();
  const newUserName = `Usuari Nou`;
  const uniqueEmail = `nou.user.${timestamp}@lavurger.com`;
  const updatedUserName = `Usuari Editat`;

  await page.getByRole('button', { name: 'Nou usuari' }).click();
  await page.getByRole('textbox').nth(1).fill(newUserName);
  await page.getByRole('textbox').nth(2).fill(uniqueEmail);
  await page.getByRole('textbox', { name: /Mínim 8 caràcters/ }).fill('Admin1234!');
  await page.getByRole('button', { name: 'Crear usuari' }).click();

  await page.getByRole('textbox', { name: /Cercar per nom/i }).fill(uniqueEmail);

  await page.waitForTimeout(1000);

  await expect(page.locator('tbody')).toContainText(newUserName);

  await page.locator('.hover\\:bg-admin-blue-lt').first().click();

  await page.getByRole('textbox').nth(1).fill(updatedUserName);
  await page.getByRole('button', { name: 'Desar canvis' }).click();

  await page.getByRole('textbox', { name: /Cercar per nom/i }).fill('');
  await page.getByRole('textbox', { name: /Cercar per nom/i }).fill(uniqueEmail);

  await page.waitForTimeout(1000);
  await expect(page.locator('tbody')).toContainText(updatedUserName);

  await page.getByRole('button', { name: 'Desactivar usuari' }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Activar usuari' }).first().click();

  await page.getByText('AD Admin').click();
  await page.getByRole('button', { name: 'Tancar sessió' }).click();

  await expect(page).toHaveURL(/.*login.*/);
});
