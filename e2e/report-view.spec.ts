import { test, expect } from './fixtures';

test.describe('Report View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Report' }).first().click();
    await page.waitForTimeout(500);
  });

  test('renders report view', async ({ page }) => {
    await expect(page.locator('.report-view')).toBeVisible();
  });

  test('displays Summary Report title', async ({ page }) => {
    await expect(page.locator('text=Summary Report').first()).toBeVisible();
  });

  test('displays metric cards', async ({ page }) => {
    await expect(page.locator('.metric-card').nth(0)).toBeVisible();
    await expect(page.locator('.metric-card').nth(1)).toBeVisible();
    await expect(page.locator('.metric-card').nth(2)).toBeVisible();
    await expect(page.locator('.metric-card').nth(3)).toBeVisible();
  });

  test('displays Key Findings section', async ({ page }) => {
    await expect(page.locator('text=Key Findings').first()).toBeVisible();
  });

  test('displays Most Connected Items section', async ({ page }) => {
    await expect(page.locator('text=Most Connected Items').first()).toBeVisible();
  });

  test('displays Item Breakdown by Type section', async ({ page }) => {
    await expect(page.locator('text=Item Breakdown by Type').first()).toBeVisible();
  });

  test('type breakdown shows progress bars', async ({ page }) => {
    await expect(page.locator('.type-bar').first()).toBeVisible();
    await expect(page.locator('.type-fill').first()).toBeVisible();
  });

  test('time period selector is visible', async ({ page }) => {
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('export buttons are visible', async ({ page }) => {
    await expect(page.locator('.export-buttons')).toBeVisible();
  });

  test('share button is visible', async ({ page }) => {
    await expect(page.locator('text=Share').first()).toBeVisible();
  });
});
