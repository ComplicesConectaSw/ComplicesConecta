#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analiza el bundle para identificar dependencias pesadas y optimizaciones
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const BUNDLE_ANALYZER_THRESHOLD = 100; // KB

console.log('🔍 Analizando bundle...');

try {
  // Generar reporte de bundle
  console.log('📊 Generando estadísticas de build...');
  execSync('npm run build -- --mode=production', { stdio: 'inherit' });
  
  // Analizar archivos generados
  const distPath = join(process.cwd(), 'dist');
  const jsFiles = execSync('find dist/assets/js -name "*.js" -type f', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  const analysis = {
    timestamp: new Date().toISOString(),
    totalFiles: jsFiles.length,
    files: [],
    recommendations: []
  };
  
  console.log('📁 Analizando archivos JS...');
  
  for (const file of jsFiles) {
    const stats = execSync(`stat -c%s "${file}"`, { encoding: 'utf8' });
    const sizeBytes = parseInt(stats.trim());
    const sizeKB = Math.round(sizeBytes / 1024);
    
    const fileName = file.split('/').pop();
    
    analysis.files.push({
      name: fileName,
      path: file,
      sizeBytes,
      sizeKB,
      isLarge: sizeKB > BUNDLE_ANALYZER_THRESHOLD
    });
    
    if (sizeKB > BUNDLE_ANALYZER_THRESHOLD) {
      console.log(`⚠️  Archivo grande detectado: ${fileName} (${sizeKB}KB)`);
    }
  }
  
  // Ordenar por tamaño
  analysis.files.sort((a, b) => b.sizeBytes - a.sizeBytes);
  
  // Generar recomendaciones
  const largeFiles = analysis.files.filter(f => f.isLarge);
  
  if (largeFiles.length > 0) {
    analysis.recommendations.push({
      type: 'code-splitting',
      message: `${largeFiles.length} archivos exceden ${BUNDLE_ANALYZER_THRESHOLD}KB`,
      files: largeFiles.map(f => f.name)
    });
  }
  
  // Detectar dependencias pesadas
  const vendorFiles = analysis.files.filter(f => f.name.includes('vendor'));
  const heavyVendors = vendorFiles.filter(f => f.sizeKB > 200);
  
  if (heavyVendors.length > 0) {
    analysis.recommendations.push({
      type: 'vendor-optimization',
      message: 'Dependencias vendor pesadas detectadas',
      files: heavyVendors.map(f => f.name)
    });
  }
  
  // Guardar análisis
  const reportPath = join(process.cwd(), 'bundle-analysis.json');
  writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  
  console.log('\n📋 Resumen del análisis:');
  console.log(`📦 Total de archivos JS: ${analysis.totalFiles}`);
  console.log(`📏 Archivo más grande: ${analysis.files[0]?.name} (${analysis.files[0]?.sizeKB}KB)`);
  console.log(`⚠️  Archivos grandes (>${BUNDLE_ANALYZER_THRESHOLD}KB): ${largeFiles.length}`);
  console.log(`💡 Recomendaciones: ${analysis.recommendations.length}`);
  
  if (analysis.recommendations.length > 0) {
    console.log('\n🎯 Recomendaciones:');
    analysis.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.type}: ${rec.message}`);
      if (rec.files) {
        rec.files.forEach(file => console.log(`   - ${file}`));
      }
    });
  }
  
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);
  
} catch (error) {
  console.error('❌ Error analizando bundle:', error.message);
  process.exit(1);
}
