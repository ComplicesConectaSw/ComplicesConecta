/**
 * Script de Validación y Aplicación de Políticas RLS
 * ComplicesConecta v2.1.1 - Seguridad de Base de Datos
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://axtvqnozatbmllvwzuim.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tablas críticas que requieren RLS
const CRITICAL_TABLES = [
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

// Políticas RLS esperadas por tabla
const EXPECTED_POLICIES = {
  profiles: [
    'Profiles are viewable by authenticated users',
    'Users can insert their own profile',
    'Users can update their own profile',
    'Admins can manage all profiles'
  ],
  user_roles: [
    'Users can view their own roles',
    'Admins can manage all roles'
  ],
  invitations: [
    'Users can view their own invitations',
    'Users can send invitations',
    'Users can respond to invitations',
    'Admins can manage all invitations'
  ],
  gallery_permissions: [
    'Users can view their gallery permissions',
    'Users can grant gallery permissions',
    'Admins can manage all gallery permissions'
  ]
};

async function checkTableRLS(tableName) {
  try {
    // Verificar si la tabla existe y tiene RLS habilitado
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity,
          (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = '${tableName}') as policy_count
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '${tableName}';
      `
    });

    if (error) {
      return { 
        table: tableName, 
        exists: false, 
        rls_enabled: false, 
        policies: 0, 
        status: '❌', 
        message: `Error: ${error.message}` 
      };
    }

    if (!data || data.length === 0) {
      return { 
        table: tableName, 
        exists: false, 
        rls_enabled: false, 
        policies: 0, 
        status: '❌', 
        message: 'Tabla no existe' 
      };
    }

    const tableInfo = data[0];
    const rlsEnabled = tableInfo.rowsecurity;
    const policyCount = parseInt(tableInfo.policy_count) || 0;

    let status = '✅';
    let message = `RLS activo con ${policyCount} políticas`;

    if (!rlsEnabled) {
      status = '❌';
      message = 'RLS no habilitado';
    } else if (policyCount === 0) {
      status = '⚠️';
      message = 'RLS habilitado pero sin políticas';
    }

    return {
      table: tableName,
      exists: true,
      rls_enabled: rlsEnabled,
      policies: policyCount,
      status,
      message
    };

  } catch (error) {
    return { 
      table: tableName, 
      exists: false, 
      rls_enabled: false, 
      policies: 0, 
      status: '❌', 
      message: `Error inesperado: ${error.message}` 
    };
  }
}

async function getPolicyDetails(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, cmd, roles, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = '${tableName}'
        ORDER BY policyname;
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

async function applyMissingRLSPolicies() {
  console.log('🔧 Aplicando políticas RLS faltantes...\n');

  // SQL para aplicar políticas RLS básicas
  const RLS_SQL = `
-- Habilitar RLS en tablas críticas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
ON profiles FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'::app_role
  )
);

-- Políticas básicas para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles"
ON user_roles FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() AND ur2.role = 'administrador'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() AND ur2.role = 'administrador'::app_role
  )
);

-- Políticas básicas para invitations
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
CREATE POLICY "Users can view their own invitations"
ON invitations FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE id = from_profile OR id = to_profile
  )
);

DROP POLICY IF EXISTS "Users can send invitations" ON invitations;
CREATE POLICY "Users can send invitations"
ON invitations FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE id = from_profile)
);

DROP POLICY IF EXISTS "Users can respond to invitations" ON invitations;
CREATE POLICY "Users can respond to invitations"
ON invitations FOR UPDATE TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE id = to_profile)
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE id = to_profile)
);

DROP POLICY IF EXISTS "Admins can manage all invitations" ON invitations;
CREATE POLICY "Admins can manage all invitations"
ON invitations FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'::app_role
  )
);

-- Políticas básicas para gallery_permissions
DROP POLICY IF EXISTS "Users can view their gallery permissions" ON gallery_permissions;
CREATE POLICY "Users can view their gallery permissions"
ON gallery_permissions FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE id = profile_id OR id = granted_to
  )
);

DROP POLICY IF EXISTS "Users can grant gallery permissions" ON gallery_permissions;
CREATE POLICY "Users can grant gallery permissions"
ON gallery_permissions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE id = granted_by)
);

DROP POLICY IF EXISTS "Admins can manage all gallery permissions" ON gallery_permissions;
CREATE POLICY "Admins can manage all gallery permissions"
ON gallery_permissions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'::app_role
  )
);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: RLS_SQL
    });

    if (error) {
      console.error('❌ Error aplicando políticas RLS:', error.message);
      return false;
    }

    console.log('✅ Políticas RLS aplicadas exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error inesperado aplicando RLS:', error.message);
    return false;
  }
}

async function validateRLSPolicies() {
  console.log('🔍 Validando políticas RLS en base de datos...\n');
  
  const results = [];
  
  for (const tableName of CRITICAL_TABLES) {
    console.log(`🔍 Verificando tabla: ${tableName}`);
    
    const tableResult = await checkTableRLS(tableName);
    const policies = await getPolicyDetails(tableName);
    
    tableResult.policy_details = policies;
    results.push(tableResult);
    
    console.log(`  ${tableResult.status} ${tableResult.message}`);
    
    if (policies.length > 0) {
      policies.forEach(policy => {
        console.log(`    📋 ${policy.policyname} (${policy.cmd})`);
      });
    }
  }

  return results;
}

async function generateRLSReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      tables_total: CRITICAL_TABLES.length,
      tables_with_rls: 0,
      tables_with_policies: 0,
      total_policies: 0,
      security_score: 0
    },
    tables: {},
    recommendations: [],
    issues: []
  };

  results.forEach(result => {
    report.tables[result.table] = {
      exists: result.exists,
      rls_enabled: result.rls_enabled,
      policies_count: result.policies,
      status: result.status,
      message: result.message,
      policy_details: result.policy_details || []
    };

    if (result.rls_enabled) {
      report.summary.tables_with_rls++;
    }

    if (result.policies > 0) {
      report.summary.tables_with_policies++;
      report.summary.total_policies += result.policies;
    }

    if (result.status === '❌') {
      report.issues.push(`${result.table}: ${result.message}`);
    }

    if (!result.exists) {
      report.recommendations.push(`Crear tabla ${result.table}`);
    } else if (!result.rls_enabled) {
      report.recommendations.push(`Habilitar RLS en tabla ${result.table}`);
    } else if (result.policies === 0) {
      report.recommendations.push(`Aplicar políticas RLS a tabla ${result.table}`);
    }
  });

  // Calcular puntuación de seguridad
  const maxScore = CRITICAL_TABLES.length * 2; // RLS + políticas por tabla
  const actualScore = report.summary.tables_with_rls + report.summary.tables_with_policies;
  report.summary.security_score = Math.round((actualScore / maxScore) * 100);

  // Guardar reporte
  if (!existsSync('reports')) {
    mkdirSync('reports', { recursive: true });
  }
  
  writeFileSync('reports/rls_policies_audit.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Reporte RLS guardado en: reports/rls_policies_audit.json');

  return report;
}

async function main() {
  console.log('🔐 VALIDACIÓN DE POLÍTICAS RLS - ComplicesConecta v2.1.1');
  console.log('=' .repeat(60));
  
  try {
    // 1. Validar estado actual de RLS
    const results = await validateRLSPolicies();
    
    // 2. Aplicar políticas faltantes si es necesario
    const needsRLS = results.some(r => !r.rls_enabled || r.policies === 0);
    
    if (needsRLS) {
      console.log('\n🔧 Aplicando políticas RLS faltantes...');
      const rlsApplied = await applyMissingRLSPolicies();
      
      if (rlsApplied) {
        console.log('✅ Políticas RLS aplicadas, re-validando...\n');
        // Re-validar después de aplicar políticas
        const newResults = await validateRLSPolicies();
        const report = await generateRLSReport(newResults);
        
        console.log('\n📊 RESUMEN FINAL DE SEGURIDAD RLS');
        console.log('=' .repeat(40));
        console.log(`📋 Tablas con RLS: ${report.summary.tables_with_rls}/${report.summary.tables_total}`);
        console.log(`🔐 Tablas con políticas: ${report.summary.tables_with_policies}/${report.summary.tables_total}`);
        console.log(`📊 Políticas totales: ${report.summary.total_policies}`);
        console.log(`🎯 Puntuación de seguridad: ${report.summary.security_score}%`);
        
        if (report.summary.security_score >= 80) {
          console.log('\n✅ Seguridad RLS en buen estado');
          process.exit(0);
        } else {
          console.log('\n⚠️ Seguridad RLS necesita mejoras');
          process.exit(1);
        }
      } else {
        console.log('\n❌ Error aplicando políticas RLS');
        process.exit(1);
      }
    } else {
      // 3. Generar reporte final
      const report = await generateRLSReport(results);
      
      console.log('\n📊 RESUMEN DE SEGURIDAD RLS');
      console.log('=' .repeat(30));
      console.log(`📋 Tablas con RLS: ${report.summary.tables_with_rls}/${report.summary.tables_total}`);
      console.log(`🔐 Tablas con políticas: ${report.summary.tables_with_policies}/${report.summary.tables_total}`);
      console.log(`📊 Políticas totales: ${report.summary.total_policies}`);
      console.log(`🎯 Puntuación de seguridad: ${report.summary.security_score}%`);
      
      if (report.summary.security_score >= 80) {
        console.log('\n✅ Todas las políticas RLS están correctamente configuradas');
        process.exit(0);
      } else {
        console.log('\n⚠️ Algunas políticas RLS necesitan atención');
        if (report.issues.length > 0) {
          console.log('\nProblemas detectados:');
          report.issues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue}`);
          });
        }
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la validación RLS:', error.message);
    process.exit(1);
  }
}

// Ejecutar validación
main().catch(console.error);
