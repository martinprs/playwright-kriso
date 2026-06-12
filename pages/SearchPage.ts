import { expect, Page } from '@playwright/test';
import { HomePage } from './HomePage';

export class SearchPage extends HomePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyResultsContainKeyword(keyword: string) {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const linkTexts = await this.page.getByRole('link').allTextContents();
    const matchingLinks = linkTexts
      .map((text) => text.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .filter((text) => text.toLowerCase().includes(normalizedKeyword));

    expect(matchingLinks.length).toBeGreaterThan(1);
  }

  async verifyBookVisible(title: string) {
    await expect(this.page.getByText(title, { exact: false }).first()).toBeVisible();
  }
}