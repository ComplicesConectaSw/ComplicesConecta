/**
 * Script simple de verificación de token GitHub AI - ComplicesConecta
 * Verifica que el token esté configurado correctamente
 */

import { readFileSync, existsSync } from 'fs';

console.log('🔍 VERIFICANDO TOKEN GITHUB AI - ComplicesConecta v3.0.0');
console.log('=========================================================');
console.log(`⏰ Fecha: ${new Date().toLocaleString('es-ES')}`);
console.log('');

/**
 * Verificar configuración del token
 */
function verifyTokenConfiguration() {
  console.log('1️⃣ Verificando configuración del token...');
  
  try {
    // Verificar archivo .env.circleci
    if (!existsSync('.env.circleci')) {
      console.log('  ❌ Archivo .env.circleci no encontrado');
      return false;
    }

    const envContent = readFileSync('.env.circleci', 'utf8');
    
    // Verificar que el token esté configurado
    if (envContent.includes('YOUR_NEW_SECURE_GITHUB_TOKEN_HERE')) {
      console.log('  ❌ Token placeholder detectado - Token no configurado');
      return false;
    }
    
    // Verificar formato del token
    const tokenMatch = envContent.match(/GITHUB_TOKEN=github_pat_([A-Za-z0-9_]+)/);
    if (tokenMatch) {
      const tokenSuffix = tokenMatch[1];
      console.log(`  ✅ Token GitHub AI configurado: github_pat_${tokenSuffix.substring(0, 10)}...`);
      console.log(`  📏 Longitud del token: ${tokenMatch[0].length} caracteres`);
      
      // Verificar que es el nuevo token
      if (tokenSuffix.startsWith('11BUGPENY0UWNqCTxckpKP')) {
        console.log('  ✅ Nuevo token seguro detectado');
        return true;
      } else if (tokenSuffix.startsWith('11BUGPENY059o5lHhLqIHN')) {
        console.log('  ⚠️ ADVERTENCIA: Token anterior comprometido detectado');
        return false;
      } else {
        console.log('  ✅ Token personalizado configurado');
        return true;
      }
    } else {
      console.log('  ❌ Formato de token no válido');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error verificando token: ${error.message}`);
    return false;
  }
}

/**
 * Verificar variables de entorno
 */
function verifyEnvironmentVariables() {
  console.log('2️⃣ Verificando variables de entorno...');
  
  try {
    const envContent = readFileSync('.env.circleci', 'utf8');
    
    const requiredVars = [
      'GITHUB_TOKEN',
      'VITE_SUPABASE_URL', 
      'VITE_SUPABASE_ANON_KEY',
      'NODE_ENV'
    ];

    let allConfigured = true;
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        const line = envContent.split('\n').find(l => l.startsWith(`${varName}=`));
        if (line && !line.includes('your-') && !line.includes('YOUR_')) {
          console.log(`  ✅ ${varName}: Configurado`);
        } else {
          console.log(`  ⚠️ ${varName}: Placeholder detectado`);
          if (varName !== 'GITHUB_TOKEN') allConfigured = false;
        }
      } else {
        console.log(`  ❌ ${varName}: No encontrado`);
        allConfigured = false;
      }
    });

    return allConfigured;
  } catch (error) {
    console.log(`  ❌ Error verificando variables: ${error.message}`);
    return false;
  }
}

/**
 * Verificar protección del archivo
 */
function verifyFileProtection() {
  console.log('3️⃣ Verificando protección del archivo...');
  
  try {
    // Verificar que está en .gitignore
    if (existsSync('.gitignore')) {
      const gitignoreContent = readFileSync('.gitignore', 'utf8');
      if (gitignoreContent.includes('.env.circleci')) {
        console.log('  ✅ Archivo .env.circleci protegido en .gitignore');
        return true;
      } else {
        console.log('  ⚠️ Archivo .env.circleci NO está en .gitignore');
        return false;
      }
    } else {
      console.log('  ❌ Archivo .gitignore no encontrado');
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error verificando protección: ${error.message}`);
    return false;
  }
}

/**
 * Generar reporte final
 */
function generateReport(results) {
  console.log('\n📊 REPORTE DE VERIFICACIÓN');
  console.log('==========================');
  
  const checks = [
    { name: 'Token configurado correctamente', passed: results.token, priority: 'CRÍTICA' },
    { name: 'Variables de entorno configuradas', passed: results.envVars, priority: 'ALTA' },
    { name: 'Archivo protegido en .gitignore', passed: results.protection, priority: 'ALTA' }
  ];

  let passedChecks = 0;
  checks.forEach(check => {
    const status = check.passed ? '✅ PASS' : '❌ FAIL';
    const priority = check.priority === 'CRÍTICA' ? '🔴' : check.priority === 'ALTA' ? '🟡' : '🟢';
    console.log(`${status} ${priority} ${check.name}`);
    if (check.passed) passedChecks++;
  });

  const score = Math.round((passedChecks / checks.length) * 100);
  console.log(`\n🎯 PUNTUACIÓN: ${score}% (${passedChecks}/${checks.length})`);

  if (score === 100) {
    console.log('🎉 ¡CONFIGURACIÓN PERFECTA! Token listo para usar');
  } else if (score >= 66) {
    console.log('⚠️ CONFIGURACIÓN PARCIAL: Algunos ajustes necesarios');
  } else {
    console.log('🚨 CONFIGURACIÓN INCOMPLETA: Requiere atención inmediata');
  }

  return score;
}

/**
 * Mostrar próximos pasos
 */
function showNextSteps(results) {
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('==================');

  if (results.token && results.protection) {
    console.log('✅ Token configurado y protegido correctamente');
    console.log('🔄 Siguiente: Revocar token anterior en GitHub Settings');
    console.log('⚙️ Siguiente: Configurar CircleCI con las variables de entorno');
  } else {
    if (!results.token) {
      console.log('🚨 CRÍTICO: Configurar token GitHub AI en .env.circleci');
    }
    if (!results.protection) {
      console.log('🛡️ IMPORTANTE: Agregar .env.circleci a .gitignore');
    }
  }

  console.log('\n🔧 COMANDOS ÚTILES:');
  console.log('node scripts/verify-token.js     # Verificar configuración');
  console.log('pnpm security:progress           # Estado general de seguridad');
  console.log('git check-ignore .env.circleci   # Verificar protección');
}

/**
 * Función principal
 */
async function main() {
  try {
    const results = {
      token: verifyTokenConfiguration(),
      envVars: verifyEnvironmentVariables(),
      protection: verifyFileProtection()
    };

    const score = generateReport(results);
    showNextSteps(results);

    console.log('\n🚀 Verificación de token completada');
    process.exit(score === 100 ? 0 : 1);

  } catch (error) {
    console.error('💥 Error durante verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}