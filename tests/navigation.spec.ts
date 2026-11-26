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

// The announcement bar comes from a PostHog flag, so stand in for it with a
// block of the same kind: in normal flow, directly above the header.
test('header sits below the announcement bar, then sticks to the top', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('cart-button').waitFor();
  await page.evaluate(() => {
    const bar = document.createElement('div');
    bar.id = 'fake-banner';
    bar.style.height = '48px';
    const header = document.querySelector('header')!;
    header.parentElement!.insertBefore(bar, header);
  });
  const logo = page.getByRole('link', { name: /GingerBros home/i });
  expect((await logo.boundingBox())!.y).toBeGreaterThanOrEqual(48);

  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(async () => (await page.locator('header').first().boundingBox())!.y).toBe(0);
});

for (const path of ['/guide', '/returns', '/orders', '/privacy', '/terms', '/track']) {
  test(`${path} has one header and its title clears it`, async ({ page }) => {
    await page.goto(path);
    const title = page.getByRole('heading', { level: 1 });
    await title.waitFor();
    await expect(page.getByRole('button', { name: /back to shop/i })).toHaveCount(0);
    const header = (await page.locator('header').first().boundingBox())!;
    expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(header.y + header.height);
  });
}

test('a guide article starts below the header', async ({ page }) => {
  await page.goto('/guide/moscow-mule');
  const back = page.getByTestId('blog-back');
  await back.waitFor();
  const header = (await page.locator('header').first().boundingBox())!;
  expect((await back.boundingBox())!.y).toBeGreaterThanOrEqual(header.y + header.height);
});
