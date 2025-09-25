import { chromium, FullConfig } from '@playwright/test';

/**
 * Teardown global para tests E2E - Limpieza final del entorno
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando teardown global E2E...');
  
  // Crear browser para limpieza final
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:4173';
    await page.goto(baseURL);
    
    // Limpieza completa de estado
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpiar cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Limpiar IndexedDB si existe
      if ('indexedDB' in window) {
        indexedDB.databases?.().then(databases => {
          databases.forEach(db => {
            if (db.name) indexedDB.deleteDatabase(db.name);
          });
        });
      }
    });
    
    console.log('🗑️ Estado de aplicación limpiado');
    
    // Resetear variables de entorno
    delete process.env.VITE_MOCK_MODE;
    delete process.env.VITE_SKIP_REAL_AUTH;
    
  } catch (error) {
    console.error('⚠️ Error en teardown global:', error);
    // No lanzar error para no fallar la suite completa
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('✅ Teardown global E2E completado');
}

export default globalTeardown;
