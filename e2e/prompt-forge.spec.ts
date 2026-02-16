import { expect, test } from '@playwright/test';

import { seedStorageAndGoto } from './utils/storage';

test.describe('Prompt Forge (Anatomy Route)', () => {
  test.beforeEach(async ({ page }) => {
    await seedStorageAndGoto(page, '/anatomy', { libraryItems: [] });
  });

  test('renders composer and generated prompt preview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Prompt Forge' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Generated System Prompt' })).toBeVisible();
    await expect(page.getByText('Role Areas (Color-Coded)')).toBeVisible();
  });

  test('switches starter preset and updates generated output', async ({ page }) => {
    await page.locator('select').first().selectOption('apex-guard');
    await expect(page.locator('label:has-text("Agent Name") + input')).toHaveValue('ApexGuard');
    await expect(page.getByText('You are ApexGuard')).toBeVisible();
  });

  test('toggles highlighting and includes github context in output', async ({ page }) => {
    await page.locator('label:has-text("Repository URLs (one per line)") + textarea').fill('https://github.com/acme/salesforce-app');
    await page.locator('label:has-text("Focus Files / Pattern Anchors (one per line)") + textarea').fill(
      'force-app/main/default/classes/AccountSelector.cls'
    );

    await expect(page.getByText('<github_context>')).toBeVisible();

    await page.getByLabel('Highlight sections').uncheck();
    await expect(page.getByText('Role Areas (Color-Coded)')).toHaveCount(0);
  });

  test('exports to prompt builder preset and saves agent to library', async ({ page }) => {
    await page.getByRole('button', { name: 'Export to Prompt Builder Preset' }).click();
    await expect(page.getByText(/Saved ".*\(Forge\)" to Prompt Builder custom presets\./)).toBeVisible();

    await page.getByRole('button', { name: 'Save Agent to Library' }).click();
    await expect(page.getByText(/Saved ".* Forge" to Library Prompts\./)).toBeVisible();

    await page.getByRole('button', { name: 'Continue in Prompt Builder' }).last().click({ force: true });
    await expect(page).toHaveURL('/create/prompt');
  });
});
