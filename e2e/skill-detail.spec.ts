import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Skill Detail', () => {
  test('edits overview and saves', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/skills/skill-seed-a', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await expect(page.getByRole('heading', { name: 'Seed Skill A' })).toBeVisible();
    await page.locator('label:has-text("Name") + input').fill('Seed Skill A Updated');
    await page.locator('label:has-text("Description") + textarea').fill('Updated skill description');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('heading', { name: 'Seed Skill A Updated' })).toBeVisible();
  });

  test('supports edit tab controls and export tab', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/skills/skill-seed-b', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Add input' }).click();
    await expect(page.getByPlaceholder('Input name')).toBeVisible();

    await page.getByRole('button', { name: 'Add step' }).click();
    await expect(page.locator('textarea').last()).toHaveValue('New step');

    await page.getByRole('button', { name: 'Export' }).nth(1).click();
    await expect(page.getByRole('button', { name: 'Download SKILL.md' })).toBeVisible();
  });

  test('supports duplicate and delete actions', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library/skills/skill-seed-b', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await page.getByRole('button', { name: 'Duplicate' }).click();
    await expect(page).toHaveURL(/\/library\/skills\//);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page).toHaveURL('/library/skills');
  });
});
