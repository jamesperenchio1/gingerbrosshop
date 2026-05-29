import { test, expect } from '@playwright/test';

test('home page loads with hero and shop sections', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
  // Shop section product appears
  await expect(page.getByText('Pasteurized Ginger Beer', { exact: false }).first()).toBeVisible({ timeout: 15_000 });
});

test('add to cart opens drawer with item', async ({ page }) => {
  await page.goto('/');
  const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/checkout/i).first()).toBeVisible();
});

test('checkout button triggers Stripe redirect', async ({ page, baseURL }) => {
  // This only runs against deployed env (PLAYWRIGHT_BASE_URL set), since dev has no /api fn.
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Requires deployed env with /api/checkout');

  await page.goto('/');
  const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
  await addBtn.click();

  // Intercept navigation to checkout.stripe.com
  const checkoutBtn = page.getByRole('button', { name: /checkout/i });
  await checkoutBtn.first().click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 });
  expect(page.url()).toContain('checkout.stripe.com');
});

test('api/checkout creates a Stripe session', async ({ request, baseURL }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Requires deployed env');
  const res = await request.post('/api/checkout', {
    data: { items: [{ id: 'pasteurized', quantity: 1 }] },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
});
