import { test, expect } from '@playwright/test';

test('product page has back to shop link', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await page.getByRole('link', { name: /back to shop/i }).click();
  await expect(page).toHaveURL('/');
});

test('logo from product page returns home', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await page.locator('nav').getByRole('link', { name: /GingerBros/i }).click();
  await expect(page).toHaveURL('/');
});

test('home anchor links work from product page', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await page.locator('nav').getByRole('link', { name: /^Shop$/i }).click();
  await expect(page).toHaveURL('/#shop');
  await expect(page.locator('#shop')).toBeVisible();
});

test('navigation cart button is visible on product page', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await expect(page.getByTestId('cart-button')).toBeVisible();
});
