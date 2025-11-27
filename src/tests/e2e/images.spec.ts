import { test, expect } from '@playwright/test';

test.describe('Sistema de Imágenes', () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuario
    await page.goto('/auth');
    await page.click('button[data-testid="toggle-auth-mode"]');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('debe mostrar galería de perfil', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    await expect(page.locator('[data-testid="image-gallery"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-image-btn"]')).toBeVisible();
  });

  test('debe subir imagen a galería personal', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Preparar archivo de prueba
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    // Configurar privacidad de imagen
    await page.click('[data-testid="image-privacy-public"]');
    
    // Subir imagen
    await page.click('[data-testid="upload-btn"]');
    
    // Verificar carga exitosa
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-image"]')).toBeVisible();
  });

  test('debe configurar imagen como privada', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Subir imagen privada
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'private-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-private-image')
    });
    
    await page.click('[data-testid="image-privacy-private"]');
    await page.click('[data-testid="upload-btn"]');
    
    // Verificar configuración de privacidad
    await expect(page.locator('[data-testid="private-image-indicator"]')).toBeVisible();
  });

  test('debe eliminar imagen de galería', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Seleccionar imagen existente
    await page.locator('[data-testid="gallery-image"]').first().hover();
    await page.locator('[data-testid="delete-image-btn"]').first().click();
    
    // Confirmar eliminación
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-btn"]');
    
    // Verificar eliminación
    await expect(page.locator('[data-testid="delete-success"]')).toBeVisible();
  });

  test('debe ver imágenes públicas de otros usuarios', async ({ page }) => {
    await page.goto('/profiles');
    
    // Acceder a perfil de otro usuario
    await page.locator('[data-testid="profile-card"]').first().click();
    await page.click('[data-testid="gallery-tab"]');
    
    // Verificar imágenes públicas visibles
    await expect(page.locator('[data-testid="public-images"]')).toBeVisible();
    await expect(page.locator('[data-testid="gallery-image"]')).toBeVisible();
  });

  test('debe solicitar acceso a imágenes privadas', async ({ page }) => {
    await page.goto('/profiles');
    
    // Acceder a perfil con imágenes privadas
    await page.locator('[data-testid="profile-card"]').first().click();
    await page.click('[data-testid="gallery-tab"]');
    
    // Intentar ver imágenes privadas
    await page.click('[data-testid="private-images-section"]');
    
    // Verificar solicitud de acceso
    await expect(page.locator('[data-testid="access-request-modal"]')).toBeVisible();
    await page.fill('[data-testid="access-reason"]', 'Me gustaría conocer más sobre ustedes');
    await page.click('[data-testid="request-access-btn"]');
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="access-requested"]')).toBeVisible();
  });

  test('debe aprobar solicitud de acceso a galería', async ({ page }) => {
    await page.goto('/requests');
    await page.click('[data-testid="gallery-requests-tab"]');
    
    // Ver solicitudes de acceso pendientes
    await expect(page.locator('[data-testid="gallery-request-item"]')).toBeVisible();
    
    // Aprobar solicitud
    await page.locator('[data-testid="approve-gallery-access"]').first().click();
    
    // Confirmar aprobación
    await expect(page.locator('[data-testid="approve-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-approve-btn"]');
    
    // Verificar confirmación
    await expect(page.locator('[data-testid="access-granted"]')).toBeVisible();
  });

  test('debe validar tipos de archivo permitidos', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Intentar subir archivo no válido
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake-pdf-data')
    });
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="file-type-error"]')).toContainText('Solo se permiten imágenes');
  });

  test('debe validar tamaño máximo de archivo', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Simular archivo muy grande
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-image.jpg',
      mimeType: 'image/jpeg',
      buffer: largeBuffer
    });
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="file-size-error"]')).toContainText('Archivo muy grande');
  });

  test('debe mostrar progreso de carga', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Simular carga lenta
    await page.route('**/storage/v1/object/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    await page.click('[data-testid="upload-btn"]');
    
    // Verificar indicador de progreso
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  test('debe comprimir imágenes automáticamente', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Subir imagen de alta resolución
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'high-res-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-high-res-image')
    });
    
    await page.click('[data-testid="upload-btn"]');
    
    // Verificar proceso de compresión
    await expect(page.locator('[data-testid="compression-notice"]')).toBeVisible();
    await expect(page.locator('[data-testid="optimized-size"]')).toBeVisible();
  });

  test('debe generar miniaturas automáticamente', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    await page.click('[data-testid="upload-btn"]');
    
    // Verificar generación de miniaturas
    await expect(page.locator('[data-testid="thumbnail-generated"]')).toBeVisible();
    await expect(page.locator('[data-testid="image-thumbnail"]')).toBeVisible();
  });

  test('debe permitir reordenar imágenes', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Activar modo de edición
    await page.click('[data-testid="edit-gallery-btn"]');
    
    // Arrastrar y soltar imagen
    const firstImage = page.locator('[data-testid="gallery-image"]').first();
    const secondImage = page.locator('[data-testid="gallery-image"]').nth(1);
    
    await firstImage.dragTo(secondImage);
    
    // Guardar cambios
    await page.click('[data-testid="save-order-btn"]');
    
    // Verificar nuevo orden
    await expect(page.locator('[data-testid="order-saved"]')).toBeVisible();
  });

  test('debe establecer imagen de perfil principal', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Seleccionar imagen como principal
    await page.locator('[data-testid="gallery-image"]').first().hover();
    await page.locator('[data-testid="set-main-image-btn"]').first().click();
    
    // Confirmar selección
    await expect(page.locator('[data-testid="main-image-confirmation"]')).toBeVisible();
    await page.click('[data-testid="confirm-main-image"]');
    
    // Verificar imagen principal actualizada
    await expect(page.locator('[data-testid="main-image-indicator"]')).toBeVisible();
  });

  test('debe manejar errores de carga de imágenes', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="gallery-tab"]');
    
    // Simular error de servidor
    await page.route('**/storage/v1/object/**', route => route.abort());
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    await page.click('[data-testid="upload-btn"]');
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('Error al subir imagen');
  });
});
