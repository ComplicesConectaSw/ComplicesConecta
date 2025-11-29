-- =====================================================
-- MIGRACIÓN DE SEGURIDAD: Separación Demo/Real con RLS
-- Fecha: 20 Noviembre 2025 22:18
-- Descripción: Implementar Row Level Security para aislar usuarios demo de reales
-- Vulnerabilidad: SmartMatchingService permitía cruce de datos demo/real
-- =====================================================

-- 1. Habilitar RLS en tabla profiles (si no está habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2-10. Políticas basadas en is_demo: solo si existe la columna is_demo en profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_demo'
  ) THEN

    -- 2. Eliminar políticas existentes que puedan conflictuar
    DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
    DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;

    -- 3. Crear política para usuarios REALES - Solo ven perfiles reales
    CREATE POLICY "Real users only see real profiles"
    ON profiles
    FOR SELECT
    USING (
      -- Verificar que el usuario esté autenticado
      auth.uid() IS NOT NULL
      AND
      -- El perfil que se consulta debe ser real (is_demo = false)
      is_demo = false
      AND
      -- El usuario actual debe ser real (verificar en su propio perfil)
      EXISTS (
        SELECT 1 FROM profiles current_user_profile
        WHERE current_user_profile.user_id = auth.uid()
        AND current_user_profile.is_demo = false
      )
    );

    -- 4. Crear política para usuarios DEMO - Solo ven perfiles demo
    CREATE POLICY "Demo users only see demo profiles"
    ON profiles
    FOR SELECT
    USING (
      -- Verificar que el usuario esté autenticado
      auth.uid() IS NOT NULL
      AND
      -- El perfil que se consulta debe ser demo (is_demo = true)
      is_demo = true
      AND
      -- El usuario actual debe ser demo (verificar en su propio perfil)
      EXISTS (
        SELECT 1 FROM profiles current_user_profile
        WHERE current_user_profile.user_id = auth.uid()
        AND current_user_profile.is_demo = true
      )
    );

    -- 5. Política para que usuarios puedan ver su propio perfil
    CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL
      AND
      user_id = auth.uid()
    );

    -- 6. Política para INSERT - Usuarios pueden crear su propio perfil
    CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND
      user_id = auth.uid()
    );

    -- 7. Política para UPDATE - Usuarios pueden actualizar su propio perfil
    CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (
      auth.uid() IS NOT NULL
      AND
      user_id = auth.uid()
    )
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND
      user_id = auth.uid()
    );

    -- 8. Crear índices para optimizar las consultas RLS
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_demo 
    ON profiles(user_id, is_demo);

    -- Índice adicional sólo si existe la columna is_active
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'is_active'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_profiles_is_demo_active 
      ON profiles(is_demo, is_active) 
      WHERE is_active = true;
    ELSE
      RAISE NOTICE '⚠️ Columna is_active no existe en profiles; se omite índice idx_profiles_is_demo_active.';
    END IF;

    -- 9. Comentarios para documentación
    COMMENT ON POLICY "Real users only see real profiles" ON profiles IS 
    'Política de seguridad: Usuarios reales (is_demo=false) solo pueden ver otros perfiles reales. Previene que usuarios reales vean perfiles demo.';

    COMMENT ON POLICY "Demo users only see demo profiles" ON profiles IS 
    'Política de seguridad: Usuarios demo (is_demo=true) solo pueden ver otros perfiles demo. Mantiene aislamiento completo entre ecosistemas.';

    COMMENT ON POLICY "Users can view own profile" ON profiles IS 
    'Permite que cualquier usuario autenticado pueda ver su propio perfil, independientemente del tipo (demo/real).';

    -- 10. Verificación de la migración
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'profiles' 
      AND rowsecurity = true
    ) THEN
      RAISE EXCEPTION 'ERROR: RLS no se habilitó correctamente en tabla profiles';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' 
      AND policyname = 'Real users only see real profiles'
    ) THEN
      RAISE EXCEPTION 'ERROR: Política para usuarios reales no se creó';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' 
      AND policyname = 'Demo users only see demo profiles'
    ) THEN
      RAISE EXCEPTION 'ERROR: Política para usuarios demo no se creó';
    END IF;

    RAISE NOTICE 'SUCCESS: Migración de seguridad RLS aplicada correctamente';
    RAISE NOTICE 'INFO: Separación demo/real implementada a nivel de base de datos';
    RAISE NOTICE 'INFO: Vulnerabilidad SmartMatchingService mitigada';

  ELSE
    -- En esquemas sin is_demo, solo se mantiene RLS habilitado sin estas políticas
    RAISE NOTICE '⚠️ Columna is_demo no existe en profiles; se omiten políticas de aislamiento demo/real.';
  END IF;
END $$;

-- =====================================================
-- FIN DE MIGRACIÓN
-- Estado: Usuarios demo y reales completamente aislados
-- Seguridad: Doble capa (aplicación + base de datos)
-- =====================================================
