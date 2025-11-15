// Análisis de performance del proyecto ComplicesConecta
const fs = require('fs');
const path = require('path');

function analyzeFileSize(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = [];
  
  function scanDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          results.push({
            file: path.relative(dirPath, fullPath),
            size: stat.size,
            sizeKB: Math.round(stat.size / 1024 * 100) / 100
          });
        }
      }
    });
  }
  
  scanDirectory(dirPath);
  return results.sort((a, b) => b.size - a.size);
}

function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Buscar imports ES6
    const es6ImportRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6ImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Buscar requires
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    return [];
  }
}

function analyzeBundleSize() {
  const srcPath = path.join(__dirname, '..', 'src');
  const files = analyzeFileSize(srcPath);
  
  console.log("📊 ANÁLISIS DE TAMAÑO DE ARCHIVOS");
  console.log("=".repeat(50));
  
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  console.log(`Total de archivos analizados: ${files.length}`);
  console.log(`Tamaño total: ${Math.round(totalSize / 1024)} KB`);
  
  console.log("\n🔍 ARCHIVOS MÁS GRANDES (Top 10):");
  files.slice(0, 10).forEach((file, i) => {
    console.log(`${i + 1}. ${file.file} - ${file.sizeKB} KB`);
  });
  
  return { files, totalSize };
}

function analyzeComponentComplexity() {
  const componentsPath = path.join(__dirname, '..', 'src', 'components');
  const pagesPath = path.join(__dirname, '..', 'src', 'pages');
  const profilesPath = path.join(__dirname, '..', 'src', 'profiles');
  
  console.log("\n🧩 ANÁLISIS DE COMPLEJIDAD DE COMPONENTES");
  console.log("=".repeat(50));
  
  const paths = [
    { name: 'Components', path: componentsPath },
    { name: 'Pages', path: pagesPath },
    { name: 'Profiles', path: profilesPath }
  ];
  
  const complexity = {};
  
  paths.forEach(({ name, path: dirPath }) => {
    if (fs.existsSync(dirPath)) {
      const files = analyzeFileSize(dirPath, ['.tsx', '.jsx']);
      complexity[name] = {
        count: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        avgSize: files.length > 0 ? Math.round(files.reduce((sum, f) => sum + f.size, 0) / files.length / 1024 * 100) / 100 : 0,
        largest: files[0] || null
      };
      
      console.log(`\n${name}:`);
      console.log(`  - Archivos: ${complexity[name].count}`);
      console.log(`  - Tamaño total: ${Math.round(complexity[name].totalSize / 1024)} KB`);
      console.log(`  - Tamaño promedio: ${complexity[name].avgSize} KB`);
      if (complexity[name].largest) {
        console.log(`  - Archivo más grande: ${complexity[name].largest.file} (${complexity[name].largest.sizeKB} KB)`);
      }
    }
  });
  
  return complexity;
}

function analyzeDependencies() {
  console.log("\n📦 ANÁLISIS DE DEPENDENCIAS");
  console.log("=".repeat(50));
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    console.log(`Dependencias de producción: ${deps.length}`);
    console.log(`Dependencias de desarrollo: ${devDeps.length}`);
    console.log(`Total de dependencias: ${deps.length + devDeps.length}`);
    
    // Analizar dependencias pesadas
    const heavyDeps = [
      '@openzeppelin/contracts',
      'ethers',
      'framer-motion',
      'react',
      'react-dom',
      'supabase',
      'hardhat'
    ];
    
    console.log("\n📋 DEPENDENCIAS PRINCIPALES:");
    heavyDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        console.log(`  - ${dep}: ${version}`);
      }
    });
    
    return { deps, devDeps, packageJson };
  }
  
  return null;
}

