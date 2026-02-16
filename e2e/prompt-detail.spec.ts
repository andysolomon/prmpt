import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Prompt Detail', () => {
  test('edits overview and saves', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/prompts/prompt-seed-alpha', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await expect(page.getByRole('heading', { name: 'Alpha Prompt' })).toBeVisible();

    await page.locator('label:has-text("Title") + input').fill('Alpha Prompt Updated');
    await page.locator('label:has-text("Description") + textarea').fill('Updated description from e2e');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('heading', { name: 'Alpha Prompt Updated' })).toBeVisible();
  });

  test('supports tab navigation and open prompt builder flow', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/prompts/prompt-seed-beta', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('button', { name: 'Open Prompt Builder' })).toBeVisible();
    await page.getByRole('button', { name: 'Open Prompt Builder' }).click();
    await expect(page).toHaveURL(/\/create\/prompt\?itemId=prompt-seed-beta/);

    await page.goto('/library/prompts/prompt-seed-beta');
    await page.getByRole('button', { name: 'Export' }).first().click();
    await expect(page.getByText('Chat Prompt')).toBeVisible();
  });

  test('supports duplicate and delete actions', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/prompts/prompt-seed-beta', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await page.getByRole('button', { name: 'Duplicate' }).click();
    await expect(page).toHaveURL(/\/library\/prompts\//);
    await expect(page.getByRole('heading', { name: /Beta Prompt Copy/ })).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page).toHaveURL('/library/prompts');
  });
});
