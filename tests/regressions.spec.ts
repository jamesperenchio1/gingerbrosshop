import { test, expect } from '@playwright/test';

/**
 * Regression coverage for three bugs that kept coming back because nothing
 * asserted against them. Each one failed on the pre-fix build.
 */

const PRODUCT_CARD = 'article:has([data-testid="add-to-cart"])';

test('product cards are real links, not click-handler divs', async ({ page }) => {
  await page.goto('/');
  const link = page.locator(`${PRODUCT_CARD} a[href^="/product/"]`).first();
  await expect(link).toBeVisible({ timeout: 15_000 });
  // A real href is what makes cmd/middle-click and crawling work.
  await expect(link).toHaveAttribute('href', /^\/product\/.+/);
});

test('opening a product from the shop lands at the top of the page', async ({ page }) => {
  await page.goto('/');
  await page.locator(`${PRODUCT_CARD} a[href^="/product/"]`).first().waitFor({ timeout: 15_000 });

  // Scroll down to the shop before clicking: the bug only showed up when the
  // previous page had a non-zero scroll offset for ScrollTrigger to restore.
  await page.locator('#shop').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);

  await page.locator(`${PRODUCT_CARD} a[href^="/product/"]`).first().click();
  await expect(page.locator('h1')).toBeVisible();

  // Give the rAF ScrollTrigger.refresh() a chance to misbehave before asserting.
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test('returning from a product page leaves the shop fully visible', async ({ page }) => {
  await page.goto('/');
  await page.locator('#shop').scrollIntoViewIfNeeded();
  await page.locator(`${PRODUCT_CARD} a[href^="/product/"]`).first().click();
  await expect(page.locator('h1')).toBeVisible();

  await page.goBack();
  await page.locator('#shop').scrollIntoViewIfNeeded();

  const card = page.locator(PRODUCT_CARD).first();
  await expect(card).toBeVisible();
  await expect
    .poll(async () => Number(await card.evaluate((el) => getComputedStyle(el).opacity)), {
      timeout: 5_000,
    })
    .toBe(1);
});

test('product hero image fits its frame instead of being cropped', async ({ page }) => {
  await page.goto('/product/ginger-fizz');
  await expect(page.locator('h1')).toBeVisible();
  const heroImage = page.locator('button[aria-label*="image gallery"] img').first();
  await expect(heroImage).toBeVisible();

  const fits = await page.evaluate(() => {
    const img = document.querySelector<HTMLImageElement>('button[aria-label*="image gallery"] img');
    if (!img) return null;
    const frame = img.closest('div');
    if (!frame) return null;
    const i = img.getBoundingClientRect();
    const f = frame.getBoundingClientRect();
    // 1px of tolerance for sub-pixel layout rounding.
    return i.height <= f.height + 1 && i.width <= f.width + 1;
  });

  expect(fits, 'hero image overflows its container (object-contain not applying)').toBe(true);
});
