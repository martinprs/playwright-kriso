/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { FiltersPage } from '../../pages/FiltersPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;
let filtersPage: FiltersPage;
let initialCount = 0;
let languageFilteredCount = 0;
let formatFilteredCount = 0;

test.describe('Navigate Products via Filters', () => {
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext();
    page = await context.newPage();

    homePage = new HomePage(page);
    filtersPage = new FiltersPage(page);

    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    if (page) {
      await page.context().close();
    }
  });

  test('Test logo is visible', async () => {
    await homePage.verifyLogo();
  });

  test('Test navigate to Kitarr category', async () => {
    await filtersPage.openMusicBooks();
    await filtersPage.clickFilterByName('Kitarr');

    await expect(page).toHaveURL(/instrument=Guitar/);

    initialCount = await filtersPage.getResultsCount();
    await filtersPage.verifyResultsCountMoreThan(1);
  });

  test('Test apply language and format filters', async () => {
    await filtersPage.clickFilterByName('English');
    await expect(page).toHaveURL(/mlanguage=/);

    languageFilteredCount = await filtersPage.getResultsCount();
    await filtersPage.verifyResultsReducedFrom(initialCount);

    await filtersPage.clickFilterByName('CD');
    await expect(page).toHaveURL(/format=CD/);
    await filtersPage.verifyFilterLabelVisible('CD');

    formatFilteredCount = await filtersPage.getResultsCount();
    await filtersPage.verifyResultsReducedFrom(languageFilteredCount);
  });

  test('Test remove active filters', async () => {
    await filtersPage.removeLastAppliedFilter();
    await filtersPage.removeLastAppliedFilter();

    const countAfterRemoval = await filtersPage.getResultsCount();
    expect(countAfterRemoval).toBeGreaterThan(formatFilteredCount);
  });
});
