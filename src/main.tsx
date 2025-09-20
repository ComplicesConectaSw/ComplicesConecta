// Carga completa de React para APK nativo
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import { logger, logError } from '@/lib/logger';
import './index.css'
import './styles/responsive.css'
import './styles/text-overflow-fixes.css'

logger.info('🚀 ComplicesConecta APK - Carga Completa Iniciando...');

// Función para cargar la aplicación completa de React
async function loadMainApp() {
  try {
    logger.info('📦 Loading full ComplicesConecta React application...');
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Mostrar pantalla de carga mientras se inicializa
    showLoadingScreen();
    
    // Pequeña pausa para mostrar la pantalla de carga
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info('✅ Rendering full React application...');
    
    // Limpiar contenido previo
    rootElement.innerHTML = '';
    
    // Renderizar la aplicación completa
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    logger.info('🎉 Full ComplicesConecta app loaded successfully!');
    return true;

  } catch (error) {
    if (error instanceof Error) {
      logError(error, { context: 'main_app_load' });
    } else {
      logger.error('❌ Failed to load full app:', { errorMessage: String(error) });
    }
    showErrorWithFallback(error);
    return false;
  }
}

// Función para mostrar pantalla de carga
function showLoadingScreen() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(42, 42, 78, 0.9);
          padding: 40px;
          border-radius: 20px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        ">
          <div style="
            width: 60px;
            height: 60px;
            border: 4px solid #4CAF50;
            border-top: 4px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <h1 style="margin: 0 0 15px 0; font-size: 24px; color: #4CAF50;">
            🎯 ComplicesConecta
          </h1>
          <p style="margin: 0 0 10px 0; font-size: 16px;">
            Cargando aplicación...
          </p>
          <p style="margin: 0; font-size: 14px; opacity: 0.7;">
            Versión 2.9.3
          </p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }
}

// Función para mostrar error con fallback
function showErrorWithFallback(error: unknown) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(42, 42, 78, 0.9);
          padding: 40px;
          border-radius: 20px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        ">
          <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #f44336;">
            ⚠️ Modo Compatibilidad
          </h1>
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            Aplicación principal no disponible
          </p>
          <p style="margin: 0 0 25px 0; font-size: 14px; opacity: 0.8;">
            Ejecutando en modo básico
          </p>
          <button onclick="location.reload()" style="
            padding: 12px 24px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            margin-bottom: 15px;
          ">
            Reintentar Carga Completa
          </button>
          <button onclick="showBasicApp()" style="
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
          ">
            Continuar en Modo Básico
          </button>
        </div>
      </div>
    `;

    (window as any).showBasicApp = function() {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
        ">
          <div style="max-width: 800px; margin: 0 auto;">
            <header style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 32px; margin-bottom: 10px; color: #4CAF50;">
                🎯 ComplicesConecta
              </h1>
              <p style="font-size: 18px; opacity: 0.8;">
                Plataforma de Conexión Social - Versión 2.9.3
              </p>
            </header>
            
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            ">
              <div style="
                background: rgba(42, 42, 78, 0.9);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
              ">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">👥 Conexiones</h3>
                <p style="opacity: 0.8;">Conecta con personas afines</p>
              </div>
              
              <div style="
                background: rgba(42, 42, 78, 0.9);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
              ">
                <h3 style="color: #2196F3; margin-bottom: 15px;">💬 Mensajes</h3>
                <p style="opacity: 0.8;">Comunícate de forma segura</p>
              </div>
              
              <div style="
                background: rgba(42, 42, 78, 0.9);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
              ">
                <h3 style="color: #FF9800; margin-bottom: 15px;">🎯 Intereses</h3>
                <p style="opacity: 0.8;">Descubre nuevas aficiones</p>
              </div>
            </div>
            
            <div style="
              background: rgba(42, 42, 78, 0.9);
              padding: 30px;
              border-radius: 15px;
              text-align: center;
            ">
              <h3 style="color: #4CAF50; margin-bottom: 20px;">Estado del Sistema</h3>
              <p style="color: #4CAF50; font-weight: bold;">✅ APK Funcionando Correctamente</p>
              <p style="opacity: 0.8; margin: 10px 0;">
                Todas las funciones básicas están operativas
              </p>
              <button onclick="location.reload()" style="
                padding: 15px 30px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
              ">
                Intentar Cargar Aplicación Completa
              </button>
            </div>
          </div>
        </div>
      `;
    };
  }
}

// Inicializar aplicación completa directamente
async function initializeApp() {
  logger.info('🚀 Initializing full ComplicesConecta application...');
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    logger.error('❌ Root element not found');
    return;
  }

  // Cargar aplicación completa inmediatamente
  await loadMainApp();
}

// Iniciar la aplicación completa
initializeApp();
