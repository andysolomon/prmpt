import { expect, test } from '@playwright/test';

import { seedStorageAndGoto } from './utils/storage';

test.describe('UI Builder', () => {
  test('renders landing and opens each builder type', async ({ page }) => {
    await seedStorageAndGoto(page, '/create/ui', { libraryItems: [] });

    await expect(page.getByRole('heading', { name: 'UI Prompt Builder' })).toBeVisible();

    await page.goto('/create/ui/layout');
    await expect(page.getByRole('heading', { name: 'Layout Knobs' })).toBeVisible();

    await page.goto('/create/ui/styling');
    await expect(page.getByRole('heading', { name: /styling Builder/i })).toBeVisible();

    await page.goto('/create/ui/components');
    await expect(page.getByRole('heading', { name: /components Builder/i })).toBeVisible();

    await page.goto('/create/ui/page');
    await expect(page.getByRole('heading', { name: /page Builder/i })).toBeVisible();
  });

  test('layout builder knobs update preview and support save to library', async ({ page }) => {
    await seedStorageAndGoto(page, '/create/ui/layout', { libraryItems: [] });

    await page.locator('label:has-text("Title") + input').fill('Ops Dashboard Layout');
    await page.locator('select').nth(0).selectOption('list-detail');
    await page.locator('select').nth(1).selectOption('tabs');
    await page.locator('select').nth(2).selectOption('compact');

    await expect(page.getByText('List Pane')).toBeVisible();
    await expect(page.getByText('Tabs Row')).toBeVisible();

    await page.getByRole('button', { name: 'Save to Library' }).click();
    await expect(page).toHaveURL(/\/library\/prompts\//);
    await expect(page.getByRole('heading', { name: 'Ops Dashboard Layout' })).toBeVisible();
  });
});
