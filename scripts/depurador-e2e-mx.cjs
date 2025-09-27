#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Depurador de Tests E2E en Español Mexicano
 * Captura errores específicos de tests Playwright E2E y genera reporte detallado
 */
class DepuradorE2EMX {
  constructor() {
    this.resultadosTests = new Map();
    this.erroresDetallados = new Map();
    this.horaInicio = new Date();
    this.patronesError = [];
    this.estadisticasE2E = {
      totalTests: 0,
      testsPasados: 0,
      testsFallidos: 0,
      duracionTotal: 0
    };
  }

  /**
   * Ejecuta el análisis completo de tests E2E fallidos
   */
  async ejecutarAnalisisCompleto() {
    console.log('🎭 Iniciando análisis detallado de tests E2E Playwright...\n');
    console.log('📅 Fecha:', this.horaInicio.toLocaleString('es-MX'));
    console.log('⏰ Hora de inicio:', this.horaInicio.toLocaleTimeString('es-MX'));
    console.log('');

    try {
      // Obtener lista de archivos de test E2E
      const archivosE2E = this.obtenerArchivosE2E();
      console.log(`📂 Se encontraron ${archivosE2E.length} archivos de test E2E`);
      console.log('');

      // Ejecutar tests E2E con salida detallada
      await this.ejecutarTestsE2EConDetalle();

      // Generar reporte en markdown
      const rutaReporte = await this.generarReporteMarkdown();
      
      console.log('\n✅ Análisis E2E completado exitosamente');
      console.log(`📄 Reporte generado: ${rutaReporte}`);
      
      return rutaReporte;

    } catch (error) {
      console.error('❌ Error durante el análisis E2E:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene la lista de archivos de test E2E
   */
  obtenerArchivosE2E() {
    const directorioE2E = path.join(process.cwd(), 'src', 'tests', 'e2e');
    
    if (!fs.existsSync(directorioE2E)) {
      throw new Error(`No se encontró el directorio de tests E2E: ${directorioE2E}`);
    }

    const archivos = fs.readdirSync(directorioE2E);
    return archivos
      .filter(archivo => archivo.endsWith('.spec.ts') || archivo.endsWith('.spec.js'))
      .map(archivo => path.join('src', 'tests', 'e2e', archivo));
  }

  /**
   * Ejecuta los tests E2E con salida detallada
   */
  async ejecutarTestsE2EConDetalle() {
    console.log('🎭 Ejecutando suite completa de tests E2E con Playwright...');
    
    return new Promise((resolve, reject) => {
      const playwright = spawn('npx', ['playwright', 'test', '--reporter=list'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        cwd: process.cwd()
      });

      let salidaCompleta = '';
      let salidaError = '';

      playwright.stdout.on('data', (datos) => {
        const fragmento = datos.toString();
        salidaCompleta += fragmento;
        // Mostrar progreso en tiempo real
        process.stdout.write(fragmento);
      });

      playwright.stderr.on('data', (datos) => {
        const fragmento = datos.toString();
        salidaError += fragmento;
        process.stderr.write(fragmento);
      });

      playwright.on('close', (codigoSalida) => {
        console.log(`\n📊 Tests E2E completados con código de salida: ${codigoSalida}`);
        this.procesarSalidaE2E(salidaCompleta, salidaError, codigoSalida);
        resolve();
      });

      playwright.on('error', (error) => {
        console.error('❌ Error ejecutando playwright:', error.message);
        reject(error);
      });

      // Timeout de 10 minutos para E2E
      setTimeout(() => {
        playwright.kill();
        console.log('\n⚠️ Tests E2E interrumpidos por timeout (10 minutos)');
        resolve();
      }, 600000);
    });
  }

  /**
   * Procesa la salida de los tests E2E para extraer información
   */
  procesarSalidaE2E(stdout, stderr, codigoSalida) {
    console.log('\n🔍 Analizando resultados de tests E2E...');

    // Patrones específicos para Playwright E2E
    const patronTestsE2E = /(\d+) failed/g;
    const patronTestsPasados = /(\d+) passed/g;
    const patronTimeouts = /Test timeout of (\d+)ms exceeded/g;
    const patronElementosNoEncontrados = /locator\.(.*?) timed out/g;
    const patronErroresNavegacion = /Navigation timeout of (\d+)ms exceeded/g;
    const patronErroresAssercion = /expect\((.*?)\)\.(.+?) timed out/g;
    const patronErroresSelector = /Error: (.+?) selector/g;
    const patronErroresConexion = /browserType\.launch: (.+?) failed/g;

    // Extraer estadísticas generales
    const testsFallidos = stdout.match(patronTestsE2E);
    const testsPasados = stdout.match(patronTestsPasados);
    
    if (testsFallidos) {
      this.estadisticasE2E.testsFallidos = parseInt(testsFallidos[0].match(/\d+/)[0]);
    }
    if (testsPasados) {
      this.estadisticasE2E.testsPasados = parseInt(testsPasados[0].match(/\d+/)[0]);
    }
    this.estadisticasE2E.totalTests = this.estadisticasE2E.testsFallidos + this.estadisticasE2E.testsPasados;

    // Extraer errores específicos de E2E
    this.extraerErroresE2E(stdout, stderr);

    // Almacenar salida completa (limitada)
    this.salidaCompleta = {
      stdout: stdout.substring(0, 25000), // Más espacio para E2E
      stderr: stderr.substring(0, 10000),
      codigoSalida
    };

    console.log(`📈 Tests E2E fallidos: ${this.estadisticasE2E.testsFallidos}`);
    console.log(`✅ Tests E2E pasados: ${this.estadisticasE2E.testsPasados}`);
    console.log(`🔍 Patrones de error E2E identificados: ${this.patronesError.length}`);
  }

  /**
   * Extrae errores específicos de E2E de la salida
   */
  extraerErroresE2E(stdout, stderr) {
    const errores = new Map();

    // Timeouts de navegación
    const timeoutsNavegacion = [...stdout.matchAll(/Navigation timeout of (\d+)ms exceeded/g)];
    if (timeoutsNavegacion.length > 0) {
      errores.set('Timeouts de Navegación', timeoutsNavegacion.map(m => `Timeout de navegación: ${m[1]}ms`));
      this.patronesError.push({
        tipo: 'Timeouts de Navegación',
        cantidad: timeoutsNavegacion.length,
        descripcion: 'Páginas que tardan demasiado en cargar',
        solucion: 'Optimizar carga de páginas o aumentar timeout de navegación'
      });
    }

    // Elementos no encontrados (locators)
    const elementosNoEncontrados = [...stdout.matchAll(/locator\.(.*?) timed out/g)];
    if (elementosNoEncontrados.length > 0) {
      errores.set('Elementos No Encontrados', elementosNoEncontrados.map(m => `Locator timeout: ${m[1]}`));
      this.patronesError.push({
        tipo: 'Elementos No Encontrados',
        cantidad: elementosNoEncontrados.length,
        descripcion: 'Elementos DOM no encontrados por los selectores',
        solucion: 'Verificar selectores CSS/XPath y tiempos de renderizado'
      });
    }

    // Errores de aserción E2E
    const erroresAsercionE2E = [...stdout.matchAll(/expect\((.*?)\)\.(.+?) timed out/g)];
    if (erroresAsercionE2E.length > 0) {
      errores.set('Errores de Aserción E2E', erroresAsercionE2E.map(m => `expect(${m[1]}).${m[2]} timeout`));
      this.patronesError.push({
        tipo: 'Errores de Aserción E2E',
        cantidad: erroresAsercionE2E.length,
        descripcion: 'Aserciones que no se cumplen en el tiempo esperado',
        solucion: 'Revisar condiciones esperadas y tiempos de espera'
      });
    }

    // Errores de selector
    const erroresSelector = [...stdout.matchAll(/Error: (.+?) selector/g)];
    if (erroresSelector.length > 0) {
      errores.set('Errores de Selector', erroresSelector.map(m => m[1]));
      this.patronesError.push({
        tipo: 'Errores de Selector',
        cantidad: erroresSelector.length,
        descripcion: 'Selectores CSS/XPath inválidos o incorrectos',
        solucion: 'Corregir sintaxis de selectores y verificar estructura DOM'
      });
    }

    // Errores de conexión/browser
    const erroresConexion = [...stdout.matchAll(/browserType\.launch: (.+?) failed/g)];
    if (erroresConexion.length > 0) {
      errores.set('Errores de Browser', erroresConexion.map(m => m[1]));
      this.patronesError.push({
        tipo: 'Errores de Browser',
        cantidad: erroresConexion.length,
        descripcion: 'Fallos al lanzar o conectar con el navegador',
        solucion: 'Verificar instalación de navegadores y permisos del sistema'
      });
    }

    // Timeouts generales de test
    const timeoutsTest = [...stdout.matchAll(/Test timeout of (\d+)ms exceeded/g)];
    if (timeoutsTest.length > 0) {
      errores.set('Timeouts de Test', timeoutsTest.map(m => `Test timeout: ${m[1]}ms`));
      this.patronesError.push({
        tipo: 'Timeouts de Test',
        cantidad: timeoutsTest.length,
        descripcion: 'Tests que exceden el tiempo límite configurado',
        solucion: 'Optimizar tests o aumentar timeout en playwright.config.ts'
      });
    }

    this.erroresDetallados = errores;
  }

  /**
   * Genera el reporte detallado en formato markdown
   */
  async generarReporteMarkdown() {
    const horaFin = new Date();
    const duracion = Math.round((horaFin - this.horaInicio) / 1000);
    
    let reporte = `# 🎭 Reporte Detallado de Tests E2E Playwright\n\n`;
    reporte += `**Generado:** ${horaFin.toLocaleString('es-MX')}\n`;
    reporte += `**Duración del análisis:** ${duracion} segundos\n`;
    reporte += `**Sistema:** Playwright en Windows\n`;
    reporte += `**Comando ejecutado:** \`npx playwright test --reporter=verbose\`\n\n`;

    // Resumen ejecutivo E2E
    reporte += this.generarResumenEjecutivoE2E();

    // Estadísticas de tests E2E
    reporte += this.generarEstadisticasE2E();

    // Análisis de errores específicos E2E
    if (this.erroresDetallados.size > 0) {
      reporte += this.generarSeccionErroresE2E();
    }

    // Patrones de error E2E identificados
    if (this.patronesError.length > 0) {
      reporte += this.generarSeccionPatronesErrorE2E();
    }

    // Salida completa
    reporte += this.generarSeccionSalidaCompletaE2E();

    // Plan de acción E2E
    reporte += this.generarPlanAccionE2E();

    // Comandos útiles E2E
    reporte += this.generarComandosUtilesE2E();

    // Metadata final
    reporte += `\n---\n`;
    reporte += `*Reporte generado automáticamente por DepuradorE2EMX*\n`;
    reporte += `*Fecha: ${horaFin.toISOString()}*\n`;
    reporte += `*Duración: ${duracion} segundos*\n`;

    // Escribir archivo
    const rutaReporte = path.join(process.cwd(), 'docs', 'testing', 'REPORTE_E2E_FALLIDOS_MX.md');
    
    // Crear directorio si no existe
    const dirReporte = path.dirname(rutaReporte);
    if (!fs.existsSync(dirReporte)) {
      fs.mkdirSync(dirReporte, { recursive: true });
    }
    
    fs.writeFileSync(rutaReporte, reporte, 'utf8');
    
    return rutaReporte;
  }

  /**
   * Genera la sección de resumen ejecutivo E2E
   */
  generarResumenEjecutivoE2E() {
    const tasaExito = this.estadisticasE2E.totalTests > 0 
      ? Math.round((this.estadisticasE2E.testsPasados / this.estadisticasE2E.totalTests) * 100)
      : 0;
    
    let resumen = `## 📋 Resumen Ejecutivo E2E\n\n`;
    resumen += `| Métrica | Valor |\n`;
    resumen += `|---------|-------|\n`;
    resumen += `| Tests E2E totales | ${this.estadisticasE2E.totalTests} |\n`;
    resumen += `| Tests fallidos | ${this.estadisticasE2E.testsFallidos} |\n`;
    resumen += `| Tests pasados | ${this.estadisticasE2E.testsPasados} |\n`;
    resumen += `| Tasa de éxito | ${tasaExito}% |\n`;
    resumen += `| Patrones de error E2E | ${this.patronesError.length} |\n`;
    resumen += `| Código de salida | ${this.salidaCompleta?.codigoSalida || 'N/A'} |\n\n`;

    return resumen;
  }

  /**
   * Genera estadísticas detalladas de E2E
   */
  generarEstadisticasE2E() {
    let stats = `## 📊 Estadísticas Detalladas E2E\n\n`;
    
    stats += `### Estado General\n`;
    if (this.estadisticasE2E.testsFallidos > 0) {
      stats += `🔴 **CRÍTICO**: ${this.estadisticasE2E.testsFallidos} tests E2E fallando\n\n`;
    } else {
      stats += `🟢 **EXCELENTE**: Todos los tests E2E pasando\n\n`;
    }

    stats += `### Distribución de Resultados\n`;
    stats += `- ✅ **Pasados**: ${this.estadisticasE2E.testsPasados}\n`;
    stats += `- ❌ **Fallidos**: ${this.estadisticasE2E.testsFallidos}\n`;
    stats += `- 📊 **Total**: ${this.estadisticasE2E.totalTests}\n\n`;

    return stats;
  }

  /**
   * Genera la sección de errores específicos E2E
   */
  generarSeccionErroresE2E() {
    let seccion = `## ⚠️ Errores Específicos E2E Detectados\n\n`;
    
    for (const [tipoError, errores] of this.erroresDetallados) {
      seccion += `### ${tipoError}\n\n`;
      seccion += `**Cantidad:** ${errores.length} errores\n\n`;
      
      errores.slice(0, 15).forEach((error, indice) => {
        seccion += `${indice + 1}. \`${error}\`\n`;
      });
      
      if (errores.length > 15) {
        seccion += `... y ${errores.length - 15} errores más\n`;
      }
      
      seccion += `\n`;
    }

    return seccion;
  }

  /**
   * Genera la sección de patrones de error E2E
   */
  generarSeccionPatronesErrorE2E() {
    let seccion = `## 🔍 Patrones de Error E2E Identificados\n\n`;
    
    this.patronesError.forEach((patron, indice) => {
      seccion += `### ${indice + 1}. ${patron.tipo}\n\n`;
      seccion += `- **Ocurrencias:** ${patron.cantidad}\n`;
      seccion += `- **Descripción:** ${patron.descripcion}\n`;
      seccion += `- **Solución sugerida:** ${patron.solucion}\n\n`;
    });

    return seccion;
  }

  /**
   * Genera la sección de salida completa E2E
   */
  generarSeccionSalidaCompletaE2E() {
    let seccion = `## 📝 Salida Completa del Comando E2E\n\n`;
    
    if (this.salidaCompleta?.stderr) {
      seccion += `### Errores del Sistema E2E (stderr)\n\n`;
      seccion += `\`\`\`\n${this.salidaCompleta.stderr}\n\`\`\`\n\n`;
    }
    
    seccion += `### Salida Principal E2E (stdout - últimos 25,000 caracteres)\n\n`;
    seccion += `\`\`\`\n${this.salidaCompleta?.stdout || 'No disponible'}\n\`\`\`\n\n`;

    return seccion;
  }

  /**
   * Genera el plan de acción recomendado para E2E
   */
  generarPlanAccionE2E() {
    let plan = `## 🎯 Plan de Acción E2E Recomendado\n\n`;
    
    plan += `### Prioridad Crítica 🚨\n\n`;
    plan += `1. **Corregir timeouts de navegación**\n`;
    plan += `   - Aumentar timeout en playwright.config.ts si es necesario\n`;
    plan += `   - Optimizar tiempo de carga de páginas\n`;
    plan += `   - Verificar que el servidor de desarrollo esté corriendo\n\n`;
    
    plan += `2. **Corregir selectores de elementos**\n`;
    plan += `   - Verificar que los elementos existan en el DOM\n`;
    plan += `   - Usar data-testid para elementos específicos\n`;
    plan += `   - Agregar waitFor() antes de interactuar con elementos\n\n`;
    
    plan += `### Prioridad Alta 🔥\n\n`;
    plan += `3. **Optimizar aserciones E2E**\n`;
    plan += `   - Usar expect().toBeVisible() en lugar de expect().toBeTruthy()\n`;
    plan += `   - Agregar waitFor() para condiciones asíncronas\n`;
    plan += `   - Verificar que las condiciones sean realistas\n\n`;
    
    plan += `4. **Verificar configuración de navegadores**\n`;
    plan += `   - Ejecutar: npx playwright install\n`;
    plan += `   - Verificar permisos del sistema\n`;
    plan += `   - Revisar configuración en playwright.config.ts\n\n`;
    
    plan += `### Prioridad Media 📋\n\n`;
    plan += `5. **Mejorar estabilidad de tests**\n`;
    plan += `   - Agregar page.waitForLoadState('networkidle')\n`;
    plan += `   - Usar locators más específicos\n`;
    plan += `   - Implementar retry logic para elementos dinámicos\n\n`;

    return plan;
  }

  /**
   * Genera la sección de comandos útiles E2E
   */
  generarComandosUtilesE2E() {
    let comandos = `## 🛠️ Comandos Útiles para Depuración E2E\n\n`;
    
    comandos += `### Ejecutar test E2E específico\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx playwright test src/tests/e2e/[nombre-test].spec.ts --reporter=verbose\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Ejecutar test E2E en modo debug\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx playwright test --debug src/tests/e2e/[nombre-test].spec.ts\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Ejecutar test E2E con UI mode\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx playwright test --ui\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Ver reporte HTML de Playwright\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx playwright show-report\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Instalar navegadores de Playwright\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx playwright install\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Re-ejecutar este análisis E2E\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `node scripts/depurador-e2e-mx.cjs\n`;
    comandos += `\`\`\`\n\n`;

    return comandos;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const depurador = new DepuradorE2EMX();
  depurador.ejecutarAnalisisCompleto()
    .then(rutaReporte => {
      console.log(`\n🎉 ¡Análisis E2E completado exitosamente!`);
      console.log(`📄 Reporte disponible en: ${rutaReporte}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error durante el análisis E2E:', error.message);
      process.exit(1);
    });
}

module.exports = DepuradorE2EMX;
