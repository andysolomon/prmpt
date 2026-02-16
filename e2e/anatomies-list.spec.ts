import { expect, test } from '@playwright/test';

import { buildAnatomyItem } from './fixtures/librarySeed';
import { seedStorageAndGoto } from './utils/storage';

test.describe('Anatomies Library', () => {
  test('lists and opens anatomy items', async ({ page }) => {
    const now = Date.now();
    const anatomy = buildAnatomyItem(
      {
        id: 'anatomy-item-1',
        title: 'SalesforceForge Anatomy',
      },
      now
    );

    await seedStorageAndGoto(page, '/library/anatomies', { libraryItems: [anatomy] });

    await expect(page.getByRole('heading', { name: 'Anatomy Library' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'SalesforceForge Anatomy' })).toBeVisible();

    await page.getByRole('button', { name: 'Open' }).click();
    await expect(page).toHaveURL(/\/anatomy\?itemId=anatomy-item-1/);
    await expect(page.getByText(/Loaded anatomy "SalesforceForge Anatomy"/)).toBeVisible();
  });
});
