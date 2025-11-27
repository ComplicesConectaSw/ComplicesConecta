// Análisis de dependencias para FASE 3
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dependencias críticas identificadas en la auditoría
const criticalDeps = [
  // UI/UX críticas
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu', 
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-avatar',
  '@radix-ui/react-button',
  
  // Blockchain críticas
  '@openzeppelin/contracts',
  '@solana/web3.js',
  
  // Testing críticas
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@testing-library/user-event',
  
  // Build críticas
  '@vitejs/plugin-react',
  
  // Types críticas
  '@types/node',
  '@types/react',
  '@types/react-dom'
];

const optionalDeps = [
  // Capacitor (mobile)
  '@capacitor/core',
  '@capacitor/android',
  '@capacitor/ios',
  
  // Analytics
  '@datadog/browser-logs',
  '@sentry/react',
  
  // AI/ML
  '@tensorflow/tfjs',
  '@huggingface/inference'
];

function analyzeCurrentDeps() {
  console.log('📦 Analizando dependencias actuales...');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const currentDeps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  console.log(`✅ Dependencias actuales: ${Object.keys(currentDeps).length}`);
  
  return { packageJson, currentDeps };
}

function checkMissingCritical(currentDeps) {
  console.log('\n🔍 Verificando dependencias críticas faltantes...');
  
  const missing = criticalDeps.filter(dep => !currentDeps[dep]);
  const present = criticalDeps.filter(dep => currentDeps[dep]);
  
  console.log(`✅ Críticas presentes: ${present.length}/${criticalDeps.length}`);
  console.log(`❌ Críticas faltantes: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('\n📋 DEPENDENCIAS CRÍTICAS FALTANTES:');
    missing.forEach(dep => console.log(`  - ${dep}`));
  }
  
  return { missing, present };
}

function checkUnusedDeps(currentDeps) {
  console.log('\n🔍 Escaneando dependencias no utilizadas...');
  
  const srcPath = path.join(__dirname, '..', 'src');
  const unusedDeps = [];
  const usedDeps = [];
  
  // Escanear archivos para ver qué dependencias se usan
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scanDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        Object.keys(currentDeps).forEach(dep => {
          if (content.includes(`from '${dep}'`) || content.includes(`require('${dep}')`)) {
            if (!usedDeps.includes(dep)) {
              usedDeps.push(dep);
            }
          }
        });
      }
    });
  }
  
  try {
    scanDirectory(srcPath);
    
    Object.keys(currentDeps).forEach(dep => {
      if (!usedDeps.includes(dep) && !dep.startsWith('@types/') && !dep.startsWith('eslint')) {
        unusedDeps.push(dep);
      }
    });
    
    console.log(`✅ Dependencias en uso: ${usedDeps.length}`);
    console.log(`⚠️ Posiblemente no usadas: ${unusedDeps.length}`);
    
    if (unusedDeps.length > 0 && unusedDeps.length < 20) {
      console.log('\n📋 POSIBLES DEPENDENCIAS NO USADAS:');
      unusedDeps.slice(0, 10).forEach(dep => console.log(`  - ${dep}`));
      if (unusedDeps.length > 10) {
        console.log(`  ... y ${unusedDeps.length - 10} más`);
      }
    }
    
  } catch (error) {
    console.log('⚠️ Error escaneando dependencias:', error.message);
  }
  
  return { used: usedDeps, unused: unusedDeps };
}

function generateInstallPlan(missing, unused) {
  console.log('\n📋 GENERANDO PLAN DE INSTALACIÓN...');
  
  const plan = {
    install: [],
    remove: [],
    consolidate: []
  };
  
  // Dependencias críticas a instalar
  missing.forEach(dep => {
    plan.install.push(dep);
  });
  
  // Dependencias a remover (solo las más obvias)
  const safeToRemove = unused.filter(dep => 
    !dep.includes('react') && 
    !dep.includes('typescript') && 
    !dep.includes('vite') &&
    !dep.includes('tailwind') &&
    !dep.includes('supabase')
  );
  
  plan.remove = safeToRemove.slice(0, 5); // Solo las primeras 5 para ser conservadores
  
  console.log(`📦 A instalar: ${plan.install.length} dependencias`);
  console.log(`🗑️ A remover: ${plan.remove.length} dependencias`);
  
  return plan;
}

function testCompilation() {
  console.log('\n🧪 Verificando compilación actual...');
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    console.log('✅ Compilación actual: OK');
    return true;
  } catch (error) {
    console.log('❌ Compilación actual: FALLA');
    return false;
  }
}

async function main() {
  console.log('🚀 FASE 3: ANÁLISIS DE DEPENDENCIAS');
  console.log('='.repeat(50));
  
  // Verificar estado actual
  const compilationOk = testCompilation();
  if (!compilationOk) {
    console.log('⚠️ El proyecto no compila actualmente. Abortando análisis de dependencias.');
    return;
  }
  
  // Analizar dependencias
  const { packageJson, currentDeps } = analyzeCurrentDeps();
  const { missing, present } = checkMissingCritical(currentDeps);
  const { used, unused } = checkUnusedDeps(currentDeps);
  
  // Generar plan
  const plan = generateInstallPlan(missing, unused);
  
  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    current: {
      total: Object.keys(currentDeps).length,
      critical: present.length,
      missing: missing.length,
      unused: unused.length
    },
    plan,
    recommendations: [
      'Instalar dependencias críticas primero',
      'Verificar compilación después de cada instalación',
      'Remover dependencias no usadas gradualmente',
      'Consolidar dependencias similares'
    ]
  };
  
  const reportPath = path.join(__dirname, '..', 'dependency-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 RESUMEN:');
  console.log(`- Total dependencias: ${Object.keys(currentDeps).length}`);
  console.log(`- Críticas faltantes: ${missing.length}`);
  console.log(`- Posiblemente no usadas: ${unused.length}`);
  console.log(`- Plan de instalación: ${plan.install.length} a instalar`);
  console.log(`- Plan de limpieza: ${plan.remove.length} a remover`);
  
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. Revisar el reporte generado');
  console.log('2. Instalar dependencias críticas');
  console.log('3. Verificar compilación');
  console.log('4. Remover dependencias no usadas');
}

main();
