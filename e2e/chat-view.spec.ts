import { test, expect } from './fixtures';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Chat' }).first().click();
    await page.waitForTimeout(500);
  });

  test('renders chat view', async ({ page }) => {
    await expect(page.locator('.chat-view')).toBeVisible();
  });

  test('displays welcome message from assistant', async ({ page }) => {
    await expect(page.locator('.chat-message.assistant').first()).toBeVisible();
  });

  test('displays suggestion buttons', async ({ page }) => {
    await expect(page.locator('.suggestion-btn').first()).toBeVisible();
  });

  test('chat input is visible and enabled', async ({ page }) => {
    const input = page.locator('.chat-input-area input');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('sending a message shows user message', async ({ page }) => {
    const input = page.locator('.chat-input-area input');
    await input.fill('What data do I have?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.chat-message.user').last()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.chat-message.user').last()).toContainText('What data do I have?');
  });

  test('sending a message shows assistant response', async ({ page }) => {
    const input = page.locator('.chat-input-area input');
    await input.fill('What data do I have?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.chat-message.assistant').last()).toBeVisible({ timeout: 5000 });
    const responses = page.locator('.chat-message.assistant');
    const count = await responses.count();
    expect(count).toBeGreaterThan(1);
  });

  test('clicking suggestion sends query', async ({ page }) => {
    const firstSuggestion = page.locator('.suggestion-btn').first();
    const text = await firstSuggestion.textContent();
    await firstSuggestion.click();
    await expect(page.locator('.chat-message.user').last()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.chat-message.user').last()).toContainText(text || '');
  });

  test('follow-up suggestion chips appear after response', async ({ page }) => {
    const input = page.locator('.chat-input-area input');
    await input.fill('What data do I have?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.chat-message.assistant').last()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.follow-up-chips')).toBeVisible();
  });

  test('"How did I get this?" expandable shows NQL query', async ({ page }) => {
    const input = page.locator('.chat-input-area input');
    await input.fill('What data do I have?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.chat-message.assistant').last()).toBeVisible({ timeout: 5000 });
    const nqlToggle = page.locator('.nql-toggle-btn');
    await expect(nqlToggle).toBeVisible();
  });
});
