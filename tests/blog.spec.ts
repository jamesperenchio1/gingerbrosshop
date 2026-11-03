import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/guide');
  // Blog uses GSAP entrance animations; wait for cards to render
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible({ timeout: 10_000 });
});

test('guide lists serving guides and recipes', async ({ page }) => {
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();
  await expect(page.getByTestId('blog-post-thai-ginger-101')).toBeVisible();
});

test('category filters work', async ({ page }) => {
  await page.getByTestId('blog-filter-Recipe').click();
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();

  await page.getByTestId('blog-filter-Guide').click();
  await expect(page.getByTestId('blog-post-ginger-and-thai-food')).toBeVisible();

  await page.getByTestId('blog-filter-Drinks').click();
  await expect(page.getByTestId('blog-post-ginger-fizz-bar-menu')).toBeVisible();
});

test('clicking a post opens the article view', async ({ page }) => {
  await page.getByTestId('blog-post-moscow-mule').click();
  await expect(page.getByRole('heading', { name: /The Perfect Moscow Mule/i })).toBeVisible();
  await expect(page.getByTestId('blog-article-content')).toContainText('60ml vodka');
});

test('back to the guide returns to list', async ({ page }) => {
  await page.getByTestId('blog-post-thai-ginger-101').click();
  await expect(page.getByRole('heading', { name: /Thai Ginger 101/i })).toBeVisible();

  await page.getByTestId('blog-back').click();
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();
});

test('opening an article updates the URL to a deep link', async ({ page }) => {
  await page.getByTestId('blog-post-moscow-mule').click();
  await expect(page).toHaveURL(/\/guide\/moscow-mule$/);
});

test('browser back from an article returns to the blog list, not the shop', async ({ page }) => {
  await page.getByTestId('blog-post-thai-ginger-101').click();
  await expect(page).toHaveURL(/\/guide\/thai-ginger-101$/);
  await expect(page.getByRole('heading', { name: /Thai Ginger 101/i })).toBeVisible();

  // The reported bug: pressing back used to jump to the shop. It should land on /guide.
  await page.goBack();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByTestId('blog-post-moscow-mule')).toBeVisible();
});

test('articles include a references section', async ({ page }) => {
  await page.getByTestId('blog-post-history-of-ginger-beer').click();
  await expect(page.getByTestId('blog-article-content')).toContainText('References');
});

test('post cards are real links that can open in a new tab', async ({ page }) => {
  const card = page.getByTestId('blog-post-moscow-mule');
  await expect(card).toHaveAttribute('href', '/guide/moscow-mule');
});

test('inline markdown italics render instead of showing raw asterisks', async ({ page }) => {
  await page.getByTestId('blog-post-thai-ginger-vs-the-world').click();
  const content = page.getByTestId('blog-article-content');
  await expect(content).toContainText('terroir');
  await expect(content).not.toContainText('*terroir*');
  await expect(content.locator('em', { hasText: 'terroir' })).toBeVisible();
});

test('reference links open in a new tab', async ({ page }) => {
  await page.getByTestId('blog-post-history-of-ginger-beer').click();
  const refLink = page.getByTestId('blog-article-content').getByRole('link').first();
  await expect(refLink).toHaveAttribute('target', '_blank');
  await expect(refLink).toHaveAttribute('rel', /noopener/);
});
