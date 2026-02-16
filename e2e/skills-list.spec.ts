import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Skills List', () => {
  test('supports search, status filter, and favorite-only filter', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/skills', { libraryItems: [...seed.prompts, ...seed.skills] });

    await expect(page.getByRole('heading', { name: 'Skills Library' })).toBeVisible();

    await page.getByPlaceholder('Search by name or tags').fill('Seed Skill B');
    await expect(page.getByRole('cell', { name: 'Seed Skill B' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Seed Skill A' })).toHaveCount(0);

    await page.getByPlaceholder('Search by name or tags').fill('');
    await page.locator('select').first().selectOption('stable');
    await expect(page.getByRole('cell', { name: 'Seed Skill A' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Seed Skill B' })).toHaveCount(0);

    await page.locator('select').first().selectOption('all');
    await page.getByRole('button', { name: 'Favorites' }).click();
    await expect(page.getByRole('cell', { name: 'Seed Skill A' })).toBeVisible();
  });

  test('supports favorite toggle, duplicate, and delete', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/skills', { libraryItems: [...seed.prompts, ...seed.skills] });

    const row = page.getByRole('row', { name: /Seed Skill B/ });
    await row.getByRole('button', { name: 'Favorite' }).click();
    await expect(row.getByRole('button', { name: 'Unfavorite' })).toBeVisible();

    await row.getByRole('button', { name: 'Duplicate' }).click();
    await expect(page).toHaveURL(/\/library\/skills\//);

    await page.goto('/library/skills');
    const rowAgain = page.getByRole('row', { name: /Seed Skill B/ });
    page.once('dialog', (dialog) => dialog.accept());
    await rowAgain.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('row', { name: /Seed Skill B/ })).toHaveCount(0);
  });
});
