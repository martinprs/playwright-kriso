import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  private readonly url = 'https://www.kriso.ee/';

  constructor(page: Page) {
    super(page);
  }

  async openUrl() {
    await this.page.goto(this.url);
  }

  async openMusicBooksSection() {
    const musicLink = this.page.getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i }).first();
    await musicLink.scrollIntoViewIfNeeded();
    await musicLink.click();
  }

  async openKitarrCategory() {
    const kitarrLink = this.page.getByRole('link', { name: /Kitarr|Guitar/i }).first();
    await kitarrLink.click();
  }

  async verifyKitarrInUrl() {
    await expect(this.page).toHaveURL(/instrument=Guitar/);
  }

  async applyEnglishFilter() {
    const englishFilter = this.page.getByRole('link', { name: /English/i }).first();
    await englishFilter.click();
  }

  async verifyLanguageFilterInUrl() {
    await expect(this.page).toHaveURL(/mlanguage=/);
  }

  async applyCdFormatFilter() {
    const cdFilter = this.page.getByRole('link', { name: 'CD' }).first();
    await cdFilter.click();
  }

  async verifyCdFilterInUrl() {
    await expect(this.page).toHaveURL(/format=CD/);
  }

  async removeActiveFiltersWithBackNavigation() {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }
}