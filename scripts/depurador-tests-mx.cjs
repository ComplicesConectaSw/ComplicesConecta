#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Depurador de Tests en Español Mexicano
 * Captura errores específicos de tests y genera reporte detallado
 */
class DepuradorTestsMX {
  constructor() {
    this.resultadosTests = new Map();
    this.erroresDetallados = new Map();
    this.horaInicio = new Date();
    this.patronesError = [];
  }

  /**
   * Ejecuta el análisis completo de tests fallidos
   */
  async ejecutarAnalisisCompleto() {
    console.log('🔍 Iniciando análisis detallado de tests fallidos...\n');
    console.log('📅 Fecha:', this.horaInicio.toLocaleString('es-MX'));
    console.log('⏰ Hora de inicio:', this.horaInicio.toLocaleTimeString('es-MX'));
    console.log('');

    try {
      // Obtener lista de archivos de test
      const archivosTest = this.obtenerArchivosTest();
      console.log(`📂 Se encontraron ${archivosTest.length} archivos de test`);
      console.log('');

      // Ejecutar tests con salida detallada
      await this.ejecutarTestsConDetalle();

      // Generar reporte en markdown
      const rutaReporte = await this.generarReporteMarkdown();
      
      console.log('\n✅ Análisis completado exitosamente');
      console.log(`📄 Reporte generado: ${rutaReporte}`);
      
      return rutaReporte;

    } catch (error) {
      console.error('❌ Error durante el análisis:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene la lista de archivos de test
   */
  obtenerArchivosTest() {
    const directorioTests = path.join(process.cwd(), 'src', 'tests', 'unit');
    
    if (!fs.existsSync(directorioTests)) {
      throw new Error(`No se encontró el directorio de tests: ${directorioTests}`);
    }

    const archivos = fs.readdirSync(directorioTests);
    return archivos
      .filter(archivo => archivo.endsWith('.test.ts') || archivo.endsWith('.test.tsx'))
      .map(archivo => path.join('src', 'tests', 'unit', archivo));
  }

  /**
   * Ejecuta los tests con salida detallada
   */
  async ejecutarTestsConDetalle() {
    console.log('🚀 Ejecutando suite completa de tests...');
    
    return new Promise((resolve, reject) => {
      const vitest = spawn('npx', ['vitest', 'run', '--reporter=verbose', '--no-coverage'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        cwd: process.cwd()
      });

      let salidaCompleta = '';
      let salidaError = '';

      vitest.stdout.on('data', (datos) => {
        const fragmento = datos.toString();
        salidaCompleta += fragmento;
        // Mostrar progreso en tiempo real
        process.stdout.write(fragmento);
      });

      vitest.stderr.on('data', (datos) => {
        const fragmento = datos.toString();
        salidaError += fragmento;
        process.stderr.write(fragmento);
      });

      vitest.on('close', (codigoSalida) => {
        console.log(`\n📊 Tests completados con código de salida: ${codigoSalida}`);
        this.procesarSalidaTests(salidaCompleta, salidaError, codigoSalida);
        resolve();
      });

      vitest.on('error', (error) => {
        console.error('❌ Error ejecutando vitest:', error.message);
        reject(error);
      });

      // Timeout de 3 minutos
      setTimeout(() => {
        vitest.kill();
        console.log('\n⚠️ Tests interrumpidos por timeout (3 minutos)');
        resolve();
      }, 180000);
    });
  }

  /**
   * Procesa la salida de los tests para extraer información
   */
  procesarSalidaTests(stdout, stderr, codigoSalida) {
    console.log('\n🔍 Analizando resultados de tests...');

    // Patrones para identificar tests fallidos
    const patronTestsFallidos = /❯ (.+?) \((\d+) tests \| (\d+) failed\)/g;
    const patronErrores = /AssertionError: (.+)/g;
    const patronTimeouts = /Test timed out in (\d+)ms/g;
    const patronElementosNoEncontrados = /Unable to find (.+)/g;
    const patronActWarnings = /not wrapped in act/g;
    const patronSupabaseErrors = /Cannot read properties.*supabase/g;

    let coincidencia;

    // Extraer archivos de test fallidos
    while ((coincidencia = patronTestsFallidos.exec(stdout)) !== null) {
      const [, archivoTest, totalTests, testsFallidos] = coincidencia;
      this.resultadosTests.set(archivoTest, {
        estado: 'fallido',
        totalTests: parseInt(totalTests),
        testsFallidos: parseInt(testsFallidos),
        testsExitosos: parseInt(totalTests) - parseInt(testsFallidos)
      });
    }

    // Extraer errores específicos
    this.extraerErroresEspecificos(stdout, stderr);

    // Almacenar salida completa (limitada)
    this.salidaCompleta = {
      stdout: stdout.substring(0, 15000), // Limitar para evitar archivos enormes
      stderr: stderr.substring(0, 5000),
      codigoSalida
    };

    console.log(`📈 Archivos con tests fallidos: ${this.resultadosTests.size}`);
    console.log(`🔍 Patrones de error identificados: ${this.patronesError.length}`);
  }

  /**
   * Extrae errores específicos de la salida
   */
  extraerErroresEspecificos(stdout, stderr) {
    const errores = new Map();

    // Errores de aserción
    const erroresAsercion = [...stdout.matchAll(/AssertionError: (.+)/g)];
    if (erroresAsercion.length > 0) {
      errores.set('Errores de Aserción', erroresAsercion.map(m => m[1]));
      this.patronesError.push({
        tipo: 'Errores de Aserción',
        cantidad: erroresAsercion.length,
        descripcion: 'Fallos en las validaciones de tests',
        solucion: 'Revisar las condiciones esperadas vs actuales'
      });
    }

    // Errores de Supabase
    const erroresSupabase = [...stdout.matchAll(/Cannot read properties.*supabase/g)];
    if (erroresSupabase.length > 0) {
      errores.set('Errores de Supabase Mock', erroresSupabase.map(m => m[0]));
      this.patronesError.push({
        tipo: 'Errores de Supabase Mock',
        cantidad: erroresSupabase.length,
        descripcion: 'Métodos faltantes en mocks de Supabase',
        solucion: 'Implementar métodos faltantes (.eq, .select, .from, etc.)'
      });
    }

    // Warnings de React act()
    const warningsAct = [...stdout.matchAll(/not wrapped in act/g)];
    if (warningsAct.length > 0) {
      errores.set('Warnings de React Act', warningsAct.map(m => m[0]));
      this.patronesError.push({
        tipo: 'Warnings de React Act',
        cantidad: warningsAct.length,
        descripcion: 'Actualizaciones de estado no envueltas en act()',
        solucion: 'Envolver actualizaciones de estado en act(() => { ... })'
      });
    }

    // Elementos no encontrados
    const elementosNoEncontrados = [...stdout.matchAll(/Unable to find (.+)/g)];
    if (elementosNoEncontrados.length > 0) {
      errores.set('Elementos No Encontrados', elementosNoEncontrados.map(m => m[1]));
      this.patronesError.push({
        tipo: 'Elementos No Encontrados',
        cantidad: elementosNoEncontrados.length,
        descripcion: 'Elementos DOM no encontrados en tests',
        solucion: 'Verificar que los elementos esperados se rendericen correctamente'
      });
    }

    // Timeouts
    const timeouts = [...stdout.matchAll(/Test timed out in (\d+)ms/g)];
    if (timeouts.length > 0) {
      errores.set('Timeouts de Tests', timeouts.map(m => `Timeout en ${m[1]}ms`));
      this.patronesError.push({
        tipo: 'Timeouts de Tests',
        cantidad: timeouts.length,
        descripcion: 'Tests que exceden el tiempo límite',
        solucion: 'Optimizar mocks para resolver promesas más rápido'
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
    
    let reporte = `# 🔍 Reporte Detallado de Tests Fallidos\n\n`;
    reporte += `**Generado:** ${horaFin.toLocaleString('es-MX')}\n`;
    reporte += `**Duración del análisis:** ${duracion} segundos\n`;
    reporte += `**Sistema:** Node.js en Windows\n`;
    reporte += `**Comando ejecutado:** \`npx vitest run --reporter=verbose --no-coverage\`\n\n`;

    // Resumen ejecutivo
    reporte += this.generarResumenEjecutivo();

    // Archivos de test fallidos
    if (this.resultadosTests.size > 0) {
      reporte += this.generarSeccionTestsFallidos();
    }

    // Análisis de errores específicos
    if (this.erroresDetallados.size > 0) {
      reporte += this.generarSeccionErroresEspecificos();
    }

    // Patrones de error identificados
    if (this.patronesError.length > 0) {
      reporte += this.generarSeccionPatronesError();
    }

    // Salida completa
    reporte += this.generarSeccionSalidaCompleta();

    // Plan de acción
    reporte += this.generarPlanAccion();

    // Comandos útiles
    reporte += this.generarComandosUtiles();

    // Metadata final
    reporte += `\n---\n`;
    reporte += `*Reporte generado automáticamente por DepuradorTestsMX*\n`;
    reporte += `*Fecha: ${horaFin.toISOString()}*\n`;
    reporte += `*Duración: ${duracion} segundos*\n`;

    // Escribir archivo
    const rutaReporte = path.join(process.cwd(), 'REPORTE_TESTS_FALLIDOS_MX.md');
    fs.writeFileSync(rutaReporte, reporte, 'utf8');
    
    return rutaReporte;
  }

  /**
   * Genera la sección de resumen ejecutivo
   */
  generarResumenEjecutivo() {
    const totalArchivos = this.resultadosTests.size;
    const totalErrores = Array.from(this.erroresDetallados.values())
      .reduce((suma, arr) => suma + arr.length, 0);
    
    let resumen = `## 📋 Resumen Ejecutivo\n\n`;
    resumen += `| Métrica | Valor |\n`;
    resumen += `|---------|-------|\n`;
    resumen += `| Archivos de test con fallos | ${totalArchivos} |\n`;
    resumen += `| Total de errores capturados | ${totalErrores} |\n`;
    resumen += `| Patrones de error identificados | ${this.patronesError.length} |\n`;
    resumen += `| Código de salida | ${this.salidaCompleta?.codigoSalida || 'N/A'} |\n\n`;

    return resumen;
  }

  /**
   * Genera la sección de tests fallidos
   */
  generarSeccionTestsFallidos() {
    let seccion = `## 📁 Archivos de Test Fallidos\n\n`;
    
    for (const [archivoTest, resultado] of this.resultadosTests) {
      const tasaExito = Math.round((resultado.testsExitosos / resultado.totalTests) * 100);
      
      seccion += `### 🔴 ${archivoTest}\n\n`;
      seccion += `| Métrica | Valor |\n`;
      seccion += `|---------|-------|\n`;
      seccion += `| Tests totales | ${resultado.totalTests} |\n`;
      seccion += `| Tests fallidos | ${resultado.testsFallidos} |\n`;
      seccion += `| Tests exitosos | ${resultado.testsExitosos} |\n`;
      seccion += `| Tasa de éxito | ${tasaExito}% |\n\n`;
    }

    return seccion;
  }

  /**
   * Genera la sección de errores específicos
   */
  generarSeccionErroresEspecificos() {
    let seccion = `## ⚠️ Errores Específicos Detectados\n\n`;
    
    for (const [tipoError, errores] of this.erroresDetallados) {
      seccion += `### ${tipoError}\n\n`;
      seccion += `**Cantidad:** ${errores.length} errores\n\n`;
      
      errores.slice(0, 10).forEach((error, indice) => {
        seccion += `${indice + 1}. \`${error}\`\n`;
      });
      
      if (errores.length > 10) {
        seccion += `... y ${errores.length - 10} errores más\n`;
      }
      
      seccion += `\n`;
    }

    return seccion;
  }

  /**
   * Genera la sección de patrones de error
   */
  generarSeccionPatronesError() {
    let seccion = `## 🔍 Patrones de Error Identificados\n\n`;
    
    this.patronesError.forEach((patron, indice) => {
      seccion += `### ${indice + 1}. ${patron.tipo}\n\n`;
      seccion += `- **Ocurrencias:** ${patron.cantidad}\n`;
      seccion += `- **Descripción:** ${patron.descripcion}\n`;
      seccion += `- **Solución sugerida:** ${patron.solucion}\n\n`;
    });

    return seccion;
  }

  /**
   * Genera la sección de salida completa
   */
  generarSeccionSalidaCompleta() {
    let seccion = `## 📝 Salida Completa del Comando\n\n`;
    
    if (this.salidaCompleta?.stderr) {
      seccion += `### Errores del Sistema (stderr)\n\n`;
      seccion += `\`\`\`\n${this.salidaCompleta.stderr}\n\`\`\`\n\n`;
    }
    
    seccion += `### Salida Principal (stdout - últimos 15,000 caracteres)\n\n`;
    seccion += `\`\`\`\n${this.salidaCompleta?.stdout || 'No disponible'}\n\`\`\`\n\n`;

    return seccion;
  }

  /**
   * Genera el plan de acción recomendado
   */
  generarPlanAccion() {
    let plan = `## 🎯 Plan de Acción Recomendado\n\n`;
    
    plan += `### Prioridad Alta 🔥\n\n`;
    plan += `1. **Corregir mocks de Supabase**\n`;
    plan += `   - Implementar métodos faltantes (.from(), .select(), .eq(), .single())\n`;
    plan += `   - Asegurar que las cadenas de métodos funcionen correctamente\n`;
    plan += `   - Verificar que los mocks devuelvan datos con estructura esperada\n\n`;
    
    plan += `2. **Envolver actualizaciones de estado en act()**\n`;
    plan += `   - Identificar componentes que actualizan estado durante tests\n`;
    plan += `   - Envolver renders y eventos en act(() => { ... })\n`;
    plan += `   - Usar waitFor() para operaciones asíncronas\n\n`;
    
    plan += `### Prioridad Media 📋\n\n`;
    plan += `3. **Verificar elementos DOM en tests**\n`;
    plan += `   - Confirmar que los textos y elementos esperados se rendericen\n`;
    plan += `   - Ajustar selectores de elementos si es necesario\n`;
    plan += `   - Considerar usar data-testid para elementos específicos\n\n`;
    
    plan += `4. **Optimizar timeouts de tests**\n`;
    plan += `   - Reducir tiempo de resolución en mocks\n`;
    plan += `   - Simplificar lógica asíncrona innecesaria\n`;
    plan += `   - Aumentar timeout solo si es absolutamente necesario\n\n`;

    return plan;
  }

  /**
   * Genera la sección de comandos útiles
   */
  generarComandosUtiles() {
    let comandos = `## 🛠️ Comandos Útiles para Depuración\n\n`;
    
    comandos += `### Ejecutar test específico\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx vitest run src/tests/unit/[nombre-test].test.ts --reporter=verbose\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Ejecutar test en modo watch\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npx vitest src/tests/unit/[nombre-test].test.ts\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Ejecutar todos los tests\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `npm test\n`;
    comandos += `\`\`\`\n\n`;
    
    comandos += `### Re-ejecutar este análisis\n`;
    comandos += `\`\`\`bash\n`;
    comandos += `node scripts/depurador-tests-mx.cjs\n`;
    comandos += `\`\`\`\n\n`;

    return comandos;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const depurador = new DepuradorTestsMX();
  depurador.ejecutarAnalisisCompleto()
    .then(rutaReporte => {
      console.log(`\n🎉 ¡Análisis completado exitosamente!`);
      console.log(`📄 Reporte disponible en: ${rutaReporte}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error durante el análisis:', error.message);
      process.exit(1);
    });
}

module.exports = DepuradorTestsMX;
