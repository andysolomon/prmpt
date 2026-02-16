import { expect, test } from '@playwright/test';

import { buildSeedLibraryData } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Prompt Builder', () => {
  test.beforeEach(async ({ page }) => {
    await seedStorageAndGoto(page, '/create/prompt', { libraryItems: [] });
  });

  test('renders wizard shell and preview/lint panels', async ({ page }) => {
    await expect(page.getByRole('main').getByRole('heading', { name: 'Prompt Builder' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Steps' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Lint/ })).toBeVisible();
  });

  test('updates chat preview when goal is edited', async ({ page }) => {
    await page.getByLabel('Goal').fill('Implement account settings page with tests');
    await expect(page.locator('pre').first()).toContainText('Implement account settings page with tests');
  });

  test('applies built-in preset and supports undo', async ({ page }) => {
    await page.locator('select').first().selectOption({ label: 'Next.js + shadcn UI Feature' });
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByText('Applied preset: Next.js + shadcn UI Feature')).toBeVisible();
    await expect(page.locator('input#prompt-title')).toHaveValue('Next.js + shadcn Feature Request');

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByText('Applied preset: Next.js + shadcn UI Feature')).toHaveCount(0);
  });

  test('supports reset via New Prompt action', async ({ page }) => {
    const goalInput = page.getByLabel('Goal');
    await goalInput.fill('Ship profile page with full test coverage');
    await expect(page.locator('pre').first()).toContainText('Ship profile page with full test coverage');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'New Prompt' }).click();

    await expect(goalInput).toHaveValue('');
  });

  test('saves prompt to library', async ({ page }) => {
    await page.getByLabel('Title').fill('E2E Prompt Saved');
    await page.getByLabel('Goal').fill('Ensure save-to-library workflow works');
    await page.getByRole('button', { name: 'Save to Library' }).click();

    await expect(page).toHaveURL(/\/library\/prompts\//);
    await expect(page.getByRole('heading', { name: 'E2E Prompt Saved' })).toBeVisible();
  });

  test('loads prompt item from library when itemId query param is provided', async ({ page }) => {
    const seed = buildSeedLibraryData();
    await seedStorageAndGoto(page, '/create/prompt?itemId=prompt-seed-alpha', {
      libraryItems: [...seed.prompts, ...seed.skills],
    });

    await expect(page.getByLabel('Title')).toHaveValue('Alpha Prompt');
    await expect(page.getByLabel('Goal')).toHaveValue('Implement alpha workflow and tests');
  });
});
