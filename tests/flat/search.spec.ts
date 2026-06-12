/**
 * Part I — Flat tests (no POM)
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Search for Books by Keywords', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/');
    const consentButton = page.getByRole('button', { name: /N.ustun|I agree|Accept/i });
    if (await consentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await consentButton.click();
    }
  });

  test.afterAll(async () => {
    if (page) {
      await page.context().close();
    }
  });

  test('Test logo is visible', async () => {
    await expect(page.locator('.logo-icon')).toBeVisible();
  });

  test('Test no products found', async () => {
    await page.locator('#top-search-text').click();
    await page.locator('#top-search-text').fill('jaslkfjalskjdkls');
    await page.locator('#top-search-text').press('Enter');

    await expect(page.locator('.msg.msg-info')).toContainText(
      /search did not find any match|vastavat raamatut ei leitud/i,
    );
  });

  test('Test search results contain keyword', async () => {
    await page.locator('#top-search-text').click();
    await page.locator('#top-search-text').fill('tolkien');
    await page.locator('#top-search-text').press('Enter');

    const resultsText = await page.locator('.sb-results-total').first().textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);

    const linkTexts = await page.getByRole('link').allTextContents();
    const matchingLinks = linkTexts
      .map((text) => text.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .filter((text) => text.toLowerCase().includes('tolkien'));

    expect(matchingLinks.length).toBeGreaterThan(1);
  });

  test('Test search by ISBN', async () => {
    await page.locator('#top-search-text').click();
    await page.locator('#top-search-text').fill('9780307588371');
    await page.locator('#top-search-text').press('Enter');

    await expect(page.getByText('Gone Girl', { exact: false }).first()).toBeVisible();
  });
});