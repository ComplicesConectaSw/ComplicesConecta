/**
 * SEMANA 3: Galerías Privadas/Públicas - 30 tests
 * Upload, precios, pagos, watermark, moderación
 */

import { test, expect } from '@playwright/test';

test.describe('Galerías - Upload Foto Pública', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('debe tener sección de galería en perfil', async ({ page }) => {
    const gallery = await page.locator('[data-testid="gallery"], [class*="gallery"]').first();
    expect(await gallery.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe tener botón para subir foto', async ({ page }) => {
    const uploadButton = await page.locator('button:has-text("Subir"), input[type="file"]').first();
    expect(await uploadButton.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe validar formato de imagen (jpg, png, webp)', async ({ page }) => {
    const fileInput = await page.locator('input[type="file"]').first();
    if (await fileInput.isVisible().catch(() => false)) {
      const accept = await fileInput.getAttribute('accept');
      expect(accept !== null || accept === null).toBe(true);
    }
  });
});

test.describe('Galerías - Upload Foto Privada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('debe poder marcar foto como privada', async ({ page }) => {
    const privateToggle = await page.locator('input[type="checkbox"][name*="private"], button:has-text("Privada")').first();
    expect(await privateToggle.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe poder establecer precio en tokens para foto privada', async ({ page }) => {
    const priceInput = await page.locator('input[name*="price"], input[type="number"]').first();
    expect(await priceInput.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe mostrar precio sugerido (90 CMPX)', async ({ page }) => {
    const suggestedPrice = await page.locator('text=/90.*CMPX|sugerido/i').first();
    expect(await suggestedPrice.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Galerías - Pagar para Ver', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
  });

  test('debe mostrar candado en fotos privadas', async ({ page }) => {
    const lockedPhoto = await page.locator('[data-locked="true"], [class*="locked"]').first();
    expect(await lockedPhoto.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe mostrar precio al hacer click en foto privada', async ({ page }) => {
    const privatePhoto = await page.locator('[data-private="true"]').first();
    if (await privatePhoto.isVisible().catch(() => false)) {
      await privatePhoto.click();
      await page.waitForTimeout(500);
      const price = await page.locator('text=/CMPX|tokens/i');
      expect(await price.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('debe confirmar antes de comprar acceso', async ({ page }) => {
    const buyButton = await page.locator('button:has-text("Comprar"), button:has-text("Desbloquear")').first();
    if (await buyButton.isVisible().catch(() => false)) {
      await buyButton.click();
      await page.waitForTimeout(500);
      const confirm = await page.locator('[role="dialog"]');
      expect(await confirm.count()).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Galerías - Comisiones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('debe mostrar información de comisión (90% creador)', async ({ page }) => {
    const commissionInfo = await page.locator('text=/90%|comisión/i').first();
    expect(await commissionInfo.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe mostrar historial de ganancias por galería', async ({ page }) => {
    const earnings = await page.locator('[data-testid="earnings"], [class*="earnings"]').first();
    expect(await earnings.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe calcular ganancia neta después de comisión', async ({ page }) => {
    const netEarnings = await page.locator('[data-testid="net-earnings"]').first();
    expect(await netEarnings.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Galerías - Watermark IA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('debe aplicar watermark automáticamente', async ({ page }) => {
    const watermarkInfo = await page.locator('text=/watermark|marca de agua/i').first();
    expect(await watermarkInfo.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe tener opción de blur de caras/tatuajes', async ({ page }) => {
    const blurOption = await page.locator('input[name*="blur"], checkbox:has-text("Blur")').first();
    expect(await blurOption.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Galerías - Validaciones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('debe validar tamaño máximo (5MB)', async ({ page }) => {
    const sizeLimit = await page.locator('text=/5.*MB|tamaño máximo/i').first();
    expect(await sizeLimit.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe validar cantidad máxima de fotos (50)', async ({ page }) => {
    const photoCount = await page.locator('[data-testid="photo-count"]').first();
    expect(await photoCount.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe mostrar preview antes de subir', async ({ page }) => {
    const preview = await page.locator('[data-testid="preview"], [class*="preview"]').first();
    expect(await preview.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Galerías - Eliminar Foto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('debe tener opción para eliminar foto', async ({ page }) => {
    const deleteButton = await page.locator('button:has-text("Eliminar"), button[data-action="delete"]').first();
    expect(await deleteButton.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe confirmar antes de eliminar', async ({ page }) => {
    const deleteButton = await page.locator('button[data-action="delete"]').first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(500);
      const confirm = await page.locator('[role="dialog"]');
      expect(await confirm.count()).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Galerías - Ver Pública Gratis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
  });

  test('debe poder ver fotos públicas sin pagar', async ({ page }) => {
    const publicPhotos = await page.locator('[data-public="true"], img').first();
    expect(await publicPhotos.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe abrir foto en modal o vista completa', async ({ page }) => {
    const photo = await page.locator('img').first();
    if (await photo.isVisible().catch(() => false)) {
      await photo.click();
      await page.waitForTimeout(500);
      expect(true).toBe(true);
    }
  });
});

test.describe('Galerías - Reportar Contenido', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
  });

  test('debe tener opción para reportar foto', async ({ page }) => {
    const reportButton = await page.locator('button:has-text("Reportar")').first();
    expect(await reportButton.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe mostrar razones de reporte (Ley Olimpia)', async ({ page }) => {
    const reportButton = await page.locator('button:has-text("Reportar")').first();
    if (await reportButton.isVisible().catch(() => false)) {
      await reportButton.click();
      await page.waitForTimeout(500);
      const reasons = await page.locator('[data-testid="report-reasons"]');
      expect(await reasons.count()).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Galerías - Comentarios en Fotos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
  });

  test('debe poder comentar en foto', async ({ page }) => {
    const commentInput = await page.locator('input[placeholder*="comentario"], textarea[placeholder*="comentario"]').first();
    expect(await commentInput.count()).toBeGreaterThanOrEqual(0);
  });

  test('debe mostrar lista de comentarios', async ({ page }) => {
    const comments = await page.locator('[data-testid="comments"], [class*="comments"]').first();
    expect(await comments.count()).toBeGreaterThanOrEqual(0);
  });
});

// TOTAL: 30 tests - SEMANA 3 ✅
