import { expect, test } from '@playwright/test';

test.describe('Prompt Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create/prompt');
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

  test('shows sprint 6 portability panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Import / Export / Share' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download PromptSpec JSON' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy share URL' })).toBeVisible();
  });

  test('clears draft via New Prompt action', async ({ page }) => {
    const goalInput = page.getByLabel('Goal');
    await goalInput.fill('Ship profile page with full test coverage');
    await expect(page.locator('pre').first()).toContainText('Ship profile page with full test coverage');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'New Prompt' }).click();

    await expect(goalInput).toHaveValue('');
    await expect(page.locator('pre').first()).not.toContainText('Ship profile page with full test coverage');
  });
});

test.describe('Sprint 7 Library and UI Builder', () => {
  test('lands on library dashboard by default and can create skill', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Library Dashboard' })).toBeVisible();

    await page.getByRole('button', { name: 'New Skill' }).first().click();
    await expect(page.getByRole('heading', { name: 'Untitled Skill' })).toBeVisible();
  });

  test('opens UI builder landing and scaffold route', async ({ page }) => {
    await page.goto('/create/ui');
    await expect(page.getByRole('heading', { name: 'UI Prompt Builder' })).toBeVisible();

    await page.getByRole('link', { name: 'Start' }).first().click();
    await expect(page.getByRole('heading', { name: /layout Builder/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prompt Preview' })).toBeVisible();
  });
});
