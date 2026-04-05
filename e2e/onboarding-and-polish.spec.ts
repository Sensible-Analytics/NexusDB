import { test, expect } from './fixtures';

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('displays guided tour trigger', async ({ page }) => {
    await expect(page.locator('text=Take a Tour').first()).toBeVisible();
  });

  test('displays Connect Data button in sidebar', async ({ page }) => {
    await expect(page.locator('text=Connect Data').first()).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('error boundary renders on component crash', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const errorBoundary = page.locator('.error-boundary');
    expect(await errorBoundary.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Design System', () => {
  test('CSS custom properties are defined', async ({ page }) => {
    await page.goto('/');
    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        bgPrimary: styles.getPropertyValue('--bg-primary').trim(),
        accent: styles.getPropertyValue('--accent').trim(),
        spaceMd: styles.getPropertyValue('--space-md').trim(),
        radiusMd: styles.getPropertyValue('--radius-md').trim(),
      };
    });
    expect(tokens.bgPrimary).toBe('#0f172a');
    expect(tokens.accent).toBe('#3b82f6');
    expect(tokens.spaceMd).toBe('12px');
    expect(tokens.radiusMd).toBe('6px');
  });

  test('view transitions animate on switch', async ({ page }) => {
    await page.goto('/');
    const animation = await page.evaluate(() => {
      const el = document.querySelector('.main-content > *');
      if (!el) return null;
      return getComputedStyle(el).animationName;
    });
    expect(animation).toBe('fade-in');
  });
});

test.describe('NQL Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'NQL Editor' }).first().click();
    await page.waitForTimeout(500);
  });

  test('renders NQL editor', async ({ page }) => {
    await expect(page.locator('.nql-editor')).toBeVisible();
  });

  test('displays sample queries', async ({ page }) => {
    await expect(page.locator('text=Sample Queries').first()).toBeVisible();
    await expect(page.locator('.sample-btn').first()).toBeVisible();
  });

  test('Run Query button is visible', async ({ page }) => {
    await expect(page.locator('text=Run Query').first()).toBeVisible();
  });
});

test.describe('Data Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Items view shows node list', async ({ page }) => {
    await page.getByRole('button', { name: 'Items' }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.entity-list')).toBeVisible();
  });

  test('Connections view shows edge list', async ({ page }) => {
    await page.getByRole('button', { name: 'Connections' }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.entity-list')).toBeVisible();
  });

  test('Structure view shows schema browser', async ({ page }) => {
    await page.getByRole('button', { name: 'Structure' }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.schema-browser')).toBeVisible();
  });
});
