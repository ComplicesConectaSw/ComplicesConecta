#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para regenerar correctamente el archivo package-lock.json
 * 
 * Este script realiza las siguientes acciones:
 * 1. Elimina el archivo package-lock.json existente
 * 2. Ordena las dependencias en package.json para evitar inconsistencias
 * 3. Ejecuta npm install para generar un nuevo archivo de bloqueo
 */

console.log('🔄 Iniciando regeneración del archivo package-lock.json...');

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
const lockfilePath = path.join(rootDir, 'package-lock.json');
if (fs.existsSync(lockfilePath)) {
  fs.unlinkSync(lockfilePath);
  console.log('✅ Archivo package-lock.json eliminado');
} else {
  console.log('⚠️ No se encontró el archivo package-lock.json');
}

// Eliminar node_modules para una instalación limpia
const nodeModulesPath = path.join(rootDir, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('🔄 Eliminando node_modules...');
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('✅ node_modules eliminado');
}

// Ordenar dependencias en el package.json raíz
const rootPackageJsonPath = path.join(rootDir, 'package.json');
if (sortPackageJsonDependencies(rootPackageJsonPath)) {
  console.log('✅ Dependencias del package.json raíz ordenadas correctamente');
}

// Generar nuevo archivo de bloqueo
try {
  console.log('🔄 Ejecutando npm install para generar nuevo archivo de bloqueo...');
  execSync('npm install', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('✅ Archivo package-lock.json regenerado correctamente');
} catch (error) {
  console.error('❌ Error regenerando el archivo package-lock.json:', error.message);
  process.exit(1);
}

console.log('✨ Proceso completado con éxito');
