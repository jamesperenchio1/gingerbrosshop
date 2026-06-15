import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('add to cart from shop opens drawer and shows item', async ({ page }) => {
  const addBtn = page.getByTestId('add-to-cart');
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();

  await expect(page.getByTestId('cart-drawer')).toBeVisible();
  await expect(page.getByTestId('cart-items')).toContainText('Unpasteurized Ginger Fizz');
  await expect(page.getByTestId('cart-checkout')).toBeVisible();
});

test('add to cart from product page opens global drawer', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await expect(page.locator('h1')).toContainText('Unpasteurized Ginger Fizz');

  await page.getByRole('button', { name: /add to cart/i }).first().click();

  await expect(page.getByTestId('cart-drawer')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId('cart-items')).toContainText('Unpasteurized Ginger Fizz');
});

test('cart can be opened and closed via nav button and overlay', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible();

  // Close via overlay
  await page.getByTestId('cart-overlay').click();
  await expect(page.getByTestId('cart-drawer')).not.toBeVisible();

  // Reopen via nav
  await page.getByTestId('cart-button').click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible();

  // Close via close button
  await page.getByTestId('cart-close').click();
  await expect(page.getByTestId('cart-drawer')).not.toBeVisible();
});

test('cart persists after reload', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-items')).toContainText('Unpasteurized Ginger Fizz');

  await page.reload();
  await page.getByTestId('cart-button').click();
  await expect(page.getByTestId('cart-items')).toContainText('Unpasteurized Ginger Fizz');
});

test('cart quantity can be increased and decreased', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();

  const item = page.getByTestId('cart-item-unpasteurized');
  const increase = item.getByRole('button', { name: /increase quantity/i });
  const decrease = item.getByRole('button', { name: /decrease quantity/i });

  await expect(page.getByTestId('cart-button').locator('span.absolute')).toHaveText('1');

  await increase.click();
  await expect(page.getByTestId('cart-button').locator('span.absolute')).toHaveText('2');

  await decrease.click();
  await expect(page.getByTestId('cart-button').locator('span.absolute')).toHaveText('1');
});

test('removing the last item shows empty cart', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();

  const item = page.getByTestId('cart-item-unpasteurized');
  await item.getByRole('button', { name: /remove item/i }).click();

  await expect(page.getByTestId('cart-items')).not.toBeAttached();
  await expect(page.getByText(/your cart is empty/i)).toBeVisible();
});

test('cart drawer does not show payment method selector', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible();
  await expect(page.getByText(/Card \/ PromptPay/i)).not.toBeVisible();
  await expect(page.getByText(/Cash on Delivery/i)).not.toBeVisible();
});

test('cart stays open when navigating to a product page', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible();

  // Click the product image in the cart to navigate via client-side routing
  await page.getByTestId('cart-item-unpasteurized').locator('img').first().click();

  await expect(page.locator('h1')).toContainText('Unpasteurized Ginger Fizz');
  await expect(page.getByTestId('cart-drawer')).toBeVisible();
  await expect(page.getByTestId('cart-overlay')).toBeAttached();
});

test('mobile viewport: add to cart and view drawer', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible();
  await expect(page.getByTestId('cart-checkout')).toBeVisible();
});
