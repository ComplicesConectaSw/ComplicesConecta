/**
 * Script de Verificación de Seguridad - ComplicesConecta
 * Verifica que no hay tokens o credenciales expuestas
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 INICIANDO VERIFICACIÓN DE SEGURIDAD - ComplicesConecta v3.0.0');
console.log('================================================================');

/**
 * Verificar archivos ignorados en .gitignore
 */
function checkGitIgnore() {
  console.log('\n🛡️ Verificando configuración .gitignore...');
  
  try {
    const gitignorePath = '.gitignore';
    if (!existsSync(gitignorePath)) {
      console.log('❌ Archivo .gitignore no encontrado');
      return false;
    }

    const gitignoreContent = readFileSync(gitignorePath, 'utf8');
    const requiredPatterns = [
      '.env',
      '.env.*',
      '.env.production',
      '.env.circleci'
    ];

    let allPatternsFound = true;
    requiredPatterns.forEach(pattern => {
      if (gitignoreContent.includes(pattern)) {
        console.log(`  ✅ ${pattern} - Protegido`);
      } else {
        console.log(`  ❌ ${pattern} - NO PROTEGIDO`);
        allPatternsFound = false;
      }
    });

    return allPatternsFound;
  } catch (error) {
    console.log(`❌ Error verificando .gitignore: ${error.message}`);
    return false;
  }
}

/**
 * Verificar que archivos sensibles están siendo ignorados
 */
function checkIgnoredFiles() {
  console.log('\n🔒 Verificando archivos sensibles ignorados...');
  
  const sensitiveFiles = ['.env.production', '.env.circleci'];
  let allIgnored = true;

  sensitiveFiles.forEach(file => {
    try {
      execSync(`git check-ignore ${file}`, { stdio: 'pipe' });
      console.log(`  ✅ ${file} - Correctamente ignorado`);
    } catch (error) {
      if (existsSync(file)) {
        console.log(`  ❌ ${file} - EXISTE pero NO está ignorado`);
        allIgnored = false;
      } else {
        console.log(`  ⚠️ ${file} - No existe (OK)`);
      }
    }
  });

  return allIgnored;
}

/**
 * Buscar posibles tokens expuestos en archivos
 */
function scanForExposedTokens() {
  console.log('\n🔍 Escaneando archivos por tokens expuestos...');
  
  const tokenPatterns = [
    'github_pat_',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'sk-',
    'AKIA',
    'AIza'
  ];

  const filesToScan = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx',
    '*.md',
    '*.json',
    '.circleci/**/*'
  ];

  let tokensFound = false;

  tokenPatterns.forEach(pattern => {
    try {
      const result = execSync(`git grep -l "${pattern}" -- ${filesToScan.join(' ')} || true`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (result.trim()) {
        console.log(`  ❌ Patrón "${pattern}" encontrado en:`);
        result.trim().split('\n').forEach(file => {
          console.log(`    - ${file}`);
        });
        tokensFound = true;
      } else {
        console.log(`  ✅ Patrón "${pattern}" - No encontrado`);
      }
    } catch (error) {
      // Ignorar errores de grep (normal si no encuentra nada)
    }
  });

  return !tokensFound;
}

/**
 * Verificar configuración de CircleCI
 */
function checkCircleCIConfig() {
  console.log('\n⚙️ Verificando configuración CircleCI...');
  
  const configPath = '.circleci/config.yml';
  if (!existsSync(configPath)) {
    console.log('❌ Archivo .circleci/config.yml no encontrado');
    return false;
  }

  try {
    const configContent = readFileSync(configPath, 'utf8');
    
    // Verificar que no hay tokens hardcodeados
    const dangerousPatterns = [
      'github_pat_',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'postgresql://',
      'https://.*\\.supabase\\.co'
    ];

    let hasHardcodedSecrets = false;
    dangerousPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(configContent)) {
        console.log(`  ❌ Posible secreto hardcodeado encontrado: ${pattern}`);
        hasHardcodedSecrets = true;
      }
    });

    if (!hasHardcodedSecrets) {
      console.log('  ✅ No se encontraron secretos hardcodeados');
    }

    // Verificar uso de variables de entorno
    const envVarPattern = /\$\{?[A-Z_]+\}?/g;
    const envVars = configContent.match(envVarPattern) || [];
    
    console.log(`  ✅ Variables de entorno encontradas: ${envVars.length}`);
    envVars.slice(0, 5).forEach(envVar => {
      console.log(`    - ${envVar}`);
    });

    return !hasHardcodedSecrets;
  } catch (error) {
    console.log(`❌ Error verificando CircleCI config: ${error.message}`);
    return false;
  }
}

