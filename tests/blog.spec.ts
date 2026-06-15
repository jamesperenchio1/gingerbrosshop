import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/blog');
  // Blog uses GSAP entrance animations; wait for cards to render
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible({ timeout: 10_000 });
});

test('blog page lists recipe and health posts', async ({ page }) => {
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();
  await expect(page.getByTestId('blog-post-gut-health')).toBeVisible();
});

test('category filters work', async ({ page }) => {
  await page.getByTestId('blog-filter-Recipe').click();
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();

  await page.getByTestId('blog-filter-Health').click();
  await expect(page.getByTestId('blog-post-gut-health')).toBeVisible();
});

test('clicking a post opens the article view', async ({ page }) => {
  await page.getByTestId('blog-post-moscow-mule').click();
  await expect(page.getByRole('heading', { name: /The Perfect Moscow Mule/i })).toBeVisible();
  await expect(page.getByTestId('blog-article-content')).toContainText('60ml vodka');
});

test('back to blog returns to list', async ({ page }) => {
  await page.getByTestId('blog-post-gut-health').click();
  await expect(page.getByRole('heading', { name: /Ginger Fizz & Gut Health/i })).toBeVisible();

  await page.getByTestId('blog-back').click();
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();
});
