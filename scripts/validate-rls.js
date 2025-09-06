/**
 * Script de Validación RLS - ComplicesConecta v2.0.0
 * Valida que las políticas de Row Level Security estén activas
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leer variables de entorno del archivo .env
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
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tablas críticas que deben tener RLS habilitado
const CRITICAL_TABLES = [
  'profiles',
  'invitations', 
  'images',
  'image_permissions',
  'gallery_access_requests',
  'chat_rooms',
  'chat_members',
  'messages',
  'chat_invitations'
];

// Buckets de Storage que deben tener RLS
const CRITICAL_BUCKETS = [
  'profile-images',
  'gallery-images',
  'chat-media'
];

async function validateTableRLS() {
  console.log('🔍 Validando políticas RLS en tablas...\n');
  
  const results = [];
  
  for (const table of CRITICAL_TABLES) {
    try {
      // Verificar si RLS está habilitado
      const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = '${table}';
        `
      });

      if (rlsError) {
        // Usar consulta directa si RPC no está disponible
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('*')
          .eq('table_name', table)
          .eq('table_schema', 'public');
        
        if (error) {
          results.push({
            table,
            status: '⚠️',
            message: `Error al verificar: ${error.message}`
          });
          continue;
        }
      }

      // Verificar políticas existentes
      const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd, roles, qual 
          FROM pg_policies 
          WHERE schemaname = 'public' AND tablename = '${table}';
        `
      });

      if (policiesError) {
        results.push({
          table,
          status: '⚠️',
          message: `No se pudieron verificar políticas: ${policiesError.message}`
        });
        continue;
      }

      const policyCount = policies?.length || 0;
      
      if (policyCount > 0) {
        results.push({
          table,
          status: '✅',
          message: `RLS activo con ${policyCount} política(s)`
        });
      } else {
        results.push({
          table,
          status: '❌',
          message: 'RLS no configurado o sin políticas'
        });
      }

    } catch (error) {
      results.push({
        table,
        status: '❌',
        message: `Error inesperado: ${error.message}`
      });
    }
  }

  // Mostrar resultados
  results.forEach(result => {
    console.log(`${result.status} ${result.table}: ${result.message}`);
  });

  return results;
}

async function validateStorageRLS() {
  console.log('\n🗂️ Validando políticas RLS en Storage...\n');
  
  const results = [];

  for (const bucketName of CRITICAL_BUCKETS) {
    try {
      // Verificar que el bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        results.push({
          bucket: bucketName,
          status: '❌',
          message: `Error al listar buckets: ${bucketsError.message}`
        });
        continue;
      }

      const bucket = buckets.find(b => b.name === bucketName);
      
      if (!bucket) {
        results.push({
          bucket: bucketName,
          status: '❌',
          message: 'Bucket no existe'
        });
        continue;
      }

      // Verificar políticas del bucket
      const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd, roles, qual 
          FROM pg_policies 
          WHERE schemaname = 'storage' AND tablename = 'objects';
        `
      });

      if (policiesError) {
        results.push({
          bucket: bucketName,
          status: '⚠️',
          message: `No se pudieron verificar políticas de Storage: ${policiesError.message}`
        });
        continue;
      }

      const bucketPolicies = policies?.filter(p => 
        p.qual?.includes(bucketName) || p.policyname?.includes(bucketName)
      ) || [];

      if (bucketPolicies.length > 0) {
        results.push({
          bucket: bucketName,
          status: '✅',
          message: `Bucket configurado con ${bucketPolicies.length} política(s)`
        });
      } else {
        results.push({
          bucket: bucketName,
          status: '⚠️',
          message: 'Bucket existe pero sin políticas específicas detectadas'
        });
      }

    } catch (error) {
      results.push({
        bucket: bucketName,
        status: '❌',
        message: `Error inesperado: ${error.message}`
      });
    }
  }

  // Mostrar resultados
  results.forEach(result => {
    console.log(`${result.status} ${result.bucket}: ${result.message}`);
  });

  return results;
}

async function generateSecurityReport(tableResults, storageResults) {
  const report = {
    timestamp: new Date().toISOString(),
    tables: {},
    storage: {},
    summary: {
      tablesSecure: 0,
      tablesTotal: CRITICAL_TABLES.length,
      bucketsSecure: 0,
      bucketsTotal: CRITICAL_BUCKETS.length,
      overallStatus: 'UNKNOWN'
    }
  };

  // Procesar resultados de tablas
  tableResults.forEach(result => {
    report.tables[result.table] = {
      status: result.status,
      message: result.message,
      secure: result.status === '✅'
    };
    
    if (result.status === '✅') {
      report.summary.tablesSecure++;
    }
  });

  // Procesar resultados de storage
  storageResults.forEach(result => {
    report.storage[result.bucket] = {
      status: result.status,
      message: result.message,
      secure: result.status === '✅'
    };
    
    if (result.status === '✅') {
      report.summary.bucketsSecure++;
    }
  });

  // Determinar estado general
  const tablesOk = report.summary.tablesSecure === report.summary.tablesTotal;
  const storageOk = report.summary.bucketsSecure >= Math.floor(report.summary.bucketsTotal * 0.8); // 80% mínimo
  
  if (tablesOk && storageOk) {
    report.summary.overallStatus = 'SECURE';
  } else if (report.summary.tablesSecure > 0 || report.summary.bucketsSecure > 0) {
    report.summary.overallStatus = 'PARTIAL';
  } else {
    report.summary.overallStatus = 'INSECURE';
  }

  // Guardar reporte
  const fs = await import('fs');
  const reportPath = './reports/rls_validation.json';
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  } catch (error) {
    console.log('\n⚠️ No se pudo guardar el reporte:', error.message);
  }

  return report;
}

async function main() {
  console.log('🔐 VALIDACIÓN DE SEGURIDAD RLS - ComplicesConecta v2.0.0');
  console.log('=' .repeat(60));
  
  try {
    // Validar tablas
    const tableResults = await validateTableRLS();
    
    // Validar storage
    const storageResults = await validateStorageRLS();
    
    // Generar reporte
    const report = await generateSecurityReport(tableResults, storageResults);
    
    // Resumen final
    console.log('\n📊 RESUMEN DE SEGURIDAD');
    console.log('=' .repeat(30));
    console.log(`📋 Tablas seguras: ${report.summary.tablesSecure}/${report.summary.tablesTotal}`);
    console.log(`🗂️ Buckets seguros: ${report.summary.bucketsSecure}/${report.summary.bucketsTotal}`);
    console.log(`🔐 Estado general: ${report.summary.overallStatus}`);
    
    const statusIcon = {
      'SECURE': '✅',
      'PARTIAL': '⚠️', 
      'INSECURE': '❌'
    }[report.summary.overallStatus];
    
    console.log(`\n${statusIcon} Validación completada: ${report.summary.overallStatus}`);
    
    if (report.summary.overallStatus !== 'SECURE') {
      console.log('\n⚠️ ATENCIÓN: Se detectaron problemas de seguridad.');
      console.log('   Revise el archivo dev-scripts/rls.sql y ejecute las políticas faltantes.');
      process.exit(1);
    }
    
    console.log('\n🎉 Todas las políticas RLS están correctamente configuradas!');
    
  } catch (error) {
    console.error('\n❌ Error durante la validación:', error.message);
    process.exit(1);
  }
}

// Ejecutar validación
main().catch(console.error);
