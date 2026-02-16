import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Prompt Library List', () => {
  test('supports search, status filter, favorite toggle', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/prompts', { libraryItems: [...seed.prompts, ...seed.skills] });

    await expect(page.getByRole('heading', { name: 'Prompt Library' })).toBeVisible();

    await page.getByPlaceholder('Search by title, description, or tags').fill('Beta');
    await expect(page.getByRole('cell', { name: 'Beta Prompt' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Alpha Prompt' })).toHaveCount(0);

    await page.getByPlaceholder('Search by title, description, or tags').fill('');
    await page.locator('select').first().selectOption('stable');
    await expect(page.getByRole('cell', { name: 'Alpha Prompt' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Beta Prompt' })).toHaveCount(0);

    await page.locator('select').first().selectOption('all');
    await page.getByRole('button', { name: 'Favorites' }).click();
    await expect(page.getByRole('cell', { name: 'Alpha Prompt' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Beta Prompt' })).toHaveCount(0);
  });

  test('supports open, duplicate, archive/unarchive, and delete flows', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/prompts', { libraryItems: [...seed.prompts, ...seed.skills] });

    await page.getByRole('row', { name: /Beta Prompt/ }).getByRole('button', { name: 'Open' }).click();
    await expect(page).toHaveURL(/\/library\/prompts\/prompt-seed-beta/);

    await page.goto('/library/prompts');
    await page.getByRole('row', { name: /Beta Prompt/ }).getByRole('button', { name: 'Duplicate' }).click();
    await expect(page).toHaveURL(/\/library\/prompts\//);
    await expect(page.getByRole('heading', { name: /Beta Prompt Copy/ })).toBeVisible();

    await page.goto('/library/prompts');
    const betaRow = page.getByRole('row', { name: /Beta Prompt/ });
    await betaRow.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('Archived').first()).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await betaRow.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('row', { name: /Beta Prompt/ })).toHaveCount(0);
  });
});
