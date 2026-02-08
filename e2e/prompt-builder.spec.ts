import { expect, test } from '@playwright/test';

test.describe('Prompt Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
});
