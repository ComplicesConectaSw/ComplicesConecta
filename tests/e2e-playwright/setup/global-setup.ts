import { chromium, FullConfig } from '@playwright/test';

/**
 * Setup global para tests E2E - Configuración inicial del entorno
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global E2E...');
  
  // Crear browser para setup inicial
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Verificar que el servidor esté disponible
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:4173';
    console.log('📡 Verificando servidor en: http://localhost:4173');
  
    // Verificar que el servidor esté disponible
    const response = await fetch('http://localhost:4173');
    if (!response.ok) {
      throw new Error(`Servidor no disponible en http://localhost:4173`);
    }
  
    console.log('✅ Servidor disponible y respondiendo');
    
    // Limpiar localStorage y sessionStorage globalmente usando addInitScript
    await context.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Global setup: Error clearing storage:', e);
      }
    });
    
    // Configurar variables de entorno para tests
    process.env.VITE_MOCK_MODE = 'true';
    process.env.VITE_SKIP_REAL_AUTH = 'true';
    process.env.NODE_ENV = 'test';
    
    console.log('🧹 Estado limpio configurado');
    console.log('🎭 Modo mock activado');
    
  } catch (error) {
    console.error('❌ Error en setup global:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('✅ Setup global E2E completado');
}

export default globalSetup;
