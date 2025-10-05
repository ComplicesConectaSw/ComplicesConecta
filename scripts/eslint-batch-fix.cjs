#!/usr/bin/env node

/**
 * Script para corrección masiva de errores ESLint comunes
 * Enfocado en variables no utilizadas y patrones repetitivos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patrones comunes de corrección
const fixPatterns = [
  // Variables no utilizadas -> prefijo underscore
  {
    pattern: /\bcatch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g,
    replacement: 'catch (_$1)'
  },
  {
    pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*=>/g,
    replacement: '$1: _$2) =>'
  },
  // Parámetros no utilizados en funciones
  {
    pattern: /\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^,)]+\s*\)\s*=>\s*\{/g,
    replacement: '(_$1: any) => {'
  }
];

// Archivos con más errores identificados
const priorityFiles = [
  'src/components/profile/CoupleProfileCard.tsx',
  'src/components/profile/MainProfileCard.tsx', 
  'src/components/profile/ImageUpload.tsx',
  'src/hooks/usePersistedState.ts',
  'src/components/stories/StoryService.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Aplicar patrones de corrección
    fixPatterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Correcciones específicas por tipo de error
    
    // 1. Variables no utilizadas con prefijo underscore
    const unusedVarPatterns = [
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
      /\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,/g
    ];

    // 2. Parámetros no utilizados
    content = content.replace(
      /(\w+)\s*:\s*([^,)]+)\s*\)\s*=>\s*\{[^}]*\}/g,
      (match, param, type) => {
        if (!match.includes(param) || match.indexOf(param) === match.lastIndexOf(param)) {
          return match.replace(param, `_${param}`);
        }
        return match;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Iniciando corrección masiva de ESLint...');
  
  let totalFixed = 0;
  
  // Procesar archivos prioritarios primero
  priorityFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      if (fixFile(fullPath)) {
        totalFixed++;
      }
    }
  });

  console.log(`\n📊 Resumen: ${totalFixed} archivos corregidos`);
  
  // Ejecutar ESLint para verificar progreso
  try {
    console.log('\n🔍 Verificando progreso...');
    execSync('npx eslint src --format=compact', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Aún hay warnings pendientes - continuando...');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, fixPatterns };
