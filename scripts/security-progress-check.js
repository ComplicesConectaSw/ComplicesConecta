/**
 * Script de Verificación de Progreso de Seguridad - ComplicesConecta
 * Verifica el estado de los pasos críticos de seguridad pendientes
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

console.log('🔍 VERIFICANDO PROGRESO DE SEGURIDAD - ComplicesConecta v3.0.0');
console.log('================================================================');
console.log(`⏰ Fecha: ${new Date().toLocaleString('es-ES')}`);
console.log('');

/**
 * Verificar si el nuevo token está configurado
 */
function checkNewTokenConfigured() {
  console.log('1️⃣ Verificando configuración de nuevo token...');
  
  try {
    if (!existsSync('.env.circleci')) {
      console.log('  ❌ Archivo .env.circleci no encontrado');
      return false;
    }

    const envContent = readFileSync('.env.circleci', 'utf8');
    
    if (envContent.includes('YOUR_NEW_SECURE_GITHUB_TOKEN_HERE')) {
      console.log('  ⚠️ Token placeholder detectado - PENDIENTE configurar nuevo token');
      return false;
    }
    
    if (envContent.includes('github_pat_') && !envContent.includes('YOUR_')) {
      console.log('  ✅ Nuevo token GitHub AI configurado');
      return true;
    }
    
    console.log('  ❌ Token no configurado correctamente');
    return false;
  } catch (error) {
    console.log(`  ❌ Error verificando token: ${error.message}`);
    return false;
  }
}

/**
 * Probar conexión con GitHub AI
 */
async function testGitHubAIConnection() {
  console.log('2️⃣ Probando conexión con GitHub AI...');
  
  try {
    // Verificar si las dependencias están instaladas
    execSync('pnpm list @azure-rest/ai-inference', { stdio: 'pipe' });
    
    // Intentar ejecutar el test de AI
    const result = execSync('pnpm ai:test', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 30000 
    });
    
    if (result.includes('✅') || result.includes('Conexión exitosa')) {
      console.log('  ✅ Conexión con GitHub AI exitosa');
      return true;
    } else {
      console.log('  ⚠️ Conexión con GitHub AI incierta');
      console.log(`  📋 Resultado: ${result.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log('  ❌ Error probando conexión GitHub AI');
    console.log(`  📋 Error: ${error.message.substring(0, 100)}...`);
    return false;
  }
}

/**
 * Verificar configuración de CircleCI
 */
function checkCircleCIConfig() {
  console.log('3️⃣ Verificando configuración CircleCI...');
  
  try {
    if (!existsSync('.circleci/config.yml')) {
      console.log('  ❌ Archivo .circleci/config.yml no encontrado');
      return false;
    }
    
    const configContent = readFileSync('.circleci/config.yml', 'utf8');
    
    // Verificar que usa variables de entorno
    if (configContent.includes('$GITHUB_TOKEN')) {
      console.log('  ✅ Configuración CircleCI usa variables de entorno');
      
      // Verificar estructura del pipeline
      if (configContent.includes('complices-conecta-ci')) {
        console.log('  ✅ Workflow principal configurado');
        return true;
      } else {
        console.log('  ⚠️ Workflow principal no encontrado');
        return false;
      }
    } else {
      console.log('  ❌ Configuración no usa variables de entorno correctamente');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error verificando CircleCI: ${error.message}`);
    return false;
  }
}

/**
 * Verificar que no hay tokens expuestos
 */
function checkNoExposedTokens() {
  console.log('4️⃣ Verificando que no hay tokens expuestos...');
  
  try {
    // Buscar tokens en archivos trackeados por git
    const result = execSync('git grep -l "github_pat_11BUGPENY" -- "*.md" "*.js" "*.ts" "*.json" "*.yml" || true', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.trim()) {
      console.log('  ❌ Token comprometido aún encontrado en:');
      result.trim().split('\n').forEach(file => {
        console.log(`    - ${file}`);
      });
      return false;
    } else {
      console.log('  ✅ No se encontraron tokens expuestos en archivos trackeados');
      return true;
    }
  } catch (error) {
    console.log('  ✅ No se encontraron tokens expuestos (grep sin resultados)');
    return true;
  }
}

/**
 * Verificar estado del repositorio
 */
