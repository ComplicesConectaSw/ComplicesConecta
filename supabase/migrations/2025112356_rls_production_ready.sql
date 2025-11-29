-- =====================================================
-- MIGRACIÓN RLS PARA PRODUCCIÓN - Sin schema auth
-- Fecha: 23 Noviembre 2025 02:37 AM
-- Solución: RLS usando solo funciones públicas y metadata JWT
-- =====================================================

-- 1. Eliminar políticas problemáticas existentes
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Demo users see demo profiles only" ON profiles;
DROP POLICY IF EXISTS "Real users see real profiles only" ON profiles;

-- 2. Habilitar RLS en tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Política para usuarios DEMO - Sin recursión usando metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_demo'
  ) THEN
    CREATE POLICY "Demo users access demo profiles"
    ON profiles
    FOR ALL
    USING (
      user_id = auth.uid()
      OR (
        is_demo = true
        AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = true
      )
    )
    WITH CHECK (
      user_id = auth.uid()
      OR (
        is_demo = true
        AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = true
      )
    );

    CREATE POLICY "Real users access real profiles"
    ON profiles
    FOR ALL
    USING (
      user_id = auth.uid()
      OR (
        is_demo = false
        AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false
      )
    )
    WITH CHECK (
      user_id = auth.uid()
      OR (
        is_demo = false
        AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false
      )
    );
  ELSE
    RAISE NOTICE '⚠️ Columna is_demo no existe en profiles; se omiten políticas demo/real en rls_production_ready.';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_demo'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_rls_demo_user ON profiles(is_demo, user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_rls_user_demo ON profiles(user_id, is_demo);
  ELSE
    RAISE NOTICE '⚠️ Columna is_demo no existe en profiles; se omiten índices idx_profiles_rls_*.';
  END IF;
END $$;

-- 6. Verificar que RLS esté habilitado
DO $$
BEGIN
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    RAISE NOTICE 'RLS habilitado correctamente en tabla profiles';
  ELSE
    RAISE WARNING 'RLS NO está habilitado en tabla profiles';
  END IF;
END $$;

-- 7. Verificar que las políticas se crearon correctamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'profiles' 
  AND schemaname = 'public';
  
  IF policy_count >= 2 THEN
    RAISE NOTICE 'Políticas RLS creadas correctamente: % políticas encontradas', policy_count;
  ELSE
    RAISE WARNING 'Problema con políticas RLS: solo % políticas encontradas', policy_count;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'Demo users access demo profiles'
  ) THEN
    COMMENT ON POLICY "Demo users access demo profiles" ON profiles IS 'Usuarios demo acceden a perfiles demo usando JWT metadata, sin recursión';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'Real users access real profiles'
  ) THEN
    COMMENT ON POLICY "Real users access real profiles" ON profiles IS 'Usuarios reales acceden a perfiles reales usando JWT metadata, sin recursión';
  END IF;

  COMMENT ON TABLE profiles IS 'RLS habilitado con políticas que usan JWT metadata para evitar recursión infinita';
END $$;
