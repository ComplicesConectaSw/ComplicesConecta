#!/usr/bin/env node

/**
 * Script para limpiar directorios redundantes de documentación
 * Mantiene solo docs-unified como directorio principal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Iniciando limpieza de documentación redundante...\n');

// Directorios a eliminar (redundantes)
const redundantDirs = [
  'docs',
  'docs-public', // Mover contenido importante a docs-unified primero
  'reports',
  'token-system-spec-updated',
  'worldid-integration',
  'workflows-desactivados'
];

// Archivos de documentación redundantes en root
const redundantFiles = [
  'project-structure.md', // Ya tenemos estructura en docs-unified
  'diff.patch' // Archivo temporal de git
];

// 1. Verificar y mover archivos importantes antes de eliminar
console.log('📋 Verificando archivos importantes...');

const projectRoot = path.resolve(__dirname, '..');

// Mover archivos importantes de docs-public a docs-unified
const importantFiles = [
  { from: 'docs-public/API.md', to: 'docs-unified/api/API.md' },
  { from: 'docs-public/COMPONENTS.md', to: 'docs-unified/development/COMPONENTS.md' },
  { from: 'docs-public/DEPLOY.md', to: 'docs-unified/deployment/DEPLOY.md' },
  { from: 'docs-public/SUPABASE_EMAIL_SETUP.md', to: 'docs-unified/email/SUPABASE_EMAIL_SETUP_OLD.md' }
];

importantFiles.forEach(({ from, to }) => {
  const fromPath = path.join(projectRoot, from);
  const toPath = path.join(projectRoot, to);
  
  if (fs.existsSync(fromPath)) {
    // Crear directorio de destino si no existe
    const toDir = path.dirname(toPath);
    if (!fs.existsSync(toDir)) {
      fs.mkdirSync(toDir, { recursive: true });
    }
    
    // Mover archivo
    fs.copyFileSync(fromPath, toPath);
    console.log(`✅ Movido: ${from} → ${to}`);
  }
});

// 2. Crear directorio api si no existe
const apiDir = path.join(projectRoot, 'docs-unified', 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
  console.log('✅ Creado directorio: docs-unified/api');
}

// 3. Crear directorio development si no existe
const devDir = path.join(projectRoot, 'docs-unified', 'development');
if (!fs.existsSync(devDir)) {
  fs.mkdirSync(devDir, { recursive: true });
  console.log('✅ Creado directorio: docs-unified/development');
}

// 4. Eliminar directorios redundantes
console.log('\n🗑️  Eliminando directorios redundantes...');
redundantDirs.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Eliminado: ${dir}/`);
    } catch (error) {
      console.error(`❌ Error eliminando ${dir}:`, error.message);
    }
  } else {
    console.log(`ℹ️  ${dir}/ ya no existe`);
  }
});

// 5. Eliminar archivos redundantes
console.log('\n🗑️  Eliminando archivos redundantes...');
redundantFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Eliminado: ${file}`);
    } catch (error) {
      console.error(`❌ Error eliminando ${file}:`, error.message);
    }
  } else {
    console.log(`ℹ️  ${file} ya no existe`);
  }
});

// 6. Actualizar .gitignore para evitar recreación
console.log('\n📝 Actualizando .gitignore...');
const gitignorePath = path.join(projectRoot, '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const ignorePaths = [
  '# Directorios de documentación redundantes',
  'docs/',
  'docs-public/',
  'reports/',
  'token-system-spec-updated/',
  'worldid-integration/',
  'workflows-desactivados/',
  '',
  '# Archivos temporales',
  '*.patch',
  'diff.patch',
  'project-structure.md'
];

// Agregar solo si no están ya en .gitignore
ignorePaths.forEach(line => {
  if (!gitignoreContent.includes(line)) {
    gitignoreContent += '\n' + line;
  }
});

fs.writeFileSync(gitignorePath, gitignoreContent);
console.log('✅ .gitignore actualizado');

// 7. Actualizar README principal
console.log('\n📖 Actualizando README...');
const readmePath = path.join(projectRoot, 'README.md');
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Actualizar referencias a documentación
  readmeContent = readmeContent.replace(/docs\//g, 'docs-unified/');
  readmeContent = readmeContent.replace(/docs-public\//g, 'docs-unified/');
  
  // Agregar sección de documentación actualizada
  const docSection = `
## 📚 Documentación

Toda la documentación del proyecto se encuentra organizada en \`docs-unified/\`:

- **Seguridad**: Auditorías y configuraciones de seguridad
- **Tests**: Documentación de testing y QA
- **Autenticación**: Guías de auth y configuración
- **Matching**: Sistema de matching y algoritmos
- **Base de Datos**: Esquemas y migraciones
- **Despliegue**: Guías de deployment
- **Auditorías**: Reportes de auditorías técnicas
- **Chat**: Sistema de chat en tiempo real
- **Premium**: Funcionalidades premium
- **Android**: Configuración y optimización móvil
- **Email**: Configuración de templates de email
- **API**: Documentación de endpoints
- **Desarrollo**: Guías para desarrolladores

Ver [docs-unified/README.md](docs-unified/README.md) para el índice completo.
`;

  // Reemplazar sección de documentación existente o agregar al final
  if (readmeContent.includes('## 📚 Documentación')) {
    readmeContent = readmeContent.replace(/## 📚 Documentación[\s\S]*?(?=##|$)/, docSection);
  } else {
    readmeContent += docSection;
  }
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ README actualizado');
}

// 8. Resumen final
console.log('\n📊 Resumen de limpieza:');
console.log(`✅ Directorios eliminados: ${redundantDirs.length}`);
console.log(`✅ Archivos eliminados: ${redundantFiles.length}`);
console.log(`✅ Archivos importantes movidos: ${importantFiles.length}`);
console.log('✅ .gitignore actualizado');
console.log('✅ README actualizado');

console.log('\n🎉 ¡Limpieza de documentación completada!');
console.log('\n📋 Estructura final de documentación:');
console.log('docs-unified/ (ÚNICO directorio de documentación)');
console.log('├── README.md (índice principal)');
console.log('├── security/');
console.log('├── tests/');
console.log('├── authentication/');
console.log('├── matching/');
console.log('├── database/');
console.log('├── deployment/');
console.log('├── audits/');
console.log('├── chat/');
console.log('├── premium/');
console.log('├── android/');
console.log('├── email/');
console.log('├── api/');
console.log('└── development/');

console.log('\n✨ Documentación organizada y limpia!');
