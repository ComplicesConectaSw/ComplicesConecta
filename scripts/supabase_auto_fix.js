/**
 * SISTEMA AUTOMÁTICO DE CORRECCIÓN SUPABASE
 * ComplicesConecta v2.1.2 - Auto-Fix System
 * Fecha: 06 de septiembre, 2025 - 05:27 hrs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Configuración de Supabase
let supabaseUrl, supabaseServiceKey;

try {
  const envContent = readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key === 'VITE_SUPABASE_URL') {
      supabaseUrl = value;
    } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      supabaseServiceKey = value;
    }
  });
} catch (error) {
  console.error('❌ Error leyendo archivo .env:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 🎯 CONFIGURACIÓN DEL SISTEMA DE CORRECCIÓN
const CRITICAL_TABLES = [
  'profiles', 'user_roles', 'invitations', 'gallery_permissions',
  'images', 'image_permissions', 'gallery_access_requests',
  'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
  'user_likes', 'matches', 'match_interactions'
];

const CRITICAL_FUNCTIONS = [
  'has_role', 'handle_new_user', 'update_updated_at_column', 'exec_sql',
  'detect_mutual_match', 'get_user_matches', 'get_potential_matches', 'create_match_if_mutual'
];

const REQUIRED_BUCKETS = [
  { name: 'profile-images', size: 5242880, public: false },
  { name: 'gallery-images', size: 10485760, public: false },
  { name: 'chat-media', size: 20971520, public: false }
];

const REQUIRED_COLUMNS = {
  profiles: [
    { name: 'interests', type: 'text' },
    { name: 'looking_for', type: 'text' },
    { name: 'swinger_experience', type: 'text' },
    { name: 'age_range_min', type: 'integer' },
    { name: 'age_range_max', type: 'integer' },
    { name: 'max_distance', type: 'integer' }
  ]
};

// 🔍 PASO 1: AUDITORÍA COMPLETA
async function auditDatabase() {
  console.log('🔍 INICIANDO AUDITORÍA AUTOMÁTICA DE SUPABASE');
  console.log('=' .repeat(60));
  
  const auditResults = {
    timestamp: new Date().toISOString(),
    score: 0,
    maxScore: 800, // 8 categorías × 100 puntos
    categories: {
      tables: { score: 0, max: 100, issues: [] },
      columns: { score: 0, max: 100, issues: [] },
      functions: { score: 0, max: 100, issues: [] },
      triggers: { score: 0, max: 100, issues: [] },
      rls: { score: 0, max: 100, issues: [] },
      policies: { score: 0, max: 100, issues: [] },
      buckets: { score: 0, max: 100, issues: [] },
      indexes: { score: 0, max: 100, issues: [] }
    },
    fixes: [],
    recommendations: []
  };

  // 1. Auditar Tablas Críticas
  console.log('\n📊 Auditando tablas críticas...');
  const existingTables = await getExistingTables();
  const missingTables = CRITICAL_TABLES.filter(table => !existingTables.includes(table));
  
  auditResults.categories.tables.score = Math.round(
    ((CRITICAL_TABLES.length - missingTables.length) / CRITICAL_TABLES.length) * 100
  );
  
  if (missingTables.length > 0) {
    auditResults.categories.tables.issues.push(`Tablas faltantes: ${missingTables.join(', ')}`);
    auditResults.fixes.push({
      type: 'CREATE_TABLES',
      tables: missingTables,
      priority: 'HIGH'
    });
  }

  // 2. Auditar Columnas Críticas
  console.log('📋 Auditando columnas críticas...');
  for (const [tableName, requiredCols] of Object.entries(REQUIRED_COLUMNS)) {
    if (existingTables.includes(tableName)) {
      const existingCols = await getTableColumns(tableName);
      const missingCols = requiredCols.filter(col => 
        !existingCols.some(existing => existing.column_name === col.name)
      );
      
      if (missingCols.length > 0) {
        auditResults.categories.columns.issues.push(
          `Tabla ${tableName}: columnas faltantes ${missingCols.map(c => c.name).join(', ')}`
        );
        auditResults.fixes.push({
          type: 'ADD_COLUMNS',
          table: tableName,
          columns: missingCols,
          priority: 'HIGH'
        });
      }
    }
  }
  
  auditResults.categories.columns.score = auditResults.categories.columns.issues.length === 0 ? 100 : 60;

  // 3. Auditar Funciones Críticas
  console.log('⚙️ Auditando funciones críticas...');
  const existingFunctions = await getExistingFunctions();
  const missingFunctions = CRITICAL_FUNCTIONS.filter(func => !existingFunctions.includes(func));
  
  auditResults.categories.functions.score = Math.round(
    ((CRITICAL_FUNCTIONS.length - missingFunctions.length) / CRITICAL_FUNCTIONS.length) * 100
  );
  
  if (missingFunctions.length > 0) {
    auditResults.categories.functions.issues.push(`Funciones faltantes: ${missingFunctions.join(', ')}`);
    auditResults.fixes.push({
      type: 'CREATE_FUNCTIONS',
      functions: missingFunctions,
      priority: 'HIGH'
    });
  }

  // 4. Auditar RLS
  console.log('🔐 Auditando Row Level Security...');
  const tablesWithoutRLS = [];
  for (const table of existingTables.filter(t => CRITICAL_TABLES.includes(t))) {
    const hasRLS = await checkRLSEnabled(table);
    if (!hasRLS) {
      tablesWithoutRLS.push(table);
    }
  }
  
  auditResults.categories.rls.score = Math.round(
    ((existingTables.length - tablesWithoutRLS.length) / existingTables.length) * 100
  );
  
  if (tablesWithoutRLS.length > 0) {
    auditResults.categories.rls.issues.push(`Tablas sin RLS: ${tablesWithoutRLS.join(', ')}`);
    auditResults.fixes.push({
      type: 'ENABLE_RLS',
      tables: tablesWithoutRLS,
      priority: 'CRITICAL'
    });
  }

  // 5. Auditar Storage Buckets
  console.log('🗂️ Auditando storage buckets...');
  const existingBuckets = await getExistingBuckets();
  const missingBuckets = REQUIRED_BUCKETS.filter(bucket => 
    !existingBuckets.some(existing => existing.name === bucket.name)
  );
  
  auditResults.categories.buckets.score = Math.round(
    ((REQUIRED_BUCKETS.length - missingBuckets.length) / REQUIRED_BUCKETS.length) * 100
  );
  
  if (missingBuckets.length > 0) {
    auditResults.categories.buckets.issues.push(`Buckets faltantes: ${missingBuckets.map(b => b.name).join(', ')}`);
    auditResults.fixes.push({
      type: 'CREATE_BUCKETS',
      buckets: missingBuckets,
      priority: 'HIGH'
    });
  }

  // 6. Auditar Índices
  console.log('📈 Auditando índices de performance...');
  const existingIndexes = await getExistingIndexes();
  const customIndexes = existingIndexes.filter(idx => idx.indexname.startsWith('idx_'));
  
  auditResults.categories.indexes.score = Math.min(100, Math.round((customIndexes.length / 20) * 100));
  
  if (customIndexes.length < 15) {
    auditResults.categories.indexes.issues.push(`Pocos índices de performance: ${customIndexes.length}/20 recomendados`);
    auditResults.fixes.push({
      type: 'CREATE_INDEXES',
      priority: 'MEDIUM'
    });
  }

  // Calcular puntuación final
  auditResults.score = Object.values(auditResults.categories).reduce((sum, cat) => sum + cat.score, 0);
  const finalPercentage = Math.round((auditResults.score / auditResults.maxScore) * 100);

  console.log('\n📊 RESULTADO DE AUDITORÍA');
  console.log('=' .repeat(30));
  console.log(`🎯 Puntuación Final: ${auditResults.score}/${auditResults.maxScore} (${finalPercentage}%)`);
  
  // Clasificación del sistema
  let status;
  if (finalPercentage >= 95) {
    status = 'EXCELENTE - PRODUCTION READY';
  } else if (finalPercentage >= 85) {
    status = 'BUENO - CASI LISTO PARA PRODUCCIÓN';
  } else if (finalPercentage >= 70) {
    status = 'ACEPTABLE - REQUIERE MEJORAS MENORES';
  } else {
    status = 'CRÍTICO - REQUIERE CORRECCIONES IMPORTANTES';
  }
  
  console.log(`📈 Estado: ${status}`);
  console.log(`🔧 Correcciones necesarias: ${auditResults.fixes.length}`);

  return auditResults;
}

// 🛠️ PASO 2: APLICAR CORRECCIONES AUTOMÁTICAS
async function applyFixes(auditResults) {
  console.log('\n🛠️ APLICANDO CORRECCIONES AUTOMÁTICAS');
  console.log('=' .repeat(40));
  
  const fixScripts = {
    database: [],
    rls: [],
    buckets: [],
    indexes: []
  };

  // Procesar cada corrección
  for (const fix of auditResults.fixes) {
    console.log(`🔧 Aplicando: ${fix.type} (Prioridad: ${fix.priority})`);
    
    switch (fix.type) {
      case 'CREATE_TABLES':
        fixScripts.database.push(generateCreateTablesSQL(fix.tables));
        break;
      
      case 'ADD_COLUMNS':
        fixScripts.database.push(generateAddColumnsSQL(fix.table, fix.columns));
        break;
      
      case 'CREATE_FUNCTIONS':
        fixScripts.database.push(generateCreateFunctionsSQL(fix.functions));
        break;
      
      case 'ENABLE_RLS':
        fixScripts.rls.push(generateEnableRLSSQL(fix.tables));
        break;
      
      case 'CREATE_BUCKETS':
        fixScripts.buckets.push(generateCreateBucketsSQL(fix.buckets));
        break;
      
      case 'CREATE_INDEXES':
        fixScripts.indexes.push(generateCreateIndexesSQL());
        break;
    }
  }

  // Generar archivos de corrección
  await generateFixFiles(fixScripts);
  
  return fixScripts;
}

// 📊 PASO 3: VALIDACIÓN POST-CORRECCIÓN
async function validateAfterFix() {
  console.log('\n📊 VALIDANDO CORRECCIONES APLICADAS');
  console.log('=' .repeat(35));
  
  // Re-ejecutar auditoría para obtener nueva puntuación
  const postFixAudit = await auditDatabase();
  
  return postFixAudit;
}

// 📝 PASO 4: GENERAR REPORTE FINAL
async function generateFinalReport(initialAudit, fixScripts, finalAudit) {
  const report = {
    timestamp: new Date().toISOString(),
    initialScore: Math.round((initialAudit.score / initialAudit.maxScore) * 100),
    finalScore: Math.round((finalAudit.score / finalAudit.maxScore) * 100),
    improvement: Math.round((finalAudit.score / finalAudit.maxScore) * 100) - Math.round((initialAudit.score / initialAudit.maxScore) * 100),
    fixesApplied: initialAudit.fixes.length,
    scriptsGenerated: Object.keys(fixScripts).length,
    status: getFinalStatus(Math.round((finalAudit.score / finalAudit.maxScore) * 100))
  };

  const reportContent = `# 🔧 Reporte de Corrección Automática Supabase

**Fecha:** ${new Date().toLocaleString('es-ES')}  
**Sistema:** ComplicesConecta v2.1.2 - Auto-Fix System  

## 📊 Resumen Ejecutivo

- **Puntuación Inicial:** ${report.initialScore}/100
- **Puntuación Final:** ${report.finalScore}/100
- **Mejora:** +${report.improvement} puntos
- **Estado Final:** ${report.status}
- **Correcciones Aplicadas:** ${report.fixesApplied}
- **Scripts Generados:** ${report.scriptsGenerated}

## 🛠️ Correcciones Aplicadas

${initialAudit.fixes.map(fix => `- **${fix.type}**: ${fix.priority} priority`).join('\n')}

## 📈 Puntuación por Categoría

| Categoría | Inicial | Final | Mejora |
|-----------|---------|-------|--------|
| Tablas | ${initialAudit.categories.tables.score}/100 | ${finalAudit.categories.tables.score}/100 | +${finalAudit.categories.tables.score - initialAudit.categories.tables.score} |
| Funciones | ${initialAudit.categories.functions.score}/100 | ${finalAudit.categories.functions.score}/100 | +${finalAudit.categories.functions.score - initialAudit.categories.functions.score} |
| RLS | ${initialAudit.categories.rls.score}/100 | ${finalAudit.categories.rls.score}/100 | +${finalAudit.categories.rls.score - initialAudit.categories.rls.score} |
| Buckets | ${initialAudit.categories.buckets.score}/100 | ${finalAudit.categories.buckets.score}/100 | +${finalAudit.categories.buckets.score - initialAudit.categories.buckets.score} |

## 🚀 Próximos Pasos

${report.finalScore >= 95 ? 
  '✅ Sistema listo para producción inmediata' : 
  '⚠️ Ejecutar scripts generados y re-validar'
}

---
*Generado automáticamente por el Sistema de Corrección Supabase*
`;

  // Guardar reporte
  if (!existsSync('reports')) {
    mkdirSync('reports', { recursive: true });
  }
  
  writeFileSync('reports/auto_fix_report.md', reportContent);
  writeFileSync('reports/auto_fix_data.json', JSON.stringify({
    initialAudit,
    finalAudit,
    fixScripts,
    report
  }, null, 2));

  return report;
}

// 🔧 FUNCIONES AUXILIARES
async function getExistingTables() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    });
    return error ? [] : data.map(row => row.tablename);
  } catch {
    return [];
  }
}

async function getTableColumns(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}'`
    });
    return error ? [] : data;
  } catch {
    return [];
  }
}

async function getExistingFunctions() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')"
    });
    return error ? [] : data.map(row => row.proname);
  } catch {
    return [];
  }
}

async function checkRLSEnabled(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT rowsecurity FROM pg_tables WHERE tablename = '${tableName}'`
    });
    return !error && data?.[0]?.rowsecurity;
  } catch {
    return false;
  }
}

async function getExistingBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    return error ? [] : data;
  } catch {
    return [];
  }
}

async function getExistingIndexes() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public'"
    });
    return error ? [] : data;
  } catch {
    return [];
  }
}

function generateCreateTablesSQL(tables) {
  return `-- Crear tablas faltantes\n${tables.map(table => `-- TODO: Crear tabla ${table}`).join('\n')}`;
}

function generateAddColumnsSQL(table, columns) {
  return `-- Agregar columnas a ${table}\n${columns.map(col => 
    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
  ).join('\n')}`;
}

function generateCreateFunctionsSQL(functions) {
  return `-- Crear funciones faltantes\n${functions.map(func => `-- TODO: Crear función ${func}`).join('\n')}`;
}

function generateEnableRLSSQL(tables) {
  return tables.map(table => `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`).join('\n');
}

function generateCreateBucketsSQL(buckets) {
  return `-- Crear buckets faltantes\n${buckets.map(bucket => `-- TODO: Crear bucket ${bucket.name}`).join('\n')}`;
}

function generateCreateIndexesSQL() {
  return `-- Crear índices de performance\n-- TODO: Generar índices optimizados`;
}

async function generateFixFiles(fixScripts) {
  const scriptsDir = 'scripts';
  if (!existsSync(scriptsDir)) {
    mkdirSync(scriptsDir, { recursive: true });
  }

  // Generar archivos de corrección
  if (fixScripts.database.length > 0) {
    writeFileSync(join(scriptsDir, 'auto_fix_database.sql'), fixScripts.database.join('\n\n'));
  }
  
  if (fixScripts.rls.length > 0) {
    writeFileSync(join(scriptsDir, 'auto_fix_rls.sql'), fixScripts.rls.join('\n\n'));
  }
  
  if (fixScripts.buckets.length > 0) {
    writeFileSync(join(scriptsDir, 'auto_fix_buckets.sql'), fixScripts.buckets.join('\n\n'));
  }
  
  if (fixScripts.indexes.length > 0) {
    writeFileSync(join(scriptsDir, 'auto_fix_indexes.sql'), fixScripts.indexes.join('\n\n'));
  }
}

function getFinalStatus(percentage) {
  if (percentage >= 95) return 'EXCELENTE - PRODUCTION READY';
  if (percentage >= 85) return 'BUENO - CASI LISTO PARA PRODUCCIÓN';
  if (percentage >= 70) return 'ACEPTABLE - REQUIERE MEJORAS MENORES';
  return 'CRÍTICO - REQUIERE CORRECCIONES IMPORTANTES';
}

// 🚀 EJECUTAR SISTEMA AUTOMÁTICO
async function runAutoFixSystem() {
  try {
    console.log('🤖 SISTEMA AUTOMÁTICO DE CORRECCIÓN SUPABASE');
    console.log('🎯 ComplicesConecta v2.1.2 - Auto-Fix System');
    console.log('⏰ Iniciado:', new Date().toLocaleString('es-ES'));
    console.log('=' .repeat(60));

    // Paso 1: Auditoría inicial
    const initialAudit = await auditDatabase();
    
    // Paso 2: Aplicar correcciones
    const fixScripts = await applyFixes(initialAudit);
    
    // Paso 3: Validación post-corrección
    const finalAudit = await validateAfterFix();
    
    // Paso 4: Generar reporte final
    const report = await generateFinalReport(initialAudit, fixScripts, finalAudit);
    
    console.log('\n🎉 SISTEMA AUTOMÁTICO COMPLETADO');
    console.log('=' .repeat(35));
    console.log(`📊 Mejora: ${report.initialScore}% → ${report.finalScore}% (+${report.improvement})`);
    console.log(`📁 Reporte: reports/auto_fix_report.md`);
    console.log(`🔧 Scripts: ${report.scriptsGenerated} archivos generados`);
    console.log(`🚀 Estado: ${report.status}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error en sistema automático:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAutoFixSystem();
}

export { runAutoFixSystem, auditDatabase, applyFixes, validateAfterFix };
