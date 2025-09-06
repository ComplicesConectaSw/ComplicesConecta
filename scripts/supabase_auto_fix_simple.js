/**
 * SISTEMA AUTOMÁTICO DE CORRECCIÓN SUPABASE - VERSIÓN SIMPLIFICADA
 * ComplicesConecta v2.1.2 - Auto-Fix System
 * Fecha: 06 de septiembre, 2025 - 05:27 hrs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
let supabaseUrl, supabaseServiceKey;

try {
  const envContent = fs.readFileSync('.env', 'utf8');
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

// 🔍 AUDITORÍA COMPLETA
async function auditDatabase() {
  console.log('🔍 INICIANDO AUDITORÍA AUTOMÁTICA DE SUPABASE');
  console.log('='.repeat(60));
  
  const auditResults = {
    timestamp: new Date().toISOString(),
    score: 0,
    maxScore: 800,
    categories: {
      tables: { score: 0, max: 100, issues: [] },
      functions: { score: 0, max: 100, issues: [] },
      rls: { score: 0, max: 100, issues: [] },
      buckets: { score: 0, max: 100, issues: [] },
      indexes: { score: 0, max: 100, issues: [] }
    },
    fixes: []
  };

  try {
    // 1. Auditar Tablas Críticas
    console.log('\n📊 Auditando tablas críticas...');
    const { data: tablesData, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    });
    
    const existingTables = tablesError ? [] : tablesData.map(row => row.tablename);
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

    // 2. Auditar Funciones Críticas
    console.log('⚙️ Auditando funciones críticas...');
    const { data: functionsData, error: functionsError } = await supabase.rpc('exec_sql', {
      sql: "SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')"
    });
    
    const existingFunctions = functionsError ? [] : functionsData.map(row => row.proname);
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

    // 3. Auditar RLS
    console.log('🔐 Auditando Row Level Security...');
    const tablesWithoutRLS = [];
    for (const table of existingTables.filter(t => CRITICAL_TABLES.includes(t))) {
      const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
        sql: `SELECT rowsecurity FROM pg_tables WHERE tablename = '${table}'`
      });
      
      if (!rlsError && (!rlsData?.[0]?.rowsecurity)) {
        tablesWithoutRLS.push(table);
      }
    }
    
    const validTables = existingTables.filter(t => CRITICAL_TABLES.includes(t));
    auditResults.categories.rls.score = validTables.length > 0 ? Math.round(
      ((validTables.length - tablesWithoutRLS.length) / validTables.length) * 100
    ) : 0;
    
    if (tablesWithoutRLS.length > 0) {
      auditResults.categories.rls.issues.push(`Tablas sin RLS: ${tablesWithoutRLS.join(', ')}`);
      auditResults.fixes.push({
        type: 'ENABLE_RLS',
        tables: tablesWithoutRLS,
        priority: 'CRITICAL'
      });
    }

    // 4. Auditar Storage Buckets
    console.log('🗂️ Auditando storage buckets...');
    const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
    const existingBuckets = bucketsError ? [] : bucketsData;
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

    // 5. Auditar Índices
    console.log('📈 Auditando índices de performance...');
    const { data: indexesData, error: indexesError } = await supabase.rpc('exec_sql', {
      sql: "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'"
    });
    
    const customIndexes = indexesError ? [] : indexesData;
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
    console.log('='.repeat(30));
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

  } catch (error) {
    console.error('❌ Error durante auditoría:', error.message);
    return auditResults;
  }
}

// 🛠️ GENERAR SCRIPTS DE CORRECCIÓN
async function generateFixScripts(auditResults) {
  console.log('\n🛠️ GENERANDO SCRIPTS DE CORRECCIÓN');
  console.log('='.repeat(40));
  
  const fixScripts = {
    database: [],
    rls: [],
    buckets: [],
    indexes: []
  };

  // Procesar cada corrección
  for (const fix of auditResults.fixes) {
    console.log(`🔧 Generando: ${fix.type} (Prioridad: ${fix.priority})`);
    
    switch (fix.type) {
      case 'CREATE_TABLES':
        fixScripts.database.push(generateCreateTablesSQL(fix.tables));
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
  await saveFixFiles(fixScripts);
  
  return fixScripts;
}

// 📝 GENERAR REPORTE FINAL
async function generateFinalReport(auditResults, fixScripts) {
  const finalPercentage = Math.round((auditResults.score / auditResults.maxScore) * 100);
  
  const report = {
    timestamp: new Date().toISOString(),
    score: finalPercentage,
    fixesApplied: auditResults.fixes.length,
    scriptsGenerated: Object.keys(fixScripts).filter(key => fixScripts[key].length > 0).length,
    status: getFinalStatus(finalPercentage)
  };

  const reportContent = `# 🔧 Reporte de Corrección Automática Supabase

**Fecha:** ${new Date().toLocaleString('es-ES')}  
**Sistema:** ComplicesConecta v2.1.2 - Auto-Fix System  

## 📊 Resumen Ejecutivo

- **Puntuación Actual:** ${report.score}/100
- **Estado:** ${report.status}
- **Correcciones Identificadas:** ${report.fixesApplied}
- **Scripts Generados:** ${report.scriptsGenerated}

## 🛠️ Correcciones Identificadas

${auditResults.fixes.map(fix => `- **${fix.type}**: ${fix.priority} priority`).join('\n')}

## 📈 Puntuación por Categoría

| Categoría | Puntuación | Estado |
|-----------|------------|--------|
| Tablas | ${auditResults.categories.tables.score}/100 | ${auditResults.categories.tables.score >= 90 ? '✅' : auditResults.categories.tables.score >= 70 ? '⚠️' : '❌'} |
| Funciones | ${auditResults.categories.functions.score}/100 | ${auditResults.categories.functions.score >= 90 ? '✅' : auditResults.categories.functions.score >= 70 ? '⚠️' : '❌'} |
| RLS | ${auditResults.categories.rls.score}/100 | ${auditResults.categories.rls.score >= 90 ? '✅' : auditResults.categories.rls.score >= 70 ? '⚠️' : '❌'} |
| Buckets | ${auditResults.categories.buckets.score}/100 | ${auditResults.categories.buckets.score >= 90 ? '✅' : auditResults.categories.buckets.score >= 70 ? '⚠️' : '❌'} |
| Índices | ${auditResults.categories.indexes.score}/100 | ${auditResults.categories.indexes.score >= 90 ? '✅' : auditResults.categories.indexes.score >= 70 ? '⚠️' : '❌'} |

## 🚀 Próximos Pasos

${report.score >= 95 ? 
  '✅ Sistema listo para producción inmediata' : 
  '⚠️ Ejecutar scripts generados y re-validar'
}

## 📋 Scripts Generados

${Object.keys(fixScripts).filter(key => fixScripts[key].length > 0).map(key => 
  `- scripts/auto_fix_${key}.sql`
).join('\n')}

---
*Generado automáticamente por el Sistema de Corrección Supabase*
`;

  // Guardar reporte
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  
  fs.writeFileSync('reports/auto_fix_report.md', reportContent);
  fs.writeFileSync('reports/auto_fix_data.json', JSON.stringify({
    auditResults,
    fixScripts,
    report
  }, null, 2));

  return report;
}

// 🔧 FUNCIONES AUXILIARES
function generateCreateTablesSQL(tables) {
  return `-- Crear tablas faltantes\n${tables.map(table => `-- TODO: Crear tabla ${table}`).join('\n')}`;
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

async function saveFixFiles(fixScripts) {
  const scriptsDir = 'scripts';
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // Generar archivos de corrección
  Object.keys(fixScripts).forEach(key => {
    if (fixScripts[key].length > 0) {
      fs.writeFileSync(path.join(scriptsDir, `auto_fix_${key}.sql`), fixScripts[key].join('\n\n'));
      console.log(`✅ Generado: scripts/auto_fix_${key}.sql`);
    }
  });
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
    console.log('='.repeat(60));

    // Paso 1: Auditoría
    const auditResults = await auditDatabase();
    
    // Paso 2: Generar scripts de corrección
    const fixScripts = await generateFixScripts(auditResults);
    
    // Paso 3: Generar reporte final
    const report = await generateFinalReport(auditResults, fixScripts);
    
    console.log('\n🎉 SISTEMA AUTOMÁTICO COMPLETADO');
    console.log('='.repeat(35));
    console.log(`📊 Puntuación: ${report.score}/100`);
    console.log(`📁 Reporte: reports/auto_fix_report.md`);
    console.log(`🔧 Scripts: ${report.scriptsGenerated} archivos generados`);
    console.log(`🚀 Estado: ${report.status}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error en sistema automático:', error.message);
    process.exit(1);
  }
}

// Ejecutar
runAutoFixSystem();
