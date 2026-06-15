import { test, expect } from '@playwright/test';

test('add to cart from product page opens global drawer', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await expect(page.locator('h1')).toContainText('Unpasteurized Ginger Fizz');

  const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
  await addBtn.click();

  // Cart drawer should open immediately without navigating away
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText('Unpasteurized Ginger Fizz').nth(1)).toBeVisible();

  // Cart should be accessible from the nav cart button
  await page.locator('div.fixed.inset-0.bg-black\\/20').first().click();
  await expect(page.getByRole('heading', { name: /your cart/i })).not.toBeVisible();
  await page.locator('nav').getByRole('button', { name: /cart/i }).click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
});

test('cart persists after reload on product page', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
  await page.reload();
  await page.locator('nav').getByRole('button', { name: /cart/i }).click();
  await expect(page.getByText('Unpasteurized Ginger Fizz').nth(1)).toBeVisible();
});

test('cart drawer does not show payment method selector', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
  await expect(page.getByText(/Card \/ PromptPay/i)).not.toBeVisible();
  await expect(page.getByText(/Cash on Delivery/i)).not.toBeVisible();
  await expect(page.getByRole('button', { name: /checkout with stripe/i })).toBeVisible();
});

test('hero headline is visible without bottle overlay', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('#hero');
  await expect(hero.getByRole('heading', { name: /GingerBros Ginger Fizz/i })).toBeVisible();
  await expect(hero.locator('img[alt*="bottle" i]')).not.toBeVisible();
});

test('cart badge shows item count in navigation', async ({ page }) => {
  await page.goto('/');
  const cartBtn = page.locator('nav').getByRole('button', { name: /cart/i });
  await expect(cartBtn.locator('span.absolute')).not.toBeAttached();

  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(cartBtn.locator('span.absolute')).toHaveText('1');

  // Increase quantity
  await page.getByRole('button', { name: /increase quantity/i }).click();
  await expect(cartBtn.locator('span.absolute')).toHaveText('2');
});

test('cart stays open when navigating to a product page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();

  // Click the product image in the cart to navigate via client-side routing
  await page.locator('div.z-\\[70\\] img[alt="Unpasteurized Ginger Fizz"]').first().click();
  await expect(page.locator('h1')).toContainText('Unpasteurized Ginger Fizz');
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
  await expect(page.locator('div.fixed.inset-0.bg-black\\/20')).toBeAttached();
});

test('cart overlay is not attached when cart is closed', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('div.fixed.inset-0.bg-black\\/20')).not.toBeAttached();
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(page.locator('div.fixed.inset-0.bg-black\\/20')).toBeAttached();
  await page.getByRole('button', { name: /close cart/i }).click();
  await expect(page.locator('div.fixed.inset-0.bg-black\\/20')).not.toBeAttached();
});

test('mobile viewport: add to cart and view drawer', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /checkout with stripe/i })).toBeVisible();
});