/**
 * Verificar estado del repositorio
 */
function checkRepoStatus() {
  console.log('\n📊 Verificando estado del repositorio...');
  
  try {
    // Verificar que no hay archivos sensibles en staging
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const stagedFiles = status.split('\n').filter(line => line.startsWith('A ') || line.startsWith('M '));
    
    const sensitivePatterns = ['.env', 'token', 'secret', 'key'];
    let sensitiveStagedFiles = [];

    stagedFiles.forEach(file => {
      const filename = file.substring(3);
      sensitivePatterns.forEach(pattern => {
        if (filename.toLowerCase().includes(pattern)) {
          sensitiveStagedFiles.push(filename);
        }
      });
    });

    if (sensitiveStagedFiles.length > 0) {
      console.log('  ❌ Archivos sensibles en staging:');
      sensitiveStagedFiles.forEach(file => {
        console.log(`    - ${file}`);
      });
      return false;
    } else {
      console.log('  ✅ No hay archivos sensibles en staging');
    }

    // Verificar commits recientes por tokens
    const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
    const hasTokenInCommits = /token|secret|key|password/i.test(recentCommits);
    
    if (hasTokenInCommits) {
      console.log('  ⚠️ Posibles referencias a secretos en commits recientes');
      console.log('  📋 Commits recientes:');
      recentCommits.split('\n').slice(0, 3).forEach(commit => {
        console.log(`    ${commit}`);
      });
    } else {
      console.log('  ✅ No se detectaron referencias a secretos en commits recientes');
    }

    return true;
  } catch (error) {
    console.log(`❌ Error verificando estado del repo: ${error.message}`);
    return false;
  }
}

/**
 * Generar reporte de seguridad
 */
function generateSecurityReport(results) {
  console.log('\n📋 REPORTE DE SEGURIDAD');
  console.log('========================');
  
  const checks = [
    { name: 'Configuración .gitignore', passed: results.gitignore },
    { name: 'Archivos sensibles ignorados', passed: results.ignoredFiles },
    { name: 'Escaneo de tokens expuestos', passed: results.tokenScan },
    { name: 'Configuración CircleCI', passed: results.circleci },
    { name: 'Estado del repositorio', passed: results.repoStatus }
  ];

  let totalPassed = 0;
  checks.forEach(check => {
    const status = check.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${check.name}`);
    if (check.passed) totalPassed++;
  });

  const score = Math.round((totalPassed / checks.length) * 100);
  console.log(`\n🎯 PUNTUACIÓN DE SEGURIDAD: ${score}/100`);

  if (score === 100) {
    console.log('🛡️ EXCELENTE: Configuración de seguridad perfecta');
  } else if (score >= 80) {
    console.log('⚠️ BUENO: Algunas mejoras de seguridad recomendadas');
  } else {
    console.log('🚨 CRÍTICO: Problemas de seguridad requieren atención inmediata');
  }

  return score;
}

/**
 * Función principal
 */
async function main() {
  try {
    const results = {
      gitignore: checkGitIgnore(),
      ignoredFiles: checkIgnoredFiles(),
      tokenScan: scanForExposedTokens(),
      circleci: checkCircleCIConfig(),
      repoStatus: checkRepoStatus()
    };

    const score = generateSecurityReport(results);

    console.log('\n🔧 RECOMENDACIONES:');
    if (!results.gitignore) {
      console.log('- Actualizar .gitignore con patrones de archivos sensibles');
    }
    if (!results.ignoredFiles) {
      console.log('- Verificar que archivos .env.* estén correctamente ignorados');
    }
    if (!results.tokenScan) {
      console.log('- URGENTE: Rotar tokens expuestos inmediatamente');
    }
    if (!results.circleci) {
      console.log('- Revisar configuración CircleCI por secretos hardcodeados');
    }
    if (!results.repoStatus) {
      console.log('- Revisar archivos en staging por información sensible');
    }

    if (score === 100) {
      console.log('✅ No se requieren acciones adicionales');
    }

    console.log('\n🚀 Verificación de seguridad completada');
    process.exit(score === 100 ? 0 : 1);

  } catch (error) {
    console.error('💥 Error durante verificación de seguridad:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}