function analyzeImportPatterns() {
  console.log("\n🔗 ANÁLISIS DE PATRONES DE IMPORT");
  console.log("=".repeat(50));
  
  const srcPath = path.join(__dirname, '..', 'src');
  const files = analyzeFileSize(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
  
  const importCounts = {};
  const externalImports = new Set();
  const internalImports = new Set();
  
  files.slice(0, 20).forEach(file => { // Analizar solo los primeros 20 archivos más grandes
    const fullPath = path.join(srcPath, file.file);
    const imports = analyzeImports(fullPath);
    
    imports.forEach(imp => {
      importCounts[imp] = (importCounts[imp] || 0) + 1;
      
      if (imp.startsWith('.') || imp.startsWith('@/')) {
        internalImports.add(imp);
      } else {
        externalImports.add(imp);
      }
    });
  });
  
  const sortedImports = Object.entries(importCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  console.log("📊 IMPORTS MÁS UTILIZADOS:");
  sortedImports.forEach(([imp, count], i) => {
    console.log(`${i + 1}. ${imp} (${count} veces)`);
  });
  
  console.log(`\nImports externos únicos: ${externalImports.size}`);
  console.log(`Imports internos únicos: ${internalImports.size}`);
  
  return { importCounts, externalImports: Array.from(externalImports), internalImports: Array.from(internalImports) };
}

function generateOptimizationRecommendations(analysis) {
  console.log("\n💡 RECOMENDACIONES DE OPTIMIZACIÓN");
  console.log("=".repeat(50));
  
  const recommendations = [];
  
  // Análisis de archivos grandes
  const largeFiles = analysis.files.filter(f => f.sizeKB > 50);
  if (largeFiles.length > 0) {
    recommendations.push({
      type: "Bundle Size",
      priority: "High",
      description: `${largeFiles.length} archivos > 50KB detectados`,
      action: "Considerar code splitting o lazy loading",
      files: largeFiles.slice(0, 3).map(f => f.file)
    });
  }
  
  // Análisis de componentes complejos
  Object.entries(analysis.complexity).forEach(([category, data]) => {
    if (data.avgSize > 30) {
      recommendations.push({
        type: "Component Complexity",
        priority: "Medium",
        description: `${category} tiene componentes grandes (promedio: ${data.avgSize}KB)`,
        action: "Dividir componentes grandes en subcomponentes",
        files: data.largest ? [data.largest.file] : []
      });
    }
  });
  
  // Análisis de dependencias
  if (analysis.dependencies) {
    const totalDeps = analysis.dependencies.deps.length + analysis.dependencies.devDeps.length;
    if (totalDeps > 100) {
      recommendations.push({
        type: "Dependencies",
        priority: "Medium",
        description: `${totalDeps} dependencias totales`,
        action: "Revisar y eliminar dependencias no utilizadas",
        files: []
      });
    }
  }
  
  // Mostrar recomendaciones
  recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. [${rec.priority}] ${rec.type}`);
    console.log(`   Problema: ${rec.description}`);
    console.log(`   Acción: ${rec.action}`);
    if (rec.files.length > 0) {
      console.log(`   Archivos: ${rec.files.join(', ')}`);
    }
  });
  
  return recommendations;
}

async function main() {
  console.log("🚀 ANÁLISIS DE PERFORMANCE - COMPLICESCONECTA v3.6.3");
  console.log("=".repeat(60));
  
  const analysis = {};
  
  // Análisis de tamaño de bundle
  const bundleAnalysis = analyzeBundleSize();
  analysis.files = bundleAnalysis.files;
  analysis.totalSize = bundleAnalysis.totalSize;
  
  // Análisis de complejidad de componentes
  analysis.complexity = analyzeComponentComplexity();
  
  // Análisis de dependencias
  analysis.dependencies = analyzeDependencies();
  
  // Análisis de patrones de import
  analysis.imports = analyzeImportPatterns();
  
  // Generar recomendaciones
  analysis.recommendations = generateOptimizationRecommendations(analysis);
  
  // Guardar reporte
  const reportPath = path.join(__dirname, '..', 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);
  console.log("\n✅ Análisis de performance completado!");
}

main().catch(console.error);
