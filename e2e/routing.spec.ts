import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Routing', () => {
  test('redirects root to library dashboard', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/', { libraryItems: [...seed.prompts, ...seed.skills] });

    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole('heading', { name: 'Library Dashboard' })).toBeVisible();
  });

  test('unknown route falls back to library dashboard', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/does-not-exist', { libraryItems: [...seed.prompts, ...seed.skills] });

    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole('heading', { name: 'Library Dashboard' })).toBeVisible();
  });

  test('create skill route immediately redirects to skill detail', async ({ page }) => {
    await seedStorageAndGoto(page, '/create/skill', { libraryItems: [] });

    await expect(page).toHaveURL(/\/library\/skills\//);
    await expect(page.getByRole('heading', { name: 'Untitled Skill' })).toBeVisible();
  });
});
