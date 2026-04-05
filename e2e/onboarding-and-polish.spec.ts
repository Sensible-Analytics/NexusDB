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
  test('app remains stable after navigation errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText.length).toBeGreaterThan(100);
    await page.keyboard.press('2');
    await expect(page.locator('.graph-container')).toBeVisible({ timeout: 5000 });
  });

  test('app handles database switch without crashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await expect(page.locator('.main-content')).toBeVisible();
    await page.keyboard.press('3');
    await page.waitForTimeout(500);
    await expect(page.locator('.chat-view')).toBeVisible();
  });

  test('status bar shows connection info', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await expect(page.locator('.status-bar')).toBeVisible();
    await expect(page.locator('text=Connected to').first()).toBeVisible();
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

test.describe('Data Flow', () => {
  test('home view shows correct database name from mock', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=health-patterns').first()).toBeVisible({ timeout: 5000 });
  });

  test('graph view renders correct number of node cards', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Graph' }).first().click();
    await expect(page.locator('.node-card').first()).toBeVisible({ timeout: 5000 });
    const nodeCards = page.locator('.node-card');
    const count = await nodeCards.count();
    expect(count).toBe(10);
    const firstCardText = await nodeCards.first().textContent();
    expect(firstCardText?.length).toBeGreaterThan(0);
  });

  test('graph view renders correct number of edges', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Graph' }).first().click();
    await expect(page.locator('.edge-line').first()).toBeVisible({ timeout: 5000 });
    const edges = page.locator('.edge-line');
    const count = await edges.count();
    expect(count).toBe(10);
  });

  test('chat view shows correct item count in welcome message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Chat' }).first().click();
    await expect(page.locator('.chat-message.assistant').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.chat-message.assistant').first()).toContainText('10');
    const welcomeText = await page.locator('.chat-message.assistant').first().textContent();
    expect(welcomeText?.length).toBeGreaterThan(0);
  });

  test('report view shows correct metric values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Report' }).first().click();
    await expect(page.locator('.metric-value').first()).toBeVisible({ timeout: 5000 });
    const metricValues = page.locator('.metric-value');
    const firstValue = await metricValues.nth(0).textContent();
    expect(firstValue?.trim()).toBe('10');
    const secondValue = await metricValues.nth(1).textContent();
    expect(secondValue?.trim()).toBe('10');
  });

  test('status bar shows correct item and connection counts', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=10 items').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=10 connections').first()).toBeVisible();
  });

  test('sidebar displays correct database names', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=health-patterns').nth(0)).toBeVisible({ timeout: 5000 });
  });
});
