import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Library Dashboard', () => {
  test('renders continue, recents, and favorites from seeded library items', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library', { libraryItems: [...seed.prompts, ...seed.skills] });

    await expect(page.getByRole('heading', { name: 'Library Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Continue' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Alpha Prompt/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recents' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Favorites' })).toBeVisible();
  });

  test('resume from continue opens detail page', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library', { libraryItems: [...seed.prompts, ...seed.skills] });

    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/library\/(prompts|skills)\//);
  });

  test('new skill button creates and navigates to detail page', async ({ page }) => {
    await seedStorageAndGoto(page, '/library', { libraryItems: [] });

    await page.getByRole('button', { name: 'New Skill' }).click();
    await expect(page).toHaveURL(/\/library\/skills\//);
    await expect(page.getByRole('heading', { name: 'Untitled Skill' })).toBeVisible();
  });
});
