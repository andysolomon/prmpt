import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Mobile Navigation Drawer', () => {
  test('opens and navigates using mobile menu drawer', async ({ page }, testInfo) => {
    const isMobileProject = Boolean((testInfo.project.use as { isMobile?: boolean }).isMobile);
    test.skip(!isMobileProject, 'Mobile-only scenario');

    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/library', { libraryItems: [...seed.prompts, ...seed.skills] });

    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('heading', { name: 'Navigation' })).toBeVisible();

    await page.getByRole('link', { name: 'Prompt Builder' }).click();
    await expect(page.getByRole('heading', { name: 'Prompt Builder' })).toBeVisible();

    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('link', { name: 'Anatomy' }).click();
    await expect(page.getByRole('heading', { name: 'Prompt Forge' })).toBeVisible();
  });
});
