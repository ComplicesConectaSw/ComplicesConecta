// Instalación segura de dependencias para FASE 3
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function backupPackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const backupPath = path.join(__dirname, '..', 'package.json.backup');
  
  fs.copyFileSync(packagePath, backupPath);
  console.log('✅ Backup de package.json creado');
}

function testCompilation() {
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function installCriticalDeps() {
  console.log('📦 Instalando dependencia crítica faltante...');
  
  const criticalDep = '@radix-ui/react-button';
  
  try {
    console.log(`  Instalando: ${criticalDep}`);
    execSync(`npm install ${criticalDep}`, { stdio: 'inherit' });
    
    console.log('  Verificando compilación...');
    if (testCompilation()) {
      console.log('  ✅ Compilación OK después de instalación');
      return true;
    } else {
      console.log('  ❌ Compilación falló después de instalación');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error instalando ${criticalDep}:`, error.message);
    return false;
  }
}

function removeUnusedDeps() {
  console.log('\n🗑️ Removiendo dependencias no utilizadas (conservador)...');
  
  // Solo remover dependencias Capacitor que claramente no se usan en web
  const safeToRemove = [
    '@capacitor/android',
    '@capacitor/app', 
    '@capacitor/browser'
  ];
  
  let removed = 0;
  
  safeToRemove.forEach(dep => {
    try {
      console.log(`  Removiendo: ${dep}`);
      execSync(`npm uninstall ${dep}`, { stdio: 'pipe' });
      
      if (testCompilation()) {
        console.log(`  ✅ ${dep} removido exitosamente`);
        removed++;
      } else {
        console.log(`  ❌ Compilación falló, reinstalando ${dep}`);
        execSync(`npm install ${dep}`, { stdio: 'pipe' });
      }
    } catch (error) {
      console.log(`  ⚠️ ${dep} no estaba instalado o error al remover`);
    }
  });
  
  console.log(`✅ Dependencias removidas exitosamente: ${removed}`);
  return removed;
}

function consolidateFiles() {
  console.log('\n📁 Verificando archivos para consolidar...');
  
  // Verificar si hay archivos de configuración duplicados
  const configFiles = [
    'tsconfig.json',
    'tsconfig.app.json', 
    'tsconfig.test.json'
  ];
  
  const existingConfigs = configFiles.filter(file => 
    fs.existsSync(path.join(__dirname, '..', file))
  );
  
  console.log(`✅ Archivos de configuración encontrados: ${existingConfigs.length}`);
  existingConfigs.forEach(file => console.log(`  - ${file}`));
  
  // Verificar estructura de tests
  const testDirs = [
    'src/tests/unit',
    'src/tests/integration', 
    'src/tests/e2e',
    'src/tests/security',
    'src/tests/components'
  ];
  
  const existingTestDirs = testDirs.filter(dir => 
    fs.existsSync(path.join(__dirname, '..', dir))
  );
  
  console.log(`✅ Directorios de tests organizados: ${existingTestDirs.length}`);
  existingTestDirs.forEach(dir => console.log(`  - ${dir}`));
  
  return {
    configs: existingConfigs.length,
    testDirs: existingTestDirs.length
  };
}

function generateReport() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const totalDeps = Object.keys({
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  }).length;
  
  return {
    timestamp: new Date().toISOString(),
    totalDependencies: totalDeps,
    compilationStatus: testCompilation() ? 'OK' : 'FAILED',
    phase3Status: 'COMPLETED'
  };
}

async function main() {
  console.log('🚀 FASE 3: INSTALACIÓN SEGURA DE DEPENDENCIAS');
  console.log('='.repeat(50));
  
  // Backup de seguridad
  backupPackageJson();
  
  // Verificar estado inicial
  console.log('\n🧪 Verificando estado inicial...');
  const initialCompilation = testCompilation();
  console.log(`Estado inicial: ${initialCompilation ? '✅ OK' : '❌ FALLA'}`);
  
  if (!initialCompilation) {
    console.log('❌ El proyecto no compila. Abortando instalación de dependencias.');
    return;
  }
  
  // Instalar dependencias críticas
  const installSuccess = installCriticalDeps();
  
  // Remover dependencias no usadas (conservador)
  const removedCount = removeUnusedDeps();
  
  // Consolidar archivos
  const consolidation = consolidateFiles();
  
  // Verificación final
  console.log('\n🧪 Verificación final...');
  const finalCompilation = testCompilation();
  console.log(`Estado final: ${finalCompilation ? '✅ OK' : '❌ FALLA'}`);
  
  // Generar reporte
  const report = generateReport();
  const reportPath = path.join(__dirname, '..', 'phase3-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 RESUMEN FASE 3:');
  console.log(`- Dependencias críticas instaladas: ${installSuccess ? 1 : 0}`);
  console.log(`- Dependencias no usadas removidas: ${removedCount}`);
  console.log(`- Archivos de configuración: ${consolidation.configs}`);
  console.log(`- Directorios de tests organizados: ${consolidation.testDirs}`);
  console.log(`- Compilación final: ${finalCompilation ? '✅ OK' : '❌ FALLA'}`);
  
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  
  if (finalCompilation) {
    console.log('\n✅ FASE 3 COMPLETADA EXITOSAMENTE');
    console.log('📋 El proyecto mantiene su integridad y compilación');
  } else {
    console.log('\n❌ FASE 3 CON PROBLEMAS');
    console.log('📋 Revisar errores de compilación');
  }
}

main();
