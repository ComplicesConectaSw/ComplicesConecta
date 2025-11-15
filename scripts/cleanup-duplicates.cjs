// Script para limpiar archivos duplicados identificados en la auditoría
const fs = require('fs');
const path = require('path');

const duplicateFiles = [
  // Tests duplicados - mantener en /unit/ y eliminar de raíz
  { keep: 'src/tests/unit/AILayerService.test.ts', remove: 'src/tests/AILayerService.test.ts' },
  { keep: 'src/tests/e2e/auth.e2e.test.ts', remove: 'src/tests/auth.e2e.test.ts' },
  { keep: 'src/tests/security/biometric-auth.test.ts', remove: 'src/tests/biometric-auth.test.ts' },
  { keep: 'src/tests/unit/emailService.test.ts', remove: 'src/tests/emailService.test.ts' },
  { keep: 'src/pages/Investors.tsx', remove: 'docs-unified/Investors.tsx' },
  { keep: 'src/tests/unit/invitations.test.ts', remove: 'src/tests/invitations.test.ts' },
  { keep: 'src/tests/unit/localStorage-migration.test.ts', remove: 'src/tests/localStorage-migration.test.ts' },
  { keep: 'src/tests/unit/matching.test.ts', remove: 'src/tests/matching.test.ts' },
  { keep: 'src/tests/unit/PerformanceMonitoringService.test.ts', remove: 'src/tests/PerformanceMonitoringService.test.ts' },
  { keep: 'src/tests/unit/PushNotificationService.test.ts', remove: 'src/tests/PushNotificationService.test.ts' },
  { keep: 'src/tests/unit/PyTorchScoringModel.test.ts', remove: 'src/tests/PyTorchScoringModel.test.ts' },
  { keep: 'src/tests/integration/rls-policies.test.ts', remove: 'src/tests/rls-policies.test.ts' },
  { keep: 'src/tests/unit/roles.test.ts', remove: 'src/tests/roles.test.ts' },
  { keep: 'src/tests/integration/send-email.test.ts', remove: 'src/tests/send-email.test.ts' },
  { keep: 'src/tests/integration/supabase-integration.test.ts', remove: 'src/tests/supabase-integration.test.ts' },
  { keep: 'src/tests/components/TokenDashboard.test.tsx', remove: 'src/tests/TokenDashboard.test.tsx' },
  { keep: 'src/tests/unit/zod-validation.test.ts', remove: 'src/tests/zod-validation.test.ts' }
];

const obsoleteFiles = [
  'docs/legal/Política de Backups.mc',
  'docs-unified/supabase-backup-info.txt',
  'docs-unified/legacy-docs-unified/email/SUPABASE_EMAIL_SETUP_OLD.md',
  'scripts/consolidar-backup-migraciones.ps1',
  'scripts/crear-backup-migraciones.ps1',
  'src/lib/backup-system.ts'
];

const emptyFiles = [
  'src/pages/LegalNew.tsx'
];

const corruptFiles = [
  'src/components/accessibility/ContrastFixer.tsx',
  'src/services/ConsentVerificationService.ts'
];

function safeDelete(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`  ✅ Eliminado: ${filePath}`);
      return true;
    } else {
      console.log(`  ⚠️ No existe: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error eliminando ${filePath}: ${error.message}`);
    return false;
  }
}

function cleanupDuplicates() {
  console.log('🧹 Eliminando archivos duplicados...');
  let removed = 0;
  
  duplicateFiles.forEach(({ keep, remove }) => {
    const keepPath = path.join(__dirname, '..', keep);
    const removePath = path.join(__dirname, '..', remove);
    
    // Verificar que el archivo a mantener existe
    if (fs.existsSync(keepPath)) {
      if (safeDelete(remove)) {
        removed++;
      }
    } else {
      console.log(`  ⚠️ Archivo a mantener no existe: ${keep}`);
    }
  });
  
  console.log(`✅ Archivos duplicados eliminados: ${removed}/${duplicateFiles.length}`);
  return removed;
}

function cleanupObsolete() {
  console.log('\n🗑️ Eliminando archivos obsoletos...');
  let removed = 0;
  
  obsoleteFiles.forEach(file => {
    if (safeDelete(file)) {
      removed++;
    }
  });
  
  console.log(`✅ Archivos obsoletos eliminados: ${removed}/${obsoleteFiles.length}`);
  return removed;
}

function cleanupEmpty() {
  console.log('\n📄 Eliminando archivos vacíos...');
  let removed = 0;
  
  emptyFiles.forEach(file => {
    if (safeDelete(file)) {
      removed++;
    }
  });
  
  console.log(`✅ Archivos vacíos eliminados: ${removed}/${emptyFiles.length}`);
  return removed;
}

function backupCorruptFiles() {
  console.log('\n🔧 Respaldando archivos corruptos...');
  let backed = 0;
  
  corruptFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    const backupPath = fullPath + '.corrupted.bak';
    
    try {
      if (fs.existsSync(fullPath)) {
        fs.copyFileSync(fullPath, backupPath);
        console.log(`  ✅ Respaldado: ${file} → ${file}.corrupted.bak`);
        backed++;
      }
    } catch (error) {
      console.log(`  ❌ Error respaldando ${file}: ${error.message}`);
    }
  });
  
  console.log(`✅ Archivos corruptos respaldados: ${backed}/${corruptFiles.length}`);
  return backed;
}

function cleanupEmptyDirectories() {
  console.log('\n📁 Eliminando directorios vacíos...');
  
  const emptyDirs = ['docs/tests'];
  let removed = 0;
  
  emptyDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    try {
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        if (files.length === 0) {
          fs.rmdirSync(fullPath);
          console.log(`  ✅ Eliminado directorio vacío: ${dir}`);
          removed++;
        } else {
          console.log(`  ⚠️ Directorio no vacío: ${dir} (${files.length} archivos)`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error eliminando directorio ${dir}: ${error.message}`);
    }
  });
  
  console.log(`✅ Directorios vacíos eliminados: ${removed}/${emptyDirs.length}`);
  return removed;
}

async function main() {
  console.log('🚀 FASE 2: LIMPIEZA DE ARCHIVOS');
  console.log('='.repeat(50));
  
  const stats = {
    duplicates: cleanupDuplicates(),
    obsolete: cleanupObsolete(),
    empty: cleanupEmpty(),
    corrupt: backupCorruptFiles(),
    directories: cleanupEmptyDirectories()
  };
  
  console.log('\n📊 RESUMEN DE LIMPIEZA:');
  console.log(`- Archivos duplicados eliminados: ${stats.duplicates}`);
  console.log(`- Archivos obsoletos eliminados: ${stats.obsolete}`);
  console.log(`- Archivos vacíos eliminados: ${stats.empty}`);
  console.log(`- Archivos corruptos respaldados: ${stats.corrupt}`);
  console.log(`- Directorios vacíos eliminados: ${stats.directories}`);
  
  const total = stats.duplicates + stats.obsolete + stats.empty + stats.directories;
  console.log(`\n✅ Total de elementos limpiados: ${total}`);
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. Verificar que el proyecto sigue compilando');
  console.log('2. Ejecutar tests para validar integridad');
  console.log('3. Continuar con FASE 3: Dependencias');
}

main();
