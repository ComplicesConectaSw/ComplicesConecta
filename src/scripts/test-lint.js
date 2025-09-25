#!/usr/bin/env node

/**
 * Script robusto para ejecutar lint y type-check
 * Parte de la auditoría técnica ComplicesConecta v2.9.0
 */

import { spawn } from 'child_process';
import path from 'path';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    log(`\n🔧 Ejecutando: ${command} ${args.join(' ')}`, 'cyan');
    
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd(),
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ Comando exitoso: ${command}`, 'green');
        resolve({ stdout, stderr, code });
      } else {
        log(`❌ Comando falló: ${command} (código: ${code})`, 'red');
        if (stderr) {
          console.error(stderr);
        }
        if (stdout) {
          console.log(stdout);
        }
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      log(`💥 Error ejecutando comando: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function main() {
  log('🚀 Iniciando tests robustos de lint y type-check', 'bright');
  log('📅 Fecha: ' + new Date().toISOString(), 'blue');
  
  const results = {
    eslint: { success: false, duration: 0 },
    typescript: { success: false, duration: 0 },
    build: { success: false, duration: 0 }
  };

  try {
    // 1. ESLint check
    log('\n📋 PASO 1: Verificación ESLint', 'magenta');
    const eslintStart = Date.now();
    
    try {
      await runCommand('npm', ['run', 'lint']);
      results.eslint.success = true;
      results.eslint.duration = Date.now() - eslintStart;
      log('✅ ESLint: Sin errores detectados', 'green');
    } catch (error) {
      results.eslint.duration = Date.now() - eslintStart;
      log('❌ ESLint: Errores encontrados', 'red');
      throw error;
    }

    // 2. TypeScript check
    log('\n🔍 PASO 2: Verificación TypeScript', 'magenta');
    const tscStart = Date.now();
    
    try {
      await runCommand('npm', ['run', 'type-check']);
      results.typescript.success = true;
      results.typescript.duration = Date.now() - tscStart;
      log('✅ TypeScript: Compilación exitosa', 'green');
    } catch (error) {
      results.typescript.duration = Date.now() - tscStart;
      log('❌ TypeScript: Errores de tipos encontrados', 'red');
      throw error;
    }

    // 3. Build check
    log('\n🏗️ PASO 3: Verificación de Build', 'magenta');
    const buildStart = Date.now();
    
    try {
      await runCommand('npm', ['run', 'build']);
      results.build.success = true;
      results.build.duration = Date.now() - buildStart;
      log('✅ Build: Compilación exitosa', 'green');
    } catch (error) {
      results.build.duration = Date.now() - buildStart;
      log('❌ Build: Error en compilación', 'red');
      throw error;
    }

    // Resumen final
    log('\n🎉 RESUMEN FINAL', 'bright');
    log('================', 'bright');
    log(`✅ ESLint: ${results.eslint.success ? 'PASS' : 'FAIL'} (${results.eslint.duration}ms)`, results.eslint.success ? 'green' : 'red');
    log(`✅ TypeScript: ${results.typescript.success ? 'PASS' : 'FAIL'} (${results.typescript.duration}ms)`, results.typescript.success ? 'green' : 'red');
    log(`✅ Build: ${results.build.success ? 'PASS' : 'FAIL'} (${results.build.duration}ms)`, results.build.success ? 'green' : 'red');
    
    const allPassed = results.eslint.success && results.typescript.success && results.build.success;
    const totalDuration = results.eslint.duration + results.typescript.duration + results.build.duration;
    
    log(`\n🏆 RESULTADO: ${allPassed ? 'TODOS LOS TESTS PASARON' : 'ALGUNOS TESTS FALLARON'}`, allPassed ? 'green' : 'red');
    log(`⏱️ Tiempo total: ${totalDuration}ms`, 'blue');
    
    if (allPassed) {
      log('\n🚀 El proyecto está listo para producción!', 'green');
      process.exit(0);
    } else {
      log('\n⚠️ Hay errores que necesitan ser corregidos antes de producción', 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`\n💥 Error durante la ejecución: ${error.message}`, 'red');
    
    // Mostrar resumen parcial
    log('\n📊 RESUMEN PARCIAL', 'yellow');
    log('==================', 'yellow');
    Object.entries(results).forEach(([test, result]) => {
      if (result.duration > 0) {
        log(`${result.success ? '✅' : '❌'} ${test}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration}ms)`, result.success ? 'green' : 'red');
      } else {
        log(`⏸️ ${test}: NO EJECUTADO`, 'yellow');
      }
    });
    
    process.exit(1);
  }
}

// Manejar señales de interrupción
process.on('SIGINT', () => {
  log('\n⚠️ Proceso interrumpido por el usuario', 'yellow');
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n⚠️ Proceso terminado', 'yellow');
  process.exit(143);
});

// Ejecutar script principal
main().catch((error) => {
  log(`💥 Error no manejado: ${error.message}`, 'red');
  process.exit(1);
});
