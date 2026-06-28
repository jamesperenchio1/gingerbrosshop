import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('home page loads with hero and shop sections', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GingerBros/);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#hero').getByRole('heading', { name: /Fermented Ginger/i })).toBeVisible();
  await expect(page.getByTestId('add-to-cart')).toBeVisible({ timeout: 15_000 });
});

test('hero headline is visible without bottle overlay image', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('#hero');
  await expect(hero.getByRole('heading', { name: /Fermented Ginger/i })).toBeVisible();
  await expect(hero.locator('img[alt*="bottle" i]')).not.toBeVisible();
});

test('add to cart opens drawer with item', async ({ page }) => {
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId('cart-items')).toContainText('Ginger Fizz');
});

test('product page loads directly', async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await expect(page.locator('h1')).toContainText('Ginger Fizz');
  await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
});

test('unknown product page shows 404 message', async ({ page }) => {
  await page.goto('/product/this-does-not-exist');
  await expect(page.getByText(/page not found/i)).toBeVisible();
});

test('checkout button triggers Stripe redirect', async ({ page }) => {
  // This only runs against deployed env, since local preview has no /api function.
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL.includes('localhost'),
    'Requires deployed env with /api/checkout'
  );

  await page.getByTestId('add-to-cart').click();
  await page.getByTestId('cart-checkout').click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000, waitUntil: 'commit' });
  expect(page.url()).toContain('checkout.stripe.com');
  await expect(page.getByRole('heading', { name: /Pay GingerBros/i })).toBeVisible({ timeout: 15_000 });
});

test('api/checkout creates a Stripe session', async ({ request }) => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL.includes('localhost'),
    'Requires deployed env'
  );
  const res = await request.post('/api/checkout', {
    data: { items: [{ priceId: 'price_1Tj1Gj4xTvnGlHCDPTwOQhDd', quantity: 1, productId: 'ginger-fizz' }] },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
});
