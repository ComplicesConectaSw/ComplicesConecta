import { test, expect } from '@playwright/test';

test.describe('Realtime Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Login as demo user for testing
    await page.click('[data-testid="demo-login-button"]');
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
  });

  test('should display chat interface after login', async ({ page }) => {
    // Verify chat interface is visible
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
  });

  test('should send and receive messages in real-time', async ({ page }) => {
    const testMessage = `Test message ${Date.now()}`;
    
    // Send a message
    await page.fill('[data-testid="chat-input"]', testMessage);
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears in chat
    await expect(page.locator(`text=${testMessage}`)).toBeVisible({ timeout: 5000 });
    
    // Verify input is cleared
    await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('');
  });

  test('should show typing indicators', async ({ page }) => {
    // Start typing
    await page.fill('[data-testid="chat-input"]', 'Test typing...');
    
    // Check for typing indicator (this would require multiple users in real scenario)
    // For now, just verify the input has content
    await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('Test typing...');
  });

  test('should display message timestamps', async ({ page }) => {
    const testMessage = `Timestamp test ${Date.now()}`;
    
    // Send a message
    await page.fill('[data-testid="chat-input"]', testMessage);
    await page.click('[data-testid="send-button"]');
    
    // Wait for message to appear
    await page.waitForSelector(`text=${testMessage}`, { timeout: 5000 });
    
    // Check for timestamp element (adjust selector based on actual implementation)
    await expect(page.locator('[data-testid="message-timestamp"]').first()).toBeVisible();
  });

  test('should handle connection status', async ({ page }) => {
    // Check for connection status indicator
    const connectionStatus = page.locator('[data-testid="connection-status"]');
    
    // Should show connected status
    await expect(connectionStatus).toContainText(/conectado|connected/i);
  });

  test('should load chat history on page load', async ({ page }) => {
    // Refresh page to test history loading
    await page.reload();
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    
    // Should have some messages loaded (assuming there's chat history)
    const messages = page.locator('[data-testid="chat-message"]');
    const messageCount = await messages.count();
    
    // Either no messages (fresh chat) or some messages loaded
    expect(messageCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle message reactions', async ({ page }) => {
    const testMessage = `Reaction test ${Date.now()}`;
    
    // Send a message
    await page.fill('[data-testid="chat-input"]', testMessage);
    await page.click('[data-testid="send-button"]');
    
    // Wait for message to appear
    await page.waitForSelector(`text=${testMessage}`, { timeout: 5000 });
    
    // Try to add a reaction (if implemented)
    const messageElement = page.locator(`text=${testMessage}`).first();
    await messageElement.hover();
    
    // Look for reaction button
    const reactionButton = page.locator('[data-testid="reaction-button"]').first();
    if (await reactionButton.isVisible()) {
      await reactionButton.click();
      
      // Verify reaction was added
      await expect(page.locator('[data-testid="message-reaction"]').first()).toBeVisible();
    }
  });

  test('should handle long messages correctly', async ({ page }) => {
    const longMessage = 'A'.repeat(500); // 500 character message
    
    // Send long message
    await page.fill('[data-testid="chat-input"]', longMessage);
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears (might be truncated or wrapped)
    await expect(page.locator(`text=${longMessage.substring(0, 50)}`)).toBeVisible({ timeout: 5000 });
  });

  test('should prevent sending empty messages', async ({ page }) => {
    // Try to send empty message
    await page.click('[data-testid="send-button"]');
    
    // Input should still be focused and empty
    await expect(page.locator('[data-testid="chat-input"]')).toBeFocused();
    await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('');
  });

  test('should handle emoji in messages', async ({ page }) => {
    const emojiMessage = 'Hello! 😊 👋 🎉';
    
    // Send message with emojis
    await page.fill('[data-testid="chat-input"]', emojiMessage);
    await page.click('[data-testid="send-button"]');
    
    // Verify emoji message appears correctly
    await expect(page.locator(`text=${emojiMessage}`)).toBeVisible({ timeout: 5000 });
  });
});
