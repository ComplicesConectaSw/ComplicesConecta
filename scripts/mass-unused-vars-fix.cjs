#!/usr/bin/env node

/**
 * Corrección masiva de variables no utilizadas
 * Enfoque sistemático para los 169 warnings restantes
 */

const fs = require('fs');
const path = require('path');

// Archivos prioritarios basados en el análisis
const priorityFiles = [
  'src/pages/Auth.tsx',
  'src/pages/AdminProduction.tsx', 
  'src/components/stories/StoryService.ts',
  'src/pages/AdminDashboard.tsx',
  'src/components/profile/MainProfileCard.tsx'
];

// Patrones de corrección más específicos
const fixPatterns = [
  // Parámetros de funciones no utilizados
  {
    pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^,)]+\)\s*=>\s*\{/g,
    replacement: '(_$1: any) => {'
  },
  // Variables en destructuring no utilizadas
  {
    pattern: /const\s*\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\s*=/g,
    replacement: 'const { $1: _$1 } ='
  },
  // Variables declaradas no utilizadas
  {
    pattern: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
    replacement: 'const _$1 ='
  },
  // Parámetros en catch no utilizados
  {
    pattern: /catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g,
    replacement: 'catch (_$1)'
  }
];

function fixUnusedVarsInFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Archivo no encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // Aplicar patrones específicos por tipo de archivo
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      
      // Corrección específica para parámetros de eventos no utilizados
      content = content.replace(
        /(\w+)\s*:\s*(React\.)?MouseEvent[^,)]*\)\s*=>\s*\{/g,
        (match, param) => {
          if (!match.includes(`${param}.`) && !match.includes(`${param}[`)) {
            return match.replace(param, `_${param}`);
          }
          return match;
        }
      );

      // Corrección para variables en useState no utilizadas
      content = content.replace(
        /const\s*\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\]\s*=\s*useState/g,
        (match, getter, setter) => {
          // Si el getter no se usa, prefijarlo con _
          const lines = content.split('\n');
          const getterUsed = lines.some(line => 
            line.includes(`${getter}.`) || 
            line.includes(`${getter}[`) || 
            line.includes(`{${getter}}`) ||
            line.includes(`(${getter})`)
          );
          
          if (!getterUsed) {
            return match.replace(getter, `_${getter}`);
          }
          return match;
        }
      );

      // Corrección para imports no utilizados
      content = content.replace(
        /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"][^'"]+['"];?/g,
        (match, imports) => {
          const importList = imports.split(',').map(imp => imp.trim());
          const usedImports = importList.filter(imp => {
            const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
            return content.includes(cleanImp) && content.lastIndexOf(cleanImp) !== content.indexOf(cleanImp);
          });
          
          if (usedImports.length === 0) {
            return ''; // Remover import completamente
          } else if (usedImports.length < importList.length) {
            return match.replace(imports, usedImports.join(', '));
          }
          return match;
        }
      );
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Iniciando corrección masiva de variables no utilizadas...');
  console.log(`📋 Procesando ${priorityFiles.length} archivos prioritarios\n`);
  
  let totalFixed = 0;
  
  priorityFiles.forEach((file, index) => {
    console.log(`[${index + 1}/${priorityFiles.length}] Procesando: ${file}`);
    const fullPath = path.join(process.cwd(), file);
    
    if (fixUnusedVarsInFile(fullPath)) {
      totalFixed++;
    }
  });

  console.log(`\n📊 Resumen:`);
  console.log(`✅ Archivos corregidos: ${totalFixed}/${priorityFiles.length}`);
  
  // Verificar progreso
  console.log('\n🔍 Verificando progreso...');
  try {
    const { execSync } = require('child_process');
    const result = execSync('npx eslint src --format=compact', { encoding: 'utf8' });
    const warningCount = (result.match(/warning/g) || []).length;
    console.log(`⚠️ Warnings restantes: ${warningCount}`);
  } catch (error) {
    console.log('⚠️ Verificación completada - algunos warnings pueden persistir');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixUnusedVarsInFile };
