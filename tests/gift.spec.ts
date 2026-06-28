import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await page.evaluate(() => localStorage.clear());
});

test('gift fields appear when toggle is checked', async ({ page }) => {
  await expect(page.getByTestId('gift-name')).not.toBeVisible();
  await expect(page.getByTestId('gift-email')).not.toBeVisible();
  await expect(page.getByTestId('gift-message')).not.toBeVisible();

  await page.getByTestId('gift-toggle').check();

  await expect(page.getByTestId('gift-name')).toBeVisible();
  await expect(page.getByTestId('gift-email')).toBeVisible();
  await expect(page.getByTestId('gift-message')).toBeVisible();
});

test('gift info is carried into the cart and checkout payload', async ({ page }) => {
  await page.getByTestId('gift-toggle').check();
  await page.getByTestId('gift-name').fill('Gift Recipient');
  await page.getByTestId('gift-email').fill('gift@example.com');
  await page.getByTestId('gift-message').fill('Enjoy this fresh ginger fizz!');

  // Intercept the checkout API call to verify payload
  const checkoutPromise = page.waitForRequest((req) => req.url().includes('/api/checkout') && req.method() === 'POST');

  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await expect(page.getByTestId('cart-drawer')).toBeVisible();

  await page.getByTestId('cart-checkout').click();

  const request = await checkoutPromise;
  const body = await request.postDataJSON();

  expect(body.giftInfo).toMatchObject({
    isGift: true,
    recipientEmail: 'gift@example.com',
    recipientName: 'Gift Recipient',
    message: 'Enjoy this fresh ginger fizz!',
  });
});
