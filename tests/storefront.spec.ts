import { test, expect } from '@playwright/test';

test('home page loads with hero and shop sections', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GingerBros/);
  await expect(page.locator('body')).toBeVisible();
  // Shop section product appears
  await expect(page.getByText('Unpasteurized Ginger Beer', { exact: false }).first()).toBeVisible({ timeout: 15_000 });
});

test('add to cart opens drawer with item', async ({ page }) => {
  await page.goto('/');
  const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/checkout/i).first()).toBeVisible();
});

test('product page loads directly', async ({ page }) => {
  await page.goto('/product/unpasteurized');
  await expect(page.locator('h1')).toContainText('Unpasteurized Ginger Beer');
  await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
});

test('unknown product page shows 404 message', async ({ page }) => {
  await page.goto('/product/this-does-not-exist');
  await expect(page.getByText(/page not found/i)).toBeVisible();
});

test('checkout button triggers Stripe redirect', async ({ page, baseURL }) => {
  // This only runs against deployed env, since local preview has no /api function.
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL.includes('localhost'),
    'Requires deployed env with /api/checkout'
  );

  await page.goto('/');
  const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
  await addBtn.click();

  // Intercept navigation to checkout.stripe.com
  const checkoutBtn = page.getByRole('button', { name: /checkout/i });
  await checkoutBtn.first().click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000, waitUntil: 'commit' });
  expect(page.url()).toContain('checkout.stripe.com');
  await expect(page.getByRole('heading', { name: /Pay GingerBros/i })).toBeVisible({ timeout: 15_000 });
});

test('api/checkout creates a Stripe session', async ({ request, baseURL }) => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL.includes('localhost'),
    'Requires deployed env'
  );
  const res = await request.post('/api/checkout', {
    data: { items: [{ id: 'unpasteurized', quantity: 1 }] },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
});
