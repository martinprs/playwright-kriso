/**
 * Part II — Page Object Model tests
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { SearchPage } from '../../pages/SearchPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let searchPage: SearchPage;

test.describe('Search for Books by Keywords', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    searchPage = new SearchPage(page);

    await searchPage.openUrl();
    await searchPage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await searchPage.verifyLogo();
  });

  test('Test no products found', async () => {
    await searchPage.searchByKeyword('jaslkfjalskjdkls');
    await searchPage.verifyNoProductsFoundMessage();
  });

  test('Test search results contain keyword', async () => {
    await searchPage.searchByKeyword('tolkien');
    await searchPage.verifyResultsCountMoreThan(1);
    await searchPage.verifyResultsContainKeyword('tolkien');
  });

  test('Test search by ISBN', async () => {
    await searchPage.searchByKeyword('9780307588371');
    await searchPage.verifyBookVisible('Gone Girl');
  });
});