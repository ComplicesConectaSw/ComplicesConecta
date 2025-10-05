#!/usr/bin/env node

/**
 * Analizador de warnings ESLint restantes
 * Genera reporte detallado y prioriza correcciones
 */

const fs = require('fs');
const path = require('path');

function analyzeLintResults() {
  try {
    const lintData = JSON.parse(fs.readFileSync('lint-progress.json', 'utf8'));
    
    const warningsByType = {};
    const warningsByFile = {};
    let totalWarnings = 0;

    lintData.forEach(fileResult => {
      const fileName = path.relative(process.cwd(), fileResult.filePath);
      
      if (fileResult.messages.length > 0) {
        warningsByFile[fileName] = fileResult.messages.length;
        
        fileResult.messages.forEach(message => {
          if (message.severity === 1) { // warnings
            totalWarnings++;
            const ruleId = message.ruleId || 'unknown';
            
            if (!warningsByType[ruleId]) {
              warningsByType[ruleId] = {
                count: 0,
                files: new Set(),
                examples: []
              };
            }
            
            warningsByType[ruleId].count++;
            warningsByType[ruleId].files.add(fileName);
            
            if (warningsByType[ruleId].examples.length < 3) {
              warningsByType[ruleId].examples.push({
                file: fileName,
                line: message.line,
                message: message.message
              });
            }
          }
        });
      }
    });

    // Ordenar por frecuencia
    const sortedByType = Object.entries(warningsByType)
      .sort(([,a], [,b]) => b.count - a.count);

    const sortedByFile = Object.entries(warningsByFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 archivos

    console.log('🔍 ANÁLISIS DE WARNINGS ESLint RESTANTES');
    console.log('=' .repeat(50));
    console.log(`📊 Total de warnings: ${totalWarnings}`);
    console.log(`📁 Archivos afectados: ${Object.keys(warningsByFile).length}`);
    console.log('');

    console.log('🏆 TOP REGLAS MÁS FRECUENTES:');
    console.log('-'.repeat(40));
    sortedByType.slice(0, 8).forEach(([rule, data], index) => {
      console.log(`${index + 1}. ${rule}: ${data.count} warnings`);
      console.log(`   Archivos: ${data.files.size}`);
      if (data.examples.length > 0) {
        console.log(`   Ejemplo: ${data.examples[0].file}:${data.examples[0].line}`);
        console.log(`   "${data.examples[0].message}"`);
      }
      console.log('');
    });

    console.log('📁 ARCHIVOS CON MÁS WARNINGS:');
    console.log('-'.repeat(40));
    sortedByFile.forEach(([file, count], index) => {
      console.log(`${index + 1}. ${file}: ${count} warnings`);
    });

    // Generar plan de corrección
    console.log('\n🎯 PLAN DE CORRECCIÓN RECOMENDADO:');
    console.log('-'.repeat(40));
    
    const priorities = [
      'unused-imports/no-unused-vars',
      'unused-imports/no-unused-imports', 
      '@typescript-eslint/no-explicit-any',
      'react-hooks/exhaustive-deps',
      '@typescript-eslint/no-unused-vars'
    ];

    priorities.forEach((rule, index) => {
      if (warningsByType[rule]) {
        console.log(`${index + 1}. Corregir ${rule} (${warningsByType[rule].count} casos)`);
        console.log(`   Archivos afectados: ${warningsByType[rule].files.size}`);
      }
    });

    return {
      totalWarnings,
      warningsByType: sortedByType,
      warningsByFile: sortedByFile,
      topFiles: sortedByFile.slice(0, 5).map(([file]) => file)
    };

  } catch (error) {
    console.error('❌ Error analizando resultados:', error.message);
    return null;
  }
}

if (require.main === module) {
  analyzeLintResults();
}

module.exports = { analyzeLintResults };
