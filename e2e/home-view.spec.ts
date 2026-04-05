import { test, expect } from './fixtures';

test.describe('Home View', () => {
  test('loads home view by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=SensibleDB').first()).toBeVisible();
    await expect(page.locator('text=Welcome to SensibleDB').first()).toBeVisible();
  });

  test('displays stats row with item and connection counts', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('.stat-card, .stat-value, [class*="stat"]').first()).toBeVisible();
  });

  test('displays demo database cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Health Patterns').first()).toBeVisible();
    await expect(page.locator('text=Project Management').first()).toBeVisible();
  });

  test('demo cards have explore buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Explore').first()).toBeVisible();
  });

  test('displays "Connect Your Data" section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Connect Your Data').first()).toBeVisible();
  });

  test('displays "Take a Tour" button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Take a Tour').first()).toBeVisible();
  });
});