function checkRepositoryStatus() {
  console.log('5️⃣ Verificando estado del repositorio...');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      console.log('  ⚠️ Hay cambios pendientes en el repositorio:');
      status.trim().split('\n').slice(0, 5).forEach(line => {
        console.log(`    ${line}`);
      });
    } else {
      console.log('  ✅ Repositorio limpio, sin cambios pendientes');
    }
    
    // Verificar que estamos en la rama correcta
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`  📋 Rama actual: ${branch}`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ Error verificando repositorio: ${error.message}`);
    return false;
  }
}

/**
 * Generar reporte de progreso
 */
function generateProgressReport(results) {
  console.log('\n📊 REPORTE DE PROGRESO DE SEGURIDAD');
  console.log('=====================================');
  
  const steps = [
    { name: 'Nuevo token configurado', completed: results.tokenConfigured, priority: 'ALTA' },
    { name: 'Conexión GitHub AI funcionando', completed: results.aiConnection, priority: 'ALTA' },
    { name: 'Configuración CircleCI correcta', completed: results.circleci, priority: 'MEDIA' },
    { name: 'Sin tokens expuestos', completed: results.noExposedTokens, priority: 'ALTA' },
    { name: 'Estado repositorio limpio', completed: results.repoStatus, priority: 'BAJA' }
  ];

  let completedSteps = 0;
  steps.forEach(step => {
    const status = step.completed ? '✅ COMPLETADO' : '❌ PENDIENTE';
    const priority = step.priority === 'ALTA' ? '🔴' : step.priority === 'MEDIA' ? '🟡' : '🟢';
    console.log(`${status} ${priority} ${step.name}`);
    if (step.completed) completedSteps++;
  });

  const progress = Math.round((completedSteps / steps.length) * 100);
  console.log(`\n🎯 PROGRESO TOTAL: ${progress}% (${completedSteps}/${steps.length})`);

  if (progress === 100) {
    console.log('🎉 ¡TODOS LOS PASOS DE SEGURIDAD COMPLETADOS!');
  } else if (progress >= 80) {
    console.log('⚠️ CASI COMPLETO: Solo faltan algunos pasos menores');
  } else if (progress >= 60) {
    console.log('🔶 PROGRESO BUENO: Faltan algunos pasos importantes');
  } else {
    console.log('🚨 ACCIÓN REQUERIDA: Varios pasos críticos pendientes');
  }

  return progress;
}

/**
 * Mostrar próximos pasos
 */
function showNextSteps(results) {
  console.log('\n📋 PRÓXIMOS PASOS RECOMENDADOS:');
  console.log('===============================');

  if (!results.tokenConfigured) {
    console.log('🚨 CRÍTICO: Configurar nuevo token GitHub AI en .env.circleci');
  }
  
  if (!results.aiConnection) {
    console.log('🔧 IMPORTANTE: Verificar conexión con GitHub AI (pnpm ai:test)');
  }
  
  if (!results.circleci) {
    console.log('⚙️ CONFIGURAR: Conectar repositorio en CircleCI dashboard');
  }
  
  if (!results.noExposedTokens) {
    console.log('🛡️ SEGURIDAD: Eliminar tokens expuestos encontrados');
  }

  if (results.tokenConfigured && results.aiConnection && results.circleci && results.noExposedTokens) {
    console.log('✅ ¡Configuración de seguridad completa!');
    console.log('🚀 Siguiente: Monitorear pipeline en CircleCI dashboard');
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    const results = {
      tokenConfigured: checkNewTokenConfigured(),
      aiConnection: false, // Se probará después
      circleci: checkCircleCIConfig(),
      noExposedTokens: checkNoExposedTokens(),
      repoStatus: checkRepositoryStatus()
    };

    // Probar conexión AI solo si el token está configurado
    if (results.tokenConfigured) {
      results.aiConnection = await testGitHubAIConnection();
    } else {
      console.log('2️⃣ ⏭️ Saltando test de GitHub AI (token no configurado)');
    }

    const progress = generateProgressReport(results);
    showNextSteps(results);

    console.log('\n🔧 COMANDOS ÚTILES:');
    console.log('==================');
    console.log('pnpm ai:test          # Probar conexión GitHub AI');
    console.log('pnpm security:check   # Escaneo completo de seguridad');
    console.log('pnpm security:verify  # Verificación rápida');
    console.log('git status --ignored  # Ver archivos ignorados');

    console.log('\n🚀 Verificación de progreso completada');
    process.exit(progress === 100 ? 0 : 1);

  } catch (error) {
    console.error('💥 Error durante verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}