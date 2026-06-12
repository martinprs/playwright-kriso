import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  private readonly page: Page;
  private readonly orderQty: Locator;
  private readonly subtotalItems: Locator;
  private readonly orderTotal: Locator;
  private readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderQty = this.page.locator('.order-qty > .o-value');
    this.subtotalItems = this.page.locator('.tbl-row > .subtotal');
    this.orderTotal = this.page.locator('.order-total > .o-value');
    this.removeButtons = this.page.locator('.icon-remove');
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.orderQty).toContainText(expectedCount.toString());
  }

  async getCartSum() {
    const cartItems = await this.subtotalItems.all();
    let cartItemsSum = 0;

    for (const item of cartItems) {
      const text = await item.textContent();
      const price = Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
      cartItemsSum += price;
    }

    return cartItemsSum;
  }

  async getTotalSum() {
    const totalText = await this.orderTotal.textContent();
    return Number((totalText || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
  }

  async verifyCartSumIsCorrect() {
    const cartSum = await this.getCartSum();
    const totalSum = await this.getTotalSum();
    expect(totalSum).toBeCloseTo(cartSum, 2);
    return cartSum;
  }

  async removeItemByIndex(index: number) {
    await this.removeButtons.nth(index).click();
  }
}