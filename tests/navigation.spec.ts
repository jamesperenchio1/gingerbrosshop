import { test, expect } from '@playwright/test';

test('product page breadcrumb links back to the shop', async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: /^Shop$/ }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test('logo from product page returns home', async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await page.getByRole('link', { name: /GingerBros home/i }).click();
  await expect(page).toHaveURL('/');
});

test('main nav Shop link opens the shop page', async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^Shop$/i }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(page.locator('#shop')).toBeVisible();
});

test('every page has the footer and a skip link', async ({ page }) => {
  await page.goto('/faq');
  await expect(page.locator('footer#footer')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();
});

test('navigation cart button is visible on product page', async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await expect(page.getByTestId('cart-button')).toBeVisible();
});
