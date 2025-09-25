/**
 * Script de Auditoría de Base de Datos - ComplicesConecta v2.1.1
 * Verifica el estado actual de la base de datos y identifica migraciones faltantes
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

// Tablas críticas que deben existir
const REQUIRED_TABLES = [
  'profiles',
  'user_roles', 
  'invitations',
  'gallery_permissions',
  'images',
  'image_permissions',
  'gallery_access_requests',
  'chat_rooms',
  'chat_members',
  'messages',
  'chat_invitations'
];

// Columnas críticas por tabla
const REQUIRED_COLUMNS = {
  profiles: ['id', 'first_name', 'last_name', 'email', 'avatar_url', 'interests', 'profile_type'],
  user_roles: ['id', 'user_id', 'role'],
  invitations: ['id', 'from_profile', 'to_profile', 'status', 'type'],
  gallery_permissions: ['id', 'profile_id', 'granted_to', 'granted_by'],
  images: ['id', 'profile_id', 'url', 'is_public', 'type'],
  chat_rooms: ['id', 'name', 'is_public', 'created_by'],
  chat_members: ['id', 'room_id', 'profile_id', 'role'],
  messages: ['id', 'room_id', 'sender_id', 'content', 'message_type']
};

// Buckets de Storage requeridos
const REQUIRED_BUCKETS = [
  'profile-images',
  'gallery-images', 
  'chat-media'
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
}

async function checkTableColumns(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      return null;
    }

    return data || [];
  } catch (error) {
    return null;
  }
}

async function checkRLSEnabled(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '${tableName}';
      `
    });

    if (error) {
      return false;
    }

    return data?.[0]?.rowsecurity || false;
  } catch (error) {
    return false;
  }
}

async function checkRLSPolicies(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, cmd, roles, qual 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = '${tableName}';
      `
    });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

async function checkStorageBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return [];
    }

    return buckets || [];
  } catch (error) {
    return [];
  }
}

async function auditDatabase() {
  console.log('🔍 AUDITORÍA DE BASE DE DATOS - ComplicesConecta v2.1.1');
  console.log('=' .repeat(60));
  
  const auditResults = {
    timestamp: new Date().toISOString(),
    tables: {},
    storage: {},
    summary: {
      tablesExist: 0,
      tablesTotal: REQUIRED_TABLES.length,
      rlsEnabled: 0,
      bucketsExist: 0,
      bucketsTotal: REQUIRED_BUCKETS.length,
      criticalIssues: [],
      recommendations: []
    }
  };

  // Auditar tablas
  console.log('\n📊 Auditando tablas de la base de datos...\n');
  
  for (const tableName of REQUIRED_TABLES) {
    console.log(`🔍 Verificando tabla: ${tableName}`);
    
    const tableExists = await checkTableExists(tableName);
    const columns = await checkTableColumns(tableName);
    const rlsEnabled = await checkRLSEnabled(tableName);
    const policies = await checkRLSPolicies(tableName);
    
    const requiredColumns = REQUIRED_COLUMNS[tableName] || [];
    const missingColumns = requiredColumns.filter(col => 
      !columns?.some(c => c.column_name === col)
    );

    auditResults.tables[tableName] = {
      exists: tableExists,
      columns: columns?.length || 0,
      missingColumns,
      rlsEnabled,
      policiesCount: policies.length,
      status: tableExists ? '✅' : '❌'
    };

    if (tableExists) {
      auditResults.summary.tablesExist++;
      console.log(`  ✅ Tabla existe (${columns?.length || 0} columnas)`);
      
      if (missingColumns.length > 0) {
        console.log(`  ⚠️ Columnas faltantes: ${missingColumns.join(', ')}`);
        auditResults.summary.criticalIssues.push(`Tabla ${tableName}: columnas faltantes ${missingColumns.join(', ')}`);
      }
      
      if (rlsEnabled) {
        auditResults.summary.rlsEnabled++;
        console.log(`  🔐 RLS habilitado (${policies.length} políticas)`);
      } else {
        console.log(`  ❌ RLS no habilitado`);
        auditResults.summary.criticalIssues.push(`Tabla ${tableName}: RLS no habilitado`);
      }
    } else {
      console.log(`  ❌ Tabla no existe`);
      auditResults.summary.criticalIssues.push(`Tabla ${tableName}: no existe`);
    }
  }

  // Auditar Storage
  console.log('\n🗂️ Auditando buckets de Storage...\n');
  
  const buckets = await checkStorageBuckets();
  
  for (const bucketName of REQUIRED_BUCKETS) {
    console.log(`🔍 Verificando bucket: ${bucketName}`);
    
    const bucketExists = buckets.some(b => b.name === bucketName);
    
    auditResults.storage[bucketName] = {
      exists: bucketExists,
      status: bucketExists ? '✅' : '❌'
    };

    if (bucketExists) {
      auditResults.summary.bucketsExist++;
      console.log(`  ✅ Bucket existe`);
    } else {
      console.log(`  ❌ Bucket no existe`);
      auditResults.summary.criticalIssues.push(`Bucket ${bucketName}: no existe`);
    }
  }

  // Generar recomendaciones
  if (auditResults.summary.tablesExist < auditResults.summary.tablesTotal) {
    auditResults.summary.recommendations.push('Ejecutar migraciones SQL para crear tablas faltantes');
  }
  
  if (auditResults.summary.rlsEnabled < auditResults.summary.tablesExist) {
    auditResults.summary.recommendations.push('Aplicar políticas RLS a tablas sin protección');
  }
  
  if (auditResults.summary.bucketsExist < auditResults.summary.bucketsTotal) {
    auditResults.summary.recommendations.push('Crear buckets de Storage faltantes');
  }

  // Guardar reporte
  if (!existsSync('reports')) {
    mkdirSync('reports', { recursive: true });
  }
  
  const reportPath = join('reports', 'database_audit.json');
  writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));

  // Mostrar resumen
  console.log('\n📊 RESUMEN DE AUDITORÍA');
  console.log('=' .repeat(30));
  console.log(`📋 Tablas existentes: ${auditResults.summary.tablesExist}/${auditResults.summary.tablesTotal}`);
  console.log(`🔐 Tablas con RLS: ${auditResults.summary.rlsEnabled}/${auditResults.summary.tablesExist}`);
  console.log(`🗂️ Buckets existentes: ${auditResults.summary.bucketsExist}/${auditResults.summary.bucketsTotal}`);
  console.log(`❌ Problemas críticos: ${auditResults.summary.criticalIssues.length}`);

  if (auditResults.summary.criticalIssues.length > 0) {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    auditResults.summary.criticalIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  if (auditResults.summary.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    auditResults.summary.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);

  return auditResults;
}

// Ejecutar auditoría
auditDatabase()
  .then(results => {
    const hasIssues = results.summary.criticalIssues.length > 0;
    
    if (hasIssues) {
      console.log('\n❌ Auditoría completada con problemas detectados');
      process.exit(1);
    } else {
      console.log('\n✅ Auditoría completada exitosamente - Base de datos en buen estado');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('\n❌ Error durante la auditoría:', error.message);
    process.exit(1);
  });
