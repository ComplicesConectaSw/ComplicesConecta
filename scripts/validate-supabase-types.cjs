/**
 * Script de Validación de Tipos de Supabase
 * Compara tipos generados vs esquema real y verifica coherencia
 * 
 * Uso:
 *   node scripts/validate-supabase-types.cjs
 */

const fs = require('fs');
const path = require('path');

function validateSupabaseTypes() {
  console.log('🔍 Validando tipos de Supabase...\n');

  const supabaseTypesPath = path.join(process.cwd(), 'src/types/supabase.ts');
  const supabaseGeneratedPath = path.join(process.cwd(), 'src/types/supabase-generated.ts');

  // Verificar existencia de archivos
  const supabaseExists = fs.existsSync(supabaseTypesPath);
  const generatedExists = fs.existsSync(supabaseGeneratedPath);

  console.log('📁 Archivos de tipos:');
  console.log(`  ${supabaseExists ? '✅' : '❌'} supabase.ts: ${supabaseExists ? 'Existe' : 'No encontrado'}`);
  console.log(`  ${generatedExists ? '✅' : '❌'} supabase-generated.ts: ${generatedExists ? 'Existe' : 'No encontrado'}\n`);

  if (!supabaseExists && !generatedExists) {
    console.log('❌ No se encontraron archivos de tipos de Supabase');
    console.log('👉 Ejecutar: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts\n');
    process.exit(1);
  }

  // Obtener información de archivos
  let supabaseStats = null;
  let generatedStats = null;

  if (supabaseExists) {
    const stats = fs.statSync(supabaseTypesPath);
    supabaseStats = {
      size: stats.size,
      modified: stats.mtime,
      path: supabaseTypesPath
    };
  }

  if (generatedExists) {
    const stats = fs.statSync(supabaseGeneratedPath);
    generatedStats = {
      size: stats.size,
      modified: stats.mtime,
      path: supabaseGeneratedPath
    };
  }

  // Comparar archivos
  console.log('📊 Información de archivos:');
  if (supabaseStats) {
    console.log(`  supabase.ts:`);
    console.log(`    Tamaño: ${(supabaseStats.size / 1024).toFixed(2)} KB`);
    console.log(`    Modificado: ${supabaseStats.modified.toLocaleString()}`);
  }
  if (generatedStats) {
    console.log(`  supabase-generated.ts:`);
    console.log(`    Tamaño: ${(generatedStats.size / 1024).toFixed(2)} KB`);
    console.log(`    Modificado: ${generatedStats.modified.toLocaleString()}`);
  }

  // Verificar cuál es más reciente
  if (supabaseStats && generatedStats) {
    console.log('\n🔄 Comparación:');
    const isGeneratedNewer = generatedStats.modified > supabaseStats.modified;
    console.log(`  ${isGeneratedNewer ? '⚠️' : '✅'} supabase-generated.ts es ${isGeneratedNewer ? 'más reciente' : 'más antiguo'}`);
    console.log(`  ${isGeneratedNewer ? '⚠️' : '✅'} supabase.ts es ${isGeneratedNewer ? 'más antiguo' : 'más reciente'}`);
    
    if (isGeneratedNewer && generatedStats.size > supabaseStats.size * 1.1) {
      console.log('\n⚠️  ADVERTENCIA: supabase-generated.ts es más reciente y significativamente más grande');
      console.log('   Considerar actualizar supabase.ts con el contenido de supabase-generated.ts\n');
    }
  }

  // Leer contenido y buscar tablas principales
  console.log('📋 Análisis de contenido:\n');

  const readTables = (filePath, fileName) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tableMatches = content.match(/Tables:\s*\{([^}]+)\}/g);
      if (tableMatches) {
        const tables = [];
        const tableRegex = /(\w+):\s*\{/g;
        let match;
        while ((match = tableRegex.exec(tableMatches[0])) !== null) {
          tables.push(match[1]);
        }
        return { count: tables.length, tables: tables.slice(0, 10) };
      }
      return { count: 0, tables: [] };
    } catch (error) {
      console.log(`  ❌ Error leyendo ${fileName}: ${error.message}`);
      return { count: 0, tables: [] };
    }
  };

  if (supabaseExists) {
    const supabaseInfo = readTables(supabaseTypesPath, 'supabase.ts');
    console.log(`  supabase.ts:`);
    console.log(`    Tablas encontradas: ${supabaseInfo.count}`);
    if (supabaseInfo.tables.length > 0) {
      console.log(`    Ejemplos: ${supabaseInfo.tables.slice(0, 5).join(', ')}`);
    }
  }

  if (generatedExists) {
    const generatedInfo = readTables(supabaseGeneratedPath, 'supabase-generated.ts');
    console.log(`  supabase-generated.ts:`);
    console.log(`    Tablas encontradas: ${generatedInfo.count}`);
    if (generatedInfo.tables.length > 0) {
      console.log(`    Ejemplos: ${generatedInfo.tables.slice(0, 5).join(', ')}`);
    }
  }

  // Verificar referencias en código
  console.log('\n🔍 Verificando referencias en código:');
  
  const codebasePath = path.join(process.cwd(), 'src');
  const searchInCode = (searchTerm) => {
    try {
      const { execSync } = require('child_process');
      // Cross-platform search
      const isWindows = process.platform === 'win32';
      let command;
      if (isWindows) {
        // PowerShell para Windows
        command = `powershell -Command "Get-ChildItem -Path '${codebasePath}' -Recurse -Include *.ts,*.tsx | Select-String -Pattern '${searchTerm.replace(/'/g, "''")}' | Measure-Object | Select-Object -ExpandProperty Count"`;
      } else {
        command = `grep -r "${searchTerm}" ${codebasePath} --include="*.ts" --include="*.tsx" | wc -l`;
      }
      const result = execSync(command, {
        encoding: 'utf8',
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return parseInt(result.trim()) || 0;
    } catch {
      // Fallback: buscar manualmente
      return searchInCodeManual(searchTerm);
    }
  };

  const searchInCodeManual = (searchTerm) => {
    try {
      const { execSync } = require('child_process');
      const { readdirSync, readFileSync, statSync } = require('fs');
      
      let count = 0;
      const searchDir = (dir) => {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            searchDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            try {
              const content = readFileSync(fullPath, 'utf8');
              if (content.includes(searchTerm)) {
                count++;
              }
            } catch {}
          }
        }
      };
      searchDir(codebasePath);
      return count;
    } catch {
      return 0;
    }
  };

  const supabaseRefs = searchInCode("from '@/types/supabase'");
  const generatedRefs = searchInCode("from '@/types/supabase-generated'");

  console.log(`  Referencias a 'supabase.ts': ${supabaseRefs}`);
  console.log(`  Referencias a 'supabase-generated.ts': ${generatedRefs}`);

  // Recomendaciones
  console.log('\n💡 Recomendaciones:\n');

  if (supabaseStats && generatedStats) {
    if (generatedStats.modified > supabaseStats.modified) {
      console.log('  1. ⚠️  supabase-generated.ts es más reciente');
      console.log('     Considerar sincronizar tipos:');
      console.log('     cp src/types/supabase-generated.ts src/types/supabase.ts');
    }
  }

  if (supabaseRefs > generatedRefs && generatedExists && supabaseExists) {
    console.log('  2. ✅ La mayoría del código usa supabase.ts (archivo principal)');
  } else if (generatedRefs > 0) {
    console.log('  2. ⚠️  Algunos archivos usan supabase-generated.ts');
    console.log('     Considerar consolidar en un solo archivo');
  }

  console.log('\n  3. 📝 Para regenerar tipos desde Supabase:');
  console.log('     npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts');
  console.log('     o');
  console.log('     npx supabase gen types typescript --local > src/types/supabase.ts');

  console.log('\n✅ Validación completada\n');
}

// Ejecutar validación
try {
  validateSupabaseTypes();
  process.exit(0);
} catch (error) {
  console.error('❌ Error ejecutando validación:', error.message);
  process.exit(1);
}

