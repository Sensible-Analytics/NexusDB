import { test, expect } from './fixtures';

test.describe('Navigation & Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('sidebar displays all navigation items', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Home' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Graph' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chat' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report' }).first()).toBeVisible();
  });

  test('sidebar shows keyboard shortcut hints', async ({ page }) => {
    const shortcuts = page.locator('.nav-shortcut');
    const count = await shortcuts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('keyboard shortcut 2 navigates to Graph', async ({ page }) => {
    await page.keyboard.press('2');
    await page.waitForTimeout(300);
    await expect(page.locator('.graph-container')).toBeVisible();
  });

  test('keyboard shortcut 3 navigates to Chat', async ({ page }) => {
    await page.keyboard.press('3');
    await page.waitForTimeout(300);
    await expect(page.locator('.chat-view')).toBeVisible();
  });

  test('keyboard shortcut 4 navigates to Report', async ({ page }) => {
    await page.keyboard.press('4');
    await page.waitForTimeout(300);
    await expect(page.locator('.report-view')).toBeVisible();
  });

  test('keyboard shortcut 5 navigates to Items', async ({ page }) => {
    await page.keyboard.press('5');
    await page.waitForTimeout(300);
    await expect(page.locator('.entity-list')).toBeVisible();
  });

  test('keyboard shortcut 1 navigates to Home', async ({ page }) => {
    await page.getByRole('button', { name: 'Graph' }).first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('1');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Welcome to SensibleDB').first()).toBeVisible();
  });

  test('Escape key navigates to Home', async ({ page }) => {
    await page.getByRole('button', { name: 'Graph' }).first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Welcome to SensibleDB').first()).toBeVisible();
  });

  test('status bar shows connection info', async ({ page }) => {
    await expect(page.locator('.status-bar')).toBeVisible();
    await expect(page.locator('text=Connected to').first()).toBeVisible();
  });

  test('header displays brand and database badge', async ({ page }) => {
    await expect(page.locator('.header-brand')).toBeVisible();
    await expect(page.locator('.header-title')).toBeVisible();
    await expect(page.locator('.badge.blue').first()).toBeVisible();
  });
});
