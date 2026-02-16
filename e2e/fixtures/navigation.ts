import { expect, type Page } from '@playwright/test';

export async function expectSidebarLinks(page: Page) {
  await expect(page.getByRole('link', { name: 'Library' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Prompt Builder' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Anatomy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'UI Builder' })).toBeVisible();
}

export async function navigateBySidebar(page: Page, label: string, expectedHeading: string | RegExp) {
  await page.getByRole('link', { name: label }).click();
  await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible();
}
