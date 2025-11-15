// Análisis completo del proyecto directorio por directorio
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios a excluir
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'android',
  'ios',
  'dist',
  'build',
  '.vite',
  'coverage',
  '.next',
  '.nuxt',
  'bck',
  'artifacts'
];

// Extensiones de archivos a analizar
const ANALYZED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];

function shouldAnalyzeDirectory(dirName) {
  return !EXCLUDED_DIRS.includes(dirName) && !dirName.startsWith('.');
}

function shouldAnalyzeFile(fileName) {
  const ext = path.extname(fileName);
  return ANALYZED_EXTENSIONS.includes(ext);
}

function analyzeDirectory(dirPath, relativePath = '') {
  const results = {
    path: relativePath || '/',
    files: [],
    subdirectories: [],
    errors: [],
    warnings: [],
    totalFiles: 0,
    totalErrors: 0,
    totalWarnings: 0
  };

  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (shouldAnalyzeDirectory(item)) {
          const subResult = analyzeDirectory(fullPath, itemRelativePath);
          results.subdirectories.push(subResult);
          results.totalFiles += subResult.totalFiles;
          results.totalErrors += subResult.totalErrors;
          results.totalWarnings += subResult.totalWarnings;
        }
      } else if (stat.isFile() && shouldAnalyzeFile(item)) {
        const fileAnalysis = analyzeFile(fullPath, itemRelativePath);
        results.files.push(fileAnalysis);
        results.totalFiles++;
        results.totalErrors += fileAnalysis.errors.length;
        results.totalWarnings += fileAnalysis.warnings.length;
      }
    }
  } catch (error) {
    results.errors.push({
      type: 'directory_access',
      message: `Error accessing directory: ${error.message}`,
      file: relativePath
    });
  }

  return results;
}

function analyzeFile(filePath, relativePath) {
  const result = {
    path: relativePath,
    size: 0,
    lines: 0,
    errors: [],
    warnings: [],
    issues: []
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const stat = fs.statSync(filePath);
    
    result.size = Math.round(stat.size / 1024); // KB
    result.lines = content.split('\n').length;

    // Análisis de patrones problemáticos
    analyzeCodePatterns(content, result, relativePath);
    
  } catch (error) {
    result.errors.push({
      type: 'file_read',
      message: `Error reading file: ${error.message}`,
      line: 0
    });
  }

  return result;
}

function analyzeCodePatterns(content, result, filePath) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Detectar 'as any'
    if (trimmedLine.includes('as any')) {
      result.warnings.push({
        type: 'as_any_usage',
        message: "Usage of 'as any' - consider more specific typing",
        line: lineNum,
        code: trimmedLine.substring(0, 100)
      });
    }
    
    // Detectar console.log en producción
    if (trimmedLine.includes('console.log') && !filePath.includes('test') && !filePath.includes('spec')) {
      result.warnings.push({
        type: 'console_log',
        message: 'console.log found in production code',
        line: lineNum,
        code: trimmedLine.substring(0, 100)
      });
    }
    
    // Detectar TODO/FIXME
    if (trimmedLine.includes('TODO') || trimmedLine.includes('FIXME')) {
      result.issues.push({
        type: 'todo_fixme',
        message: 'TODO/FIXME comment found',
        line: lineNum,
        code: trimmedLine.substring(0, 100)
      });
    }
    
    // Detectar imports problemáticos
    if (trimmedLine.startsWith('import') && trimmedLine.includes('../../../')) {
      result.warnings.push({
        type: 'deep_import',
        message: 'Deep relative import - consider using absolute imports',
        line: lineNum,
        code: trimmedLine.substring(0, 100)
      });
    }
    
    // Detectar funciones muy largas (más de 50 líneas)
    if (trimmedLine.includes('function ') || trimmedLine.includes('const ') && trimmedLine.includes(' => ')) {
      // Contar líneas hasta la siguiente función
      let functionLines = 0;
      for (let i = index + 1; i < lines.length && functionLines < 60; i++) {
        functionLines++;
        if (lines[i].trim().startsWith('function ') || 
            lines[i].trim().startsWith('const ') && lines[i].includes(' => ')) {
          break;
        }
      }
      
      if (functionLines > 50) {
        result.warnings.push({
          type: 'long_function',
          message: `Function appears to be very long (${functionLines}+ lines)`,
          line: lineNum,
          code: trimmedLine.substring(0, 100)
        });
      }
    }
    
    // Detectar archivos muy grandes
    if (result.lines > 500) {
      result.warnings.push({
        type: 'large_file',
        message: `File is very large (${result.lines} lines) - consider splitting`,
        line: 1,
        code: 'File size warning'
      });
    }
  });
}

function runESLintAnalysis() {
  console.log('🔍 Ejecutando análisis ESLint...');
  
  try {
    const eslintOutput = execSync('npx eslint . --format json', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    
    const eslintResults = JSON.parse(eslintOutput);
    return eslintResults;
  } catch (error) {
    // ESLint devuelve código de salida != 0 cuando encuentra errores
    if (error.stdout) {
      try {
        const eslintResults = JSON.parse(error.stdout);
        return eslintResults;
      } catch (parseError) {
        console.log('⚠️ Error parsing ESLint output');
        return [];
      }
    }
    console.log('⚠️ Error ejecutando ESLint:', error.message);
    return [];
  }
}

function generateReport(analysis, eslintResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDirectories: countDirectories(analysis),
      totalFiles: analysis.totalFiles,
      totalErrors: analysis.totalErrors,
      totalWarnings: analysis.totalWarnings,
      eslintIssues: eslintResults.reduce((sum, file) => sum + file.messages.length, 0)
    },
    analysis,
    eslintResults: eslintResults.filter(file => file.messages.length > 0),
    recommendations: generateRecommendations(analysis, eslintResults)
  };
  
  return report;
}

