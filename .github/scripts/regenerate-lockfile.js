#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * Script para regenerar correctamente el archivo pnpm-lock.yaml
 * 
 * Este script realiza las siguientes acciones:
 * 1. Elimina el archivo pnpm-lock.yaml existente
 * 2. Ordena las dependencias en package.json para evitar inconsistencias
 * 3. Ejecuta pnpm install para generar un nuevo archivo de bloqueo
 */

console.log('🔄 Iniciando regeneración del archivo pnpm-lock.yaml...');

// Ruta base del proyecto
const rootDir = path.resolve(__dirname, '../..');

// Función para ordenar dependencias en un objeto
function sortDependencies(deps) {
  if (!deps) return {};
  return Object.keys(deps).sort().reduce((result, key) => {
    result[key] = deps[key];
    return result;
  }, {});
}

// Función para ordenar las dependencias en un package.json
function sortPackageJsonDependencies(packageJsonPath) {
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    // Ordenar todas las secciones de dependencias
    if (packageJson.dependencies) {
      packageJson.dependencies = sortDependencies(packageJson.dependencies);
    }
    if (packageJson.devDependencies) {
      packageJson.devDependencies = sortDependencies(packageJson.devDependencies);
    }
    if (packageJson.peerDependencies) {
      packageJson.peerDependencies = sortDependencies(packageJson.peerDependencies);
    }

    // Escribir el package.json ordenado
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8'
    );
    
    console.log(`✅ Dependencias ordenadas en ${packageJsonPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error procesando ${packageJsonPath}:`, error.message);
    return false;
  }
}

// Eliminar el archivo de bloqueo existente
const lockfilePath = path.join(rootDir, 'pnpm-lock.yaml');
if (fs.existsSync(lockfilePath)) {
  fs.unlinkSync(lockfilePath);
  console.log('✅ Archivo pnpm-lock.yaml eliminado');
} else {
  console.log('⚠️ No se encontró el archivo pnpm-lock.yaml');
}

// Ordenar dependencias en el package.json raíz
const rootPackageJsonPath = path.join(rootDir, 'package.json');
if (sortPackageJsonDependencies(rootPackageJsonPath)) {
  console.log('✅ Dependencias del package.json raíz ordenadas correctamente');
}

// Encontrar y ordenar todos los package.json en el monorepo
const packagesDir = path.join(rootDir, 'packages');
const appsDir = path.join(rootDir, 'apps');

[packagesDir, appsDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    const subdirs = fs.readdirSync(dir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(dir, dirent.name));
    
    subdirs.forEach(subdir => {
      const packageJsonPath = path.join(subdir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        sortPackageJsonDependencies(packageJsonPath);
      }
    });
  }
});

// Generar nuevo archivo de bloqueo
try {
  console.log('🔄 Ejecutando pnpm install para generar nuevo archivo de bloqueo...');
  execSync('pnpm install --no-frozen-lockfile', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('✅ Archivo pnpm-lock.yaml regenerado correctamente');
} catch (error) {
  console.error('❌ Error regenerando el archivo pnpm-lock.yaml:', error.message);
  process.exit(1);
}

console.log('✨ Proceso completado con éxito');
