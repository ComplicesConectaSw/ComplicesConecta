/**
 * Tests E2E para Accesibilidad WCAG 2.1
 * Verifica cumplimiento de estándares de accesibilidad
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Verificar que existe al menos un h1
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);

    // Verificar jerarquía de headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 1) {
      // Verificar que no se salten niveles de heading
      const headingLevels = await Promise.all(
        headings.map(async (heading) => {
          const tagName = await heading.evaluate(el => el.tagName);
          return parseInt(tagName.charAt(1));
        })
      );

      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        
        // No debería saltar más de un nivel
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have accessible buttons with proper labels', async ({ page }) => {
    // Obtener todos los botones
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      // Verificar que el botón tiene texto visible o aria-label
      const textContent = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      const hasAccessibleName = 
        (textContent && textContent.trim().length > 0) ||
        (ariaLabel && ariaLabel.trim().length > 0) ||
        ariaLabelledBy;

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have alt text for images', async ({ page }) => {
    // Obtener todas las imágenes
    const images = await page.locator('img').all();

    for (const image of images) {
      const altText = await image.getAttribute('alt');
      
      // Todas las imágenes deben tener atributo alt (puede estar vacío para decorativas)
      expect(altText).not.toBeNull();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Verificar que se puede navegar con Tab
    await page.keyboard.press('Tab');
    
    // Verificar que hay un elemento con focus
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);

    // Navegar por varios elementos
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocused = await page.locator(':focus').count();
      expect(currentFocused).toBeGreaterThan(0);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Verificar que no hay elementos con las clases de bajo contraste problemáticas
    const lowContrastElements = await page.locator('.text-gray-300, .text-gray-400, .text-gray-500').all();
    
    for (const element of lowContrastElements) {
      // Verificar que el elemento tiene correcciones de contraste aplicadas
      const hasContrastFix = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const textShadow = style.textShadow;
        
        // Verificar si tiene color blanco o sombra de texto (indicando corrección)
        return color.includes('255, 255, 255') || textShadow !== 'none';
      });

      expect(hasContrastFix).toBeTruthy();
    }
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Simular preferencia de movimiento reducido
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Verificar que las animaciones están deshabilitadas o reducidas
    const animatedElements = await page.locator('[class*="animate-"]').all();
    
    for (const element of animatedElements) {
      const animationDuration = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.animationDuration;
      });
      
      // Las animaciones deberían estar muy reducidas o deshabilitadas
      expect(animationDuration === '0s' || animationDuration === '0.01s').toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Navegar a una página con formularios si existe
    const inputs = await page.locator('input, textarea, select').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        // Verificar que existe un label asociado
        const associatedLabel = await page.locator(`label[for="${id}"]`).count();
        const hasLabel = associatedLabel > 0 || ariaLabel || ariaLabelledBy;
        
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should have accessible navigation landmarks', async ({ page }) => {
    // Verificar que existen elementos de navegación semánticos
    const nav = await page.locator('nav').count();
    const main = await page.locator('main').count();
    
    expect(nav).toBeGreaterThan(0);
    expect(main).toBeGreaterThan(0);
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Obtener elementos focusables
    const focusableElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();

    for (const element of focusableElements.slice(0, 5)) { // Probar los primeros 5
      await element.focus();
      
      // Verificar que el elemento tiene indicador de focus visible
      const focusIndicator = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.outline !== 'none' || style.boxShadow !== 'none';
      });

      expect(focusIndicator).toBeTruthy();
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simular modo de alto contraste
    await page.emulateMedia({ forcedColors: 'active' });
    
    // Verificar que los elementos son visibles en alto contraste
    const textElements = await page.locator('p, h1, h2, h3, span').all();
    
    for (const element of textElements.slice(0, 10)) { // Probar los primeros 10
      const isVisible = await element.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('should have proper ARIA roles and properties', async ({ page }) => {
    // Verificar elementos con roles ARIA
    const elementsWithRoles = await page.locator('[role]').all();

    for (const element of elementsWithRoles) {
      const role = await element.getAttribute('role');
      
      // Verificar que el role es válido
      const validRoles = [
        'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
        'complementary', 'region', 'article', 'section', 'alert', 'dialog',
        'tablist', 'tab', 'tabpanel', 'menu', 'menuitem', 'listbox', 'option'
      ];
      
      expect(validRoles).toContain(role);
    }
  });

  test('should be usable with screen reader', async ({ page }) => {
    // Verificar que los elementos importantes tienen texto accesible
    const interactiveElements = await page.locator('button, a, input').all();

    for (const element of interactiveElements.slice(0, 10)) {
      const accessibleName = await element.evaluate(el => {
        // Simular cómo un screen reader obtendría el nombre accesible
        return el.getAttribute('aria-label') || 
               el.textContent?.trim() || 
               el.getAttribute('title') ||
               el.getAttribute('alt');
      });

      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.length).toBeGreaterThan(0);
    }
  });

  test('should have minimum touch target size', async ({ page }) => {
    // Verificar que los elementos interactivos tienen tamaño mínimo de 44px
    const touchTargets = await page.locator('button, a[href], input[type="button"], input[type="submit"]').all();

    for (const target of touchTargets.slice(0, 10)) {
      const boundingBox = await target.boundingBox();
      
      if (boundingBox) {
        // WCAG recomienda mínimo 44x44px para touch targets
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should handle zoom up to 200%', async ({ page }) => {
    // Simular zoom al 200%
    await page.setViewportSize({ width: 640, height: 480 }); // Simular zoom reduciendo viewport
    
    // Verificar que el contenido sigue siendo accesible
    const mainContent = await page.locator('main').isVisible();
    expect(mainContent).toBeTruthy();

    // Verificar que no hay scroll horizontal
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowInnerWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth * 1.1); // Permitir 10% de tolerancia
  });
});