function countDirectories(analysis) {
  let count = 1; // Current directory
  analysis.subdirectories.forEach(subdir => {
    count += countDirectories(subdir);
  });
  return count;
}

function generateRecommendations(analysis, eslintResults) {
  const recommendations = [];
  
  // Análisis de 'as any'
  const asAnyCount = countIssueType(analysis, 'as_any_usage');
  if (asAnyCount > 10) {
    recommendations.push({
      priority: 'medium',
      type: 'typing',
      message: `Found ${asAnyCount} uses of 'as any' - consider implementing more specific types`,
      action: 'Create proper TypeScript interfaces and types'
    });
  }
  
  // Análisis de console.log
  const consoleLogCount = countIssueType(analysis, 'console_log');
  if (consoleLogCount > 5) {
    recommendations.push({
      priority: 'low',
      type: 'logging',
      message: `Found ${consoleLogCount} console.log statements in production code`,
      action: 'Replace with proper logging service or remove'
    });
  }
  
  // Análisis de archivos grandes
  const largeFileCount = countIssueType(analysis, 'large_file');
  if (largeFileCount > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'architecture',
      message: `Found ${largeFileCount} large files (>500 lines)`,
      action: 'Consider splitting large files into smaller modules'
    });
  }
  
  // Análisis ESLint
  const eslintErrorCount = eslintResults.reduce((sum, file) => 
    sum + file.messages.filter(msg => msg.severity === 2).length, 0);
  
  if (eslintErrorCount > 0) {
    recommendations.push({
      priority: 'high',
      type: 'linting',
      message: `Found ${eslintErrorCount} ESLint errors`,
      action: 'Fix ESLint errors to improve code quality'
    });
  }
  
  return recommendations;
}

function countIssueType(analysis, type) {
  let count = 0;
  
  analysis.files.forEach(file => {
    count += file.warnings.filter(w => w.type === type).length;
  });
  
  analysis.subdirectories.forEach(subdir => {
    count += countIssueType(subdir, type);
  });
  
  return count;
}

function printDetailedReport(report) {
  console.log('\n📊 ANÁLISIS COMPLETO DEL PROYECTO');
  console.log('='.repeat(60));
  
  console.log('\n📈 RESUMEN GENERAL:');
  console.log(`- Directorios analizados: ${report.summary.totalDirectories}`);
  console.log(`- Archivos analizados: ${report.summary.totalFiles}`);
  console.log(`- Errores encontrados: ${report.summary.totalErrors}`);
  console.log(`- Warnings encontrados: ${report.summary.totalWarnings}`);
  console.log(`- Issues ESLint: ${report.summary.eslintIssues}`);
  
  // Mostrar archivos con más problemas
  console.log('\n🔍 ARCHIVOS CON MÁS PROBLEMAS:');
  const problematicFiles = [];
  
  function collectProblematicFiles(analysis, basePath = '') {
    analysis.files.forEach(file => {
      const totalIssues = file.errors.length + file.warnings.length + file.issues.length;
      if (totalIssues > 0) {
        problematicFiles.push({
          path: file.path,
          issues: totalIssues,
          errors: file.errors.length,
          warnings: file.warnings.length,
          size: file.size
        });
      }
    });
    
    analysis.subdirectories.forEach(subdir => {
      collectProblematicFiles(subdir, basePath);
    });
  }
  
  collectProblematicFiles(report.analysis);
  
  problematicFiles
    .sort((a, b) => b.issues - a.issues)
    .slice(0, 10)
    .forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Issues: ${file.issues} | Errors: ${file.errors} | Warnings: ${file.warnings} | Size: ${file.size}KB`);
    });
  
  // Mostrar ESLint issues
  if (report.eslintResults.length > 0) {
    console.log('\n⚠️ ESLINT ISSUES:');
    report.eslintResults.slice(0, 5).forEach(file => {
      console.log(`\n📄 ${file.filePath.replace(process.cwd(), '.')}`);
      file.messages.slice(0, 3).forEach(msg => {
        const severity = msg.severity === 2 ? '❌' : '⚠️';
        console.log(`   ${severity} Line ${msg.line}: ${msg.message}`);
      });
    });
  }
  
  // Mostrar recomendaciones
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    report.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${priority} ${rec.message}`);
      console.log(`   Acción: ${rec.action}`);
    });
  }
}

async function main() {
  console.log('🚀 ANÁLISIS COMPLETO DEL PROYECTO - DIRECTORIO POR DIRECTORIO');
  console.log('Excluyendo: android, node_modules, dependencias');
  console.log('='.repeat(60));
  
  const projectRoot = path.join(__dirname, '..');
  
  // Análisis de estructura
  console.log('📁 Analizando estructura de directorios...');
  const analysis = analyzeDirectory(projectRoot);
  
  // Análisis ESLint
  const eslintResults = runESLintAnalysis();
  
  // Generar reporte
  const report = generateReport(analysis, eslintResults);
  
  // Guardar reporte
  const reportPath = path.join(projectRoot, 'ANALISIS_COMPLETO_PROYECTO.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Mostrar reporte detallado
  printDetailedReport(report);
  
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);
  console.log('\n✅ Análisis completado');
}

main().catch(console.error);
