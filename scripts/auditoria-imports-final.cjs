// auditoria-imports-final.cjs - Script CommonJS para auditoría de imports

const fs = require('fs');
const path = require('path');

console.log("🔍 AUDITORÍA DE IMPORTS - ComplicesConecta\n");

// Directorios a excluir
const excludeDirs = ['node_modules', 'android', 'dist', 'build', 'coverage', 'test-results', 'backup'];

// Función para obtener archivos recursivamente
function getFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        // Excluir directorios no deseados
        if (!excludeDirs.some(excludeDir => filePath.includes(excludeDir))) {
          results = results.concat(getFiles(filePath, extensions));
        }
      } else {
        // Incluir solo archivos con extensiones deseadas
        if (extensions.some(ext => file.endsWith(ext))) {
          results.push(filePath);
        }
      }
    });
  } catch (err) {
    console.log(`Error leyendo directorio ${dir}: ${err.message}`);
  }
  
  return results;
}

// Función para analizar imports en un archivo
function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    const brokenImports = [];
    
    // Regex para detectar imports
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      imports.push(importPath);
      
      // Verificar si es ruta relativa y existe
      if (importPath.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const possibleFiles = [
          resolvedPath,
          resolvedPath + '.ts',
          resolvedPath + '.tsx',
          resolvedPath + '.js',
          resolvedPath + '.jsx',
          path.join(resolvedPath, 'index.ts'),
          path.join(resolvedPath, 'index.tsx'),
          path.join(resolvedPath, 'index.js'),
          path.join(resolvedPath, 'index.jsx')
        ];
        
        const exists = possibleFiles.some(file => {
          try {
            return fs.existsSync(file);
          } catch {
            return false;
          }
        });
        
        if (!exists) {
          brokenImports.push(importPath);
        }
      }
    }
    
    return { imports, brokenImports };
  } catch (err) {
    return { imports: [], brokenImports: [] };
  }
}

// Ejecutar auditoría
const files = getFiles('./src');
console.log(`📊 Total de archivos a analizar: ${files.length}\n`);

let totalBrokenImports = 0;
let filesWithIssues = [];

files.forEach((file, index) => {
  console.log(`📄 [${index + 1}/${files.length}] ${path.relative('.', file)}`);
  
  const { imports, brokenImports } = analyzeImports(file);
  
  if (brokenImports.length > 0) {
    totalBrokenImports += brokenImports.length;
    filesWithIssues.push({
      file: path.relative('.', file),
      brokenImports
    });
    
    console.log(`  ❌ Imports rotos: ${brokenImports.length}`);
    brokenImports.forEach(imp => console.log(`     • ${imp}`));
  } else {
    console.log(`  ✅ Imports OK (${imports.length} imports)`);
  }
});

console.log("\n📈 RESUMEN FINAL:");
console.log(`   • Archivos analizados: ${files.length}`);
console.log(`   • Archivos con problemas: ${filesWithIssues.length}`);
console.log(`   • Total imports rotos: ${totalBrokenImports}`);

if (filesWithIssues.length > 0) {
  console.log("\n❌ ARCHIVOS CON IMPORTS ROTOS:");
  filesWithIssues.forEach(item => {
    console.log(`\n📄 ${item.file}:`);
    item.brokenImports.forEach(imp => console.log(`   • ${imp}`));
  });
} else {
  console.log("\n✅ ¡Todos los imports están correctos!");
}
