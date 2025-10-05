#!/usr/bin/env node

/**
 * 🤖 AUDIT CHECKER AUTOMÁTICO - ComplicesConecta v2.1.2
 * 
 * Script para validar automáticamente el estado del proyecto
 * basado en el reporte de auditoría JSON generado.
 * 
 * Uso: node scripts/audit-checker.js
 * CI/CD: npm run audit:check
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadAuditReport() {
  const reportPath = path.join(__dirname, '../reports/full_audit.json');
  
  if (!fs.existsSync(reportPath)) {
    log('❌ ERROR: Reporte de auditoría no encontrado en reports/full_audit.json', 'red');
    process.exit(1);
  }
  
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    return JSON.parse(reportContent);
  } catch (error) {
    log(`❌ ERROR: No se pudo parsear el reporte de auditoría: ${error.message}`, 'red');
    process.exit(1);
  }
}

function checkCriticalIssues(report) {
  log('\n🔍 VERIFICANDO ERRORES CRÍTICOS...', 'blue');
  
  const criticalIssues = report.critical_issues || [];
  
  if (criticalIssues.length === 0) {
    log('✅ Sin errores críticos detectados', 'green');
    return true;
  }
  
  log(`🚨 ${criticalIssues.length} error(es) crítico(s) encontrado(s):`, 'red');
  
  criticalIssues.forEach((issue, index) => {
    log(`\n${index + 1}. ${issue.issue}`, 'red');
    log(`   📁 Archivo: ${issue.file}`, 'yellow');
    log(`   📋 Descripción: ${issue.description}`, 'yellow');
    log(`   🔧 Solución: ${issue.solution}`, 'yellow');
  });
  
  return false;
}

function checkOverallScore(report) {
  log('\n📊 VERIFICANDO PUNTUACIÓN GLOBAL...', 'blue');
  
  const score = report.overall_score.total;
  const threshold = report.automation.ci_cd_alerts.critical_threshold;
  
  if (score >= threshold) {
    log(`✅ Puntuación: ${score}/100 (≥ ${threshold})`, 'green');
    return true;
  } else {
    log(`❌ Puntuación: ${score}/100 (< ${threshold})`, 'red');
    log('🚨 ALERTA: Puntuación por debajo del umbral crítico', 'red');
    return false;
  }
}

function checkChecklist(report) {
  log('\n📋 VERIFICANDO CHECKLIST AUTOMÁTICA...', 'blue');
  
  const checklist = report.checklist_dashboard;
  let totalItems = 0;
  let passedItems = 0;
  let failedItems = [];
  
  Object.keys(checklist).forEach(category => {
    const items = checklist[category];
    Object.keys(items).forEach(item => {
      totalItems++;
      const status = items[item];
      
      if (status === '✅') {
        passedItems++;
      } else if (status === '❌') {
        failedItems.push(`${category}.${item}`);
      }
      // ⚠️ se cuenta como warning, no fallo crítico
    });
  });
  
  const passRate = (passedItems / totalItems * 100).toFixed(1);
  
  if (failedItems.length === 0) {
    log(`✅ Checklist: ${passedItems}/${totalItems} items (${passRate}%)`, 'green');
    return true;
  } else {
    log(`❌ Checklist: ${passedItems}/${totalItems} items (${passRate}%)`, 'red');
    log('🚨 Items fallidos:', 'red');
    failedItems.forEach(item => {
      log(`   - ${item}`, 'yellow');
    });
    return false;
  }
}

function generateSummary(report, checks) {
  log('\n📈 RESUMEN DE VALIDACIÓN', 'bold');
  log('='.repeat(50), 'blue');
  
  const { criticalOk, scoreOk, checklistOk } = checks;
  const allPassed = criticalOk && scoreOk && checklistOk;
  
  log(`📅 Fecha auditoría: ${report.audit_metadata.audit_date}`, 'blue');
  log(`🏷️  Versión: ${report.audit_metadata.version}`, 'blue');
  log(`📊 Puntuación: ${report.overall_score.total}/100`, allPassed ? 'green' : 'red');
  log(`🚨 Errores críticos: ${report.critical_issues.length}`, report.critical_issues.length === 0 ? 'green' : 'red');
  log(`⚠️  Warnings: ${report.warnings.length}`, 'yellow');
  
  if (allPassed) {
    log('\n🎉 VALIDACIÓN EXITOSA - PROYECTO LISTO', 'green');
    log('✅ Todos los checks automáticos pasaron', 'green');
  } else {
    log('\n💥 VALIDACIÓN FALLIDA - REQUIERE ATENCIÓN', 'red');
    log('❌ Algunos checks críticos fallaron', 'red');
  }
  
  return allPassed;
}

function main() {
  log('🤖 AUDIT CHECKER - ComplicesConecta v2.1.2', 'bold');
  log('='.repeat(50), 'blue');
  
  const report = loadAuditReport();
  
  const checks = {
    criticalOk: checkCriticalIssues(report),
    scoreOk: checkOverallScore(report),
    checklistOk: checkChecklist(report)
  };
  
  const success = generateSummary(report, checks);
  
  // Exit code para CI/CD
  process.exit(success ? 0 : 1);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { loadAuditReport, checkCriticalIssues, checkOverallScore, checkChecklist };
