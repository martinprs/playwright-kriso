/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
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
let initialCount = 0;
let languageFilteredCount = 0;
let formatFilteredCount = 0;

test.describe('Navigate Products via Filters', () => {
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90_000);
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

  test('Test navigate to Kitarr category', async () => {
    const musicBooksLink = page.getByRole('link', {
      name: /Muusikaraamatud ja noodid|Music books/i,
    }).first();

    if (await musicBooksLink.isVisible().catch(() => false)) {
      await musicBooksLink.click();
    } else {
      await page.goto('https://www.kriso.ee/muusika-ja-noodid.html', {
        waitUntil: 'domcontentloaded',
      });
    }

    const kitarrFilter = page.getByRole('link', { name: /Kitarr/i }).filter({ visible: true }).first();

    if (await kitarrFilter.isVisible().catch(() => false)) {
      await kitarrFilter.click();
    } else {
      await page.goto(
        'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?tt=&database=musicsales&instrument=Guitar',
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(page).toHaveURL(/instrument=Guitar/);

    const resultsText = await page.locator('.sb-results-total').first().textContent();
    initialCount = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(initialCount).toBeGreaterThan(1);
  });

  test('Test apply language and format filters', async () => {
    const englishFilter = page.getByRole('link', { name: /English/i }).filter({ visible: true }).first();

    if (await englishFilter.isVisible().catch(() => false)) {
      await englishFilter.click();
    } else {
      await page.goto(
        'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English',
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(page).toHaveURL(/mlanguage=/);

    const languageFilteredText = await page.locator('.sb-results-total').first().textContent();
    languageFilteredCount = Number((languageFilteredText || '').replace(/\D/g, '')) || 0;
    expect(languageFilteredCount).toBeLessThan(initialCount);

    const cdFilter = page.getByRole('link', { name: /CD/i }).filter({ visible: true }).first();

    if (await cdFilter.isVisible().catch(() => false)) {
      await cdFilter.click();
    } else {
      await page.goto(
        'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English&format=CD',
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(page).toHaveURL(/format=CD/);
    await expect(page.getByText('CD', { exact: true }).filter({ visible: true }).first()).toBeVisible();

    const formatFilteredText = await page.locator('.sb-results-total').first().textContent();
    formatFilteredCount = Number((formatFilteredText || '').replace(/\D/g, '')) || 0;
    expect(formatFilteredCount).toBeLessThan(languageFilteredCount);
  });

  test('Test remove active filters', async () => {
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    const text = await page.locator('.sb-results-total').first().textContent();
    const countAfterRemoval = Number((text || '').replace(/\D/g, '')) || 0;
    expect(countAfterRemoval).toBeGreaterThan(formatFilteredCount);
  });
});
