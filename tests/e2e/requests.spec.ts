import { test, expect } from '@playwright/test';

test.describe('Sistema de Solicitudes', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuario para acceder a solicitudes
    await page.goto('/auth');
    await page.click('button[data-testid="toggle-auth-mode"]');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('debe mostrar página de solicitudes', async ({ page }) => {
    await page.goto('/requests');
    
    await expect(page.locator('[data-testid="requests-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="sent-requests"]')).toBeVisible();
    await expect(page.locator('[data-testid="received-requests"]')).toBeVisible();
  });

  test('debe enviar solicitud de conexión', async ({ page }) => {
    // Navegar a perfiles
    await page.goto('/profiles');
    
    // Seleccionar un perfil
    await page.locator('[data-testid="profile-card"]').first().click();
    
    // Enviar solicitud
    await page.click('[data-testid="send-request-btn"]');
    
    // Verificar modal de solicitud
    await expect(page.locator('[data-testid="request-modal"]')).toBeVisible();
    
    // Llenar mensaje opcional
    await page.fill('[data-testid="request-message"]', 'Hola, me gustaría conectar contigo');
    
    // Confirmar envío
    await page.click('[data-testid="confirm-send-btn"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Solicitud enviada');
  });

  test('debe mostrar solicitudes enviadas', async ({ page }) => {
    await page.goto('/requests');
    
    // Verificar sección de enviadas
    await page.click('[data-testid="sent-tab"]');
    
    await expect(page.locator('[data-testid="sent-request-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-date"]')).toBeVisible();
  });

  test('debe mostrar solicitudes recibidas', async ({ page }) => {
    await page.goto('/requests');
    
    // Verificar sección de recibidas
    await page.click('[data-testid="received-tab"]');
    
    await expect(page.locator('[data-testid="received-request-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="accept-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="reject-btn"]')).toBeVisible();
  });

  test('debe aceptar solicitud recibida', async ({ page }) => {
    await page.goto('/requests');
    await page.click('[data-testid="received-tab"]');
    
    // Aceptar primera solicitud
    await page.locator('[data-testid="accept-btn"]').first().click();
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="accept-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-accept-btn"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Solicitud aceptada');
  });

  test('debe rechazar solicitud recibida', async ({ page }) => {
    await page.goto('/requests');
    await page.click('[data-testid="received-tab"]');
    
    // Rechazar primera solicitud
    await page.locator('[data-testid="reject-btn"]').first().click();
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="reject-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-reject-btn"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Solicitud rechazada');
  });

  test('debe cancelar solicitud enviada', async ({ page }) => {
    await page.goto('/requests');
    await page.click('[data-testid="sent-tab"]');
    
    // Cancelar solicitud pendiente
    await page.locator('[data-testid="cancel-request-btn"]').first().click();
    
    // Confirmar cancelación
    await expect(page.locator('[data-testid="cancel-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-cancel-btn"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Solicitud cancelada');
  });

  test('debe filtrar solicitudes por estado', async ({ page }) => {
    await page.goto('/requests');
    
    // Filtrar por pendientes
    await page.click('[data-testid="filter-pending"]');
    await expect(page.locator('[data-testid="pending-request"]')).toBeVisible();
    
    // Filtrar por aceptadas
    await page.click('[data-testid="filter-accepted"]');
    await expect(page.locator('[data-testid="accepted-request"]')).toBeVisible();
    
    // Filtrar por rechazadas
    await page.click('[data-testid="filter-rejected"]');
    await expect(page.locator('[data-testid="rejected-request"]')).toBeVisible();
  });

  test('debe mostrar detalles de solicitud', async ({ page }) => {
    await page.goto('/requests');
    
    // Hacer clic en una solicitud
    await page.locator('[data-testid="request-item"]').first().click();
    
    // Verificar modal de detalles
    await expect(page.locator('[data-testid="request-details-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="sender-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-timestamp"]')).toBeVisible();
  });

  test('debe prevenir solicitudes duplicadas', async ({ page }) => {
    await page.goto('/profiles');
    
    // Intentar enviar solicitud a perfil ya solicitado
    await page.locator('[data-testid="profile-card"]').first().click();
    await page.click('[data-testid="send-request-btn"]');
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Ya enviaste una solicitud');
  });

  test('debe mostrar contador de solicitudes pendientes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar badge de notificaciones
    await expect(page.locator('[data-testid="requests-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="requests-count"]')).toContainText(/\d+/);
  });

  test('debe enviar notificación al recibir solicitud', async ({ page }) => {
    // Simular recepción de nueva solicitud
    await page.goto('/requests');
    
    // Verificar notificación en tiempo real
    await expect(page.locator('[data-testid="new-request-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-sound"]')).toBeVisible();
  });

  test('debe manejar solicitudes de acceso a galería', async ({ page }) => {
    await page.goto('/profiles');
    
    // Acceder a perfil con galería privada
    await page.locator('[data-testid="profile-card"]').first().click();
    await page.click('[data-testid="gallery-tab"]');
    
    // Solicitar acceso a galería
    await page.click('[data-testid="request-gallery-access"]');
    
    // Verificar modal específico de galería
    await expect(page.locator('[data-testid="gallery-request-modal"]')).toBeVisible();
    await page.fill('[data-testid="gallery-request-reason"]', 'Me interesa conocer más sobre ustedes');
    await page.click('[data-testid="send-gallery-request"]');
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Solicitud de galería enviada');
  });

  test('debe gestionar solicitudes de chat privado', async ({ page }) => {
    await page.goto('/chat');
    
    // Intentar iniciar chat privado
    await page.click('[data-testid="start-private-chat"]');
    
    // Seleccionar usuario
    await page.locator('[data-testid="user-selector"]').first().click();
    
    // Enviar solicitud de chat
    await page.click('[data-testid="request-private-chat"]');
    
    // Verificar modal de solicitud
    await expect(page.locator('[data-testid="chat-request-modal"]')).toBeVisible();
    await page.fill('[data-testid="chat-request-message"]', 'Hola, ¿podemos chatear en privado?');
    await page.click('[data-testid="send-chat-request"]');
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Solicitud de chat enviada');
  });
});
