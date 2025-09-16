console.log('🚀 APK Test - Direct DOM manipulation');

// Crear contenido directamente en el DOM
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
      margin: 0;
    ">
      <div style="
        background: rgba(42, 42, 78, 0.9);
        padding: 50px 40px;
        border-radius: 20px;
        max-width: 450px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      ">
        <div style="
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          border-radius: 50%;
          margin: 0 auto 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        ">🎯</div>
        
        <h1 style="
          margin: 0 0 20px 0;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(45deg, #4CAF50, #81C784);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">ComplicesConecta</h1>
        
        <p style="
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
        ">APK Funcionando Correctamente</p>
        
        <p style="
          margin: 0 0 30px 0;
          font-size: 14px;
          opacity: 0.8;
          color: #b0b0b0;
        ">Versión 2.9.0 | ${new Date().toLocaleDateString('es-ES')}</p>
        
        <button onclick="testFunction()" style="
          padding: 15px 30px;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76, 175, 80, 0.3)'">
          Probar Funcionalidad ✨
        </button>
        
        <div style="
          margin-top: 30px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          border-left: 4px solid #4CAF50;
        ">
          <p style="
            margin: 0;
            font-size: 14px;
            color: #4CAF50;
            font-weight: 600;
          ">✅ Estado: Operativo</p>
          <p style="
            margin: 5px 0 0 0;
            font-size: 12px;
            opacity: 0.7;
          ">Todas las funciones básicas están disponibles</p>
        </div>
      </div>
    </div>
  `;

  // Función de prueba
  (window as any).testFunction = function() {
    alert('🎉 ¡Excelente! El APK funciona perfectamente.\n\n✅ DOM: Funcionando\n✅ JavaScript: Funcionando\n✅ Eventos: Funcionando\n✅ Estilos: Funcionando\n\nComplicesConecta v2.9.0 está listo para usar.');
  };

  console.log('✅ APK content loaded successfully with DOM manipulation');
} else {
  console.error('❌ Root element not found');
}
