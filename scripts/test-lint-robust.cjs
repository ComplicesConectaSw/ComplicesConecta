#!/usr/bin/env node
/**
 * Script robusto para tests de linting
 * Ejecuta ESLint y genera reporte detallado
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, `lint-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

// Asegurar que el directorio de reportes existe
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('🔍 Ejecutando tests robustos de linting...\n');

try {
  // Ejecutar ESLint
  const lintOutput = execSync('npm run lint', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });

  // Analizar resultados
  const lines = lintOutput.split('\n');
  const warnings = lines.filter(line => line.includes('warning')).length;
  const errors = lines.filter(line => line.includes('error') && !line.includes('warning')).length;

  const report = {
    timestamp: new Date().toISOString(),
    status: errors > 0 ? 'failed' : warnings > 0 ? 'warning' : 'success',
    summary: {
      total: warnings + errors,
      warnings,
      errors
    },
    details: {
      output: lintOutput,
      lines: lines.length
    }
  };

  // Guardar reporte
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  
  console.log('✅ Tests de linting completados');
  console.log(`   Warnings: ${warnings}`);
  console.log(`   Errores: ${errors}`);
  console.log(`   Reporte guardado en: ${REPORT_FILE}\n`);

  if (errors > 0) {
    console.error('❌ Se encontraron errores de linting');
    process.exit(1);
  } else if (warnings > 0) {
    console.warn('⚠️  Se encontraron warnings de linting');
    process.exit(0);
  } else {
    console.log('✅ Sin errores ni warnings de linting');
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
  
  console.error('❌ Error ejecutando tests de linting:', error.message);
  console.error(`   Reporte guardado en: ${REPORT_FILE}\n`);
  process.exit(1);
}

