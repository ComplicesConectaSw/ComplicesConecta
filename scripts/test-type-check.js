#!/usr/bin/env node

/**
 * Script específico para type-check robusto
 * Parte de la auditoría técnica ComplicesConecta v2.9.0
 */

import { spawn } from 'child_process';
import fs from 'fs';
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
      resolve({ stdout, stderr, code });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkTSConfig() {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    log('❌ tsconfig.json no encontrado', 'red');
    return false;
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    log('✅ tsconfig.json válido', 'green');
    
    // Verificar configuraciones críticas
    const compilerOptions = tsconfig.compilerOptions || {};
    const strictMode = compilerOptions.strict;
    const noImplicitAny = compilerOptions.noImplicitAny;
    
    log(`📋 Configuración TypeScript:`, 'blue');
    log(`   - strict: ${strictMode}`, strictMode ? 'green' : 'yellow');
    log(`   - noImplicitAny: ${noImplicitAny}`, noImplicitAny ? 'green' : 'yellow');
    log(`   - target: ${compilerOptions.target || 'ES5'}`, 'blue');
    log(`   - module: ${compilerOptions.module || 'CommonJS'}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Error leyendo tsconfig.json: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🔍 Iniciando verificación robusta de TypeScript', 'bright');
  log('📅 Fecha: ' + new Date().toISOString(), 'blue');
  
  // Verificar tsconfig.json
  log('\n📋 PASO 1: Verificando configuración TypeScript', 'magenta');
  const tsconfigValid = await checkTSConfig();
  
  if (!tsconfigValid) {
    log('💥 Configuración TypeScript inválida', 'red');
    process.exit(1);
  }

  // Ejecutar type-check
  log('\n🔍 PASO 2: Ejecutando type-check', 'magenta');
  const start = Date.now();
  
  try {
    const result = await runCommand('npx', ['tsc', '--noEmit', '--incremental', 'false']);
    const duration = Date.now() - start;
    
    if (result.code === 0) {
      log(`✅ TypeScript: Sin errores de tipos (${duration}ms)`, 'green');
      
      // Mostrar estadísticas si están disponibles
      if (result.stdout) {
        const lines = result.stdout.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          log('\n📊 Información adicional:', 'blue');
          lines.forEach(line => log(`   ${line}`, 'blue'));
        }
      }
      
      log('\n🎉 RESULTADO: TYPE-CHECK EXITOSO', 'green');
      log(`⏱️ Tiempo total: ${duration}ms`, 'blue');
      log('🚀 Todos los tipos son válidos!', 'green');
      
      process.exit(0);
    } else {
      log(`❌ TypeScript: Errores encontrados (${duration}ms)`, 'red');
      
      // Mostrar errores detallados
      if (result.stdout) {
        log('\n📋 ERRORES ENCONTRADOS:', 'red');
        console.log(result.stdout);
      }
      
      if (result.stderr) {
        log('\n⚠️ ADVERTENCIAS:', 'yellow');
        console.log(result.stderr);
      }
      
      log('\n💥 RESULTADO: TYPE-CHECK FALLÓ', 'red');
      log(`⏱️ Tiempo total: ${duration}ms`, 'blue');
      log('⚠️ Hay errores de tipos que necesitan ser corregidos', 'yellow');
      
      process.exit(1);
    }
    
  } catch (error) {
    const duration = Date.now() - start;
    log(`💥 Error ejecutando type-check: ${error.message}`, 'red');
    log(`⏱️ Tiempo transcurrido: ${duration}ms`, 'blue');
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
