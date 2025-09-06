/**
 * Script para Corregir Migraciones de Base de Datos
 * ComplicesConecta v2.1.1 - Resolución de conflictos
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://axtvqnozatbmllvwzuim.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL para corregir la base de datos
const MIGRATION_SQL = `
-- =====================================================
-- CORRECCIÓN COMPLETA DE BASE DE DATOS
-- ComplicesConecta v2.1.1
-- =====================================================

BEGIN;

-- 1. Eliminar tabla incorrecta
DROP TABLE IF EXISTS "public"."police complicesconecta" CASCADE;

-- 2. Recrear tipo app_role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('administrador', 'cliente');
    END IF;
END $$;

-- 3. Recrear tabla profiles con estructura completa
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  display_name text,
  email text,
  avatar_url text,
  bio text,
  age int CHECK (age IS NULL OR age >= 18),
  gender text,
  latitude double precision,
  longitude double precision,
  interests text[] DEFAULT '{}',
  profile_type text DEFAULT 'single' CHECK (profile_type IN ('single', 'couple')),
  is_online boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  stripe_customer_id text,
  stripe_subscription_id text,
  is_premium boolean DEFAULT false,
  premium_plan text,
  premium_expires_at timestamptz,
  payment_failed boolean DEFAULT false
);

-- 4. Recrear tabla user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 5. Recrear tabla invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('connection', 'gallery', 'chat')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  decided_at timestamptz,
  UNIQUE(from_profile, to_profile, type)
);

-- 6. Recrear tabla gallery_permissions
CREATE TABLE IF NOT EXISTS public.gallery_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_to uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(profile_id, granted_to)
);

-- 7. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

-- 8. Recrear funciones críticas
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 9. Políticas RLS para profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

-- 10. Políticas RLS para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

-- 11. Políticas RLS para invitations
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.invitations;
CREATE POLICY "Users can view their own invitations"
ON public.invitations FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT id FROM profiles WHERE id = from_profile OR id = to_profile));

DROP POLICY IF EXISTS "Users can send invitations" ON public.invitations;
CREATE POLICY "Users can send invitations"
ON public.invitations FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE id = from_profile));

DROP POLICY IF EXISTS "Users can respond to invitations" ON public.invitations;
CREATE POLICY "Users can respond to invitations"
ON public.invitations FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT id FROM profiles WHERE id = to_profile))
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE id = to_profile));

DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.invitations;
CREATE POLICY "Admins can manage all invitations"
ON public.invitations FOR ALL TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

-- 12. Políticas RLS para gallery_permissions
DROP POLICY IF EXISTS "Users can view their gallery permissions" ON public.gallery_permissions;
CREATE POLICY "Users can view their gallery permissions"
ON public.gallery_permissions FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT id FROM profiles WHERE id = profile_id OR id = granted_to));

DROP POLICY IF EXISTS "Users can grant gallery permissions" ON public.gallery_permissions;
CREATE POLICY "Users can grant gallery permissions"
ON public.gallery_permissions FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE id = granted_by));

DROP POLICY IF EXISTS "Admins can manage all gallery permissions" ON public.gallery_permissions;
CREATE POLICY "Admins can manage all gallery permissions"
ON public.gallery_permissions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

-- 13. Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 14. Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_from_profile ON invitations(from_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_to_profile ON invitations(to_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

COMMIT;
`;

async function executeMigration() {
  console.log('🔧 Ejecutando corrección de migraciones...\n');
  
  try {
    // Ejecutar el SQL de corrección
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: MIGRATION_SQL
    });

    if (error) {
      console.error('❌ Error ejecutando migración:', error.message);
      return false;
    }

    console.log('✅ Migración ejecutada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

async function validateDatabase() {
  console.log('🔍 Validando estado de la base de datos...\n');
  
  const requiredTables = ['profiles', 'user_roles', 'invitations', 'gallery_permissions'];
  const results = [];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        results.push({ table, status: '❌', message: error.message });
      } else {
        results.push({ table, status: '✅', message: 'Tabla accesible' });
      }
    } catch (err) {
      results.push({ table, status: '❌', message: err.message });
    }
  }

  // Mostrar resultados
  results.forEach(result => {
    console.log(`${result.status} ${result.table}: ${result.message}`);
  });

  const allGood = results.every(r => r.status === '✅');
  
  if (allGood) {
    console.log('\n✅ Todas las tablas críticas están funcionando correctamente');
  } else {
    console.log('\n⚠️ Algunas tablas tienen problemas');
  }

  return allGood;
}

async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    migration_status: 'completed',
    tables_validated: [],
    issues_resolved: [
      'Eliminada tabla incorrecta "police complicesconecta"',
      'Recreado tipo app_role',
      'Recreadas tablas críticas con estructura correcta',
      'Aplicadas políticas RLS',
      'Recreadas funciones has_role y handle_new_user',
      'Configurados triggers para nuevos usuarios'
    ],
    next_steps: [
      'Validar sistema de imágenes',
      'Verificar chat real-time',
      'Completar sistema de matches'
    ]
  };

  // Guardar reporte
  if (!existsSync('reports')) {
    mkdirSync('reports', { recursive: true });
  }
  
  writeFileSync('reports/migration_fix_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Reporte guardado en: reports/migration_fix_report.json');
  
  return report;
}

async function main() {
  console.log('🚀 CORRECCIÓN DE MIGRACIONES - ComplicesConecta v2.1.1');
  console.log('=' .repeat(60));
  
  try {
    // 1. Ejecutar migración de corrección
    const migrationSuccess = await executeMigration();
    
    if (!migrationSuccess) {
      console.log('\n❌ La migración falló. Revise los errores anteriores.');
      process.exit(1);
    }

    // 2. Validar estado de la base de datos
    const validationSuccess = await validateDatabase();
    
    // 3. Generar reporte
    await generateReport();
    
    if (validationSuccess) {
      console.log('\n🎉 Corrección completada exitosamente!');
      console.log('✅ Base de datos lista para continuar con la auditoría');
      process.exit(0);
    } else {
      console.log('\n⚠️ Corrección parcial. Revise los problemas restantes.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la corrección:', error.message);
    process.exit(1);
  }
}

// Ejecutar corrección
main().catch(console.error);
