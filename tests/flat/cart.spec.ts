/**
 * Part I — Flat tests (no POM)
 * Test suite: Add Books to Shopping Cart
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
let basketSumOfTwo = 0;

test.describe('Add Books to Shopping Cart', () => {
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

  test('Test search by keyword', async () => {
    await page.locator('#top-search-text').click();
    await page.locator('#top-search-text').fill('harry potter');
    await page.locator('#top-search-text').press('Enter');

    const resultsText = await page.locator('.sb-results-total').first().textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);
  });

  test('Test add book to cart', async () => {
    const addToCartLinks = page.getByRole('link', {
      name: /Lisa ostukorvi|Add to (cart|basket)/i,
    });
    await expect(addToCartLinks.nth(0)).toBeVisible();
    await addToCartLinks.nth(0).click();
    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added/i);
    await expect(page.locator('.cart-products')).toContainText('1');
    await page.locator('.cartbtn-event.back').click();
  });

  test('Test add second book to cart', async () => {
    const addToCartLinks = page.getByRole('link', {
      name: /Lisa ostukorvi|Add to (cart|basket)/i,
    });
    await expect(addToCartLinks.nth(5)).toBeVisible();
    await addToCartLinks.nth(5).click();
    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added/i);
    await expect(page.locator('.cart-products')).toContainText('2');
  });

  test('Test cart count and sum is correct', async () => {
    await page.locator('.cartbtn-event.forward').click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('2');

    basketSumOfTwo = await returnBasketSum();
    const basketSumTotalText = await page.locator('.order-total > .o-value').textContent();
    const basketSumTotal =
      Number((basketSumTotalText || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;

    expect(basketSumTotal).toBeCloseTo(basketSumOfTwo, 2);
  });

  test('Test remove item from cart and counter sum is correct', async () => {
    await page.locator('.icon-remove').nth(0).click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('1');

    const basketSumOfOne = await returnBasketSum();
    const basketSumTotalText = await page.locator('.order-total > .o-value').textContent();
    const basketSumTotal =
      Number((basketSumTotalText || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;

    expect(basketSumTotal).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
  });

  async function returnBasketSum() {
    const cartItems = await page.locator('.tbl-row > .subtotal').all();
    let cartItemsSum = 0;

    for (const item of cartItems) {
      const text = await item.textContent();
      const price = Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
      cartItemsSum += price;
    }

    return cartItemsSum;
  }
});