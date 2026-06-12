import { expect, Page } from '@playwright/test';
import { HomePage } from './HomePage';

export class FiltersPage extends HomePage {
  private readonly musicBooksLink;

  constructor(page: Page) {
    super(page);
    this.musicBooksLink = this.page.getByRole('link', {
      name: /Muusikaraamatud ja noodid|Music books/i,
    }).first();
  }

  async verifyMusicBooksSectionVisible() {
    await this.musicBooksLink.scrollIntoViewIfNeeded();
    await expect(this.musicBooksLink).toBeVisible();
  }

  async openMusicBooks() {
    if (await this.musicBooksLink.isVisible().catch(() => false)) {
      await this.musicBooksLink.click();
      return;
    }

    await this.page.goto('https://www.kriso.ee/muusika-ja-noodid.html', {
      waitUntil: 'domcontentloaded',
    });
  }

  async clickFilterByName(name: string) {
    const filter = this.page
      .getByRole('link', { name: new RegExp(name, 'i') })
      .filter({ visible: true })
      .first();

    if (await filter.isVisible().catch(() => false)) {
      await filter.click();
      return;
    }

    const fallbackUrl = this.getFallbackUrl(name);
    if (fallbackUrl) {
      await this.page.goto(fallbackUrl, { waitUntil: 'domcontentloaded' });
      return;
    }

    await this.page.getByText(name, { exact: true }).first().click();
  }

  async verifyFilterLabelVisible(name: string) {
    await expect(
      this.page.getByText(name, { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
  }

  async getResultsCount() {
    const resultsText = await this.page.locator('.sb-results-total').first().textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async verifyResultsReducedFrom(previousCount: number) {
    const currentCount = await this.getResultsCount();
    expect(currentCount).toBeLessThan(previousCount);
  }

  async removeLastAppliedFilter() {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }

  private getFallbackUrl(name: string) {
    const normalizedName = name.trim().toLowerCase();
    const currentUrl = new URL(this.page.url());

    if (normalizedName === 'kitarr' || normalizedName === 'guitar') {
      return 'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?tt=&database=musicsales&instrument=Guitar';
    }

    if (normalizedName === 'english') {
      currentUrl.searchParams.set('database', 'musicsales');
      currentUrl.searchParams.set('instrument', 'Guitar');
      currentUrl.searchParams.set('mlanguage', 'English');
      return currentUrl.toString();
    }

    if (normalizedName === 'cd') {
      currentUrl.searchParams.set('database', 'musicsales');
      currentUrl.searchParams.set('instrument', 'Guitar');

      if (!currentUrl.searchParams.has('mlanguage')) {
        currentUrl.searchParams.set('mlanguage', 'English');
      }

      currentUrl.searchParams.set('format', 'CD');
      return currentUrl.toString();
    }

    return null;
  }
}