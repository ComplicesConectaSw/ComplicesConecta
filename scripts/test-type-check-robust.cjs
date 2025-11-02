#!/usr/bin/env node
/**
 * Script robusto para tests de type-checking
 * Ejecuta TypeScript compiler y genera reporte detallado
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, `type-check-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

// Asegurar que el directorio de reportes existe
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('🔍 Ejecutando tests robustos de type-checking...\n');

try {
  // Ejecutar TypeScript compiler
  const typeCheckOutput = execSync('npm run type-check', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });

  // Analizar resultados
  const lines = typeCheckOutput.split('\n');
  const errors = lines.filter(line => 
    line.includes('error TS') || 
    line.includes('Type error') ||
    line.includes('Cannot find') ||
    (line.includes('Property') && line.includes('does not exist'))
  ).length;

  const report = {
    timestamp: new Date().toISOString(),
    status: errors > 0 ? 'failed' : 'success',
    summary: {
      total: errors,
      errors
    },
    details: {
      output: typeCheckOutput,
      lines: lines.length
    }
  };

  // Guardar reporte
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  
  console.log('✅ Tests de type-checking completados');
  console.log(`   Errores: ${errors}`);
  console.log(`   Reporte guardado en: ${REPORT_FILE}\n`);

  if (errors > 0) {
    console.error('❌ Se encontraron errores de TypeScript');
    process.exit(1);
  } else {
    console.log('✅ Sin errores de TypeScript');
    process.exit(0);
  }
} catch (error) {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'failed',
    error: error.message,
    output: error.stdout || error.stderr || error.toString()
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  
  console.error('❌ Error ejecutando tests de type-checking:', error.message);
  console.error(`   Reporte guardado en: ${REPORT_FILE}\n`);
  process.exit(1);
}

