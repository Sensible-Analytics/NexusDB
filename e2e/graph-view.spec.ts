import { test, expect } from './fixtures';

test.describe('Graph View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Graph' }).first().click();
    await expect(page.locator('.graph-container')).toBeVisible({ timeout: 5000 });
  });

  test('renders graph container', async ({ page }) => {
    await expect(page.locator('.graph-container')).toBeVisible();
  });

  test('renders SVG element for graph', async ({ page }) => {
    await expect(page.locator('svg.graph-svg')).toBeVisible();
  });

  test('renders node cards on the graph', async ({ page }) => {
    await expect(page.locator('.node-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('node cards display type icons and labels', async ({ page }) => {
    const firstCard = page.locator('.node-card').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    await expect(firstCard.locator('.node-card-icon')).toBeVisible();
    await expect(firstCard.locator('.node-card-type')).toBeVisible();
    await expect(firstCard.locator('.node-card-label')).toBeVisible();
  });

  test('node cards show connection count', async ({ page }) => {
    await expect(page.locator('.node-card-connections').first()).toBeVisible({ timeout: 5000 });
  });

  test('renders edges as lines', async ({ page }) => {
    const edges = page.locator('.edge-line');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });
    const count = await edges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('query bar is visible at bottom', async ({ page }) => {
    await expect(page.locator('.query-bar')).toBeVisible();
    await expect(page.locator('.query-input')).toBeVisible();
    await expect(page.locator('.query-submit-btn')).toBeVisible();
  });

  test('query bar shows suggestions', async ({ page }) => {
    await expect(page.locator('.query-suggestions')).toBeVisible();
    await expect(page.locator('.suggestion-chip').first()).toBeVisible();
  });

  test('zoom controls are visible', async ({ page }) => {
    await expect(page.locator('.zoom-controls')).toBeVisible();
  });

  test('clicking suggestion chip fills query input', async ({ page }) => {
    const firstChip = page.locator('.suggestion-chip').first();
    await firstChip.click();
    await expect(page.locator('.query-input')).toBeVisible({ timeout: 5000 });
    const inputValue = await page.locator('.query-input').inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
  });
});
