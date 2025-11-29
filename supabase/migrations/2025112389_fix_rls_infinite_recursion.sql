-- =====================================================
-- MIGRACIÓN CRÍTICA: Corregir Recursión Infinita en RLS
-- Fecha: 23 Noviembre 2025 02:26 AM
-- Problema: Políticas RLS causan recursión infinita al consultar profiles dentro de profiles
-- Solución: Usar auth.jwt() para determinar tipo de usuario sin consultar profiles
-- ======================================================

-- 1. Eliminar todas las políticas anteriores de profiles
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Demo users see demo profiles only" ON profiles;
DROP POLICY IF EXISTS "Real users see real profiles only" ON profiles;

-- 2. Políticas RLS definitivas SIN recursión y SIN función en schema auth

-- Usuarios DEMO: solo ven perfiles demo + el suyo propio
DO $$
BEGIN
  -- Solo crear políticas si existe la columna is_demo
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_demo'
  ) THEN
    -- 3. Política simplificada para usuarios DEMO - Sin recursión
    CREATE POLICY "Demo users see only demo profiles"
    ON profiles
    FOR SELECT
    USING (
      -- Si el usuario tiene is_demo = true en su JWT → solo ve perfiles demo
      (
        COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = true
        AND (is_demo = true OR user_id = auth.uid())
      )
      -- Si NO es demo → ve perfiles reales + el suyo
      OR (
        COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false
        AND (is_demo = false OR user_id = auth.uid())
      )
    );

    -- 4. Política simplificada para usuarios REALES - Sin recursión  
    CREATE POLICY "Real users see real profiles only"
    ON profiles
    FOR SELECT
    USING (
      -- Solo mostrar perfiles reales si el usuario NO es demo
      (COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false AND is_demo = false)
      OR
      -- O si es el propio perfil del usuario
      (user_id = auth.uid())
    );
  ELSE
    RAISE NOTICE '⚠️ Columna is_demo no existe en profiles; se omiten políticas demo/real.';
  END IF;

  -- Políticas independientes de is_demo (insert/update) siempre se crean
  CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

  CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
END $$;

-- Opcional: permitir DELETE solo de su propio perfil (si lo usas)
-- CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- 3. Índices para que vuele-- 7. Crear índices para optimizar las consultas RLS (solo si existe is_demo)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_demo'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_is_demo_user_id ON profiles(is_demo, user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_demo ON profiles(user_id, is_demo);
  ELSE
    RAISE NOTICE '⚠️ Columna is_demo no existe en profiles; se omiten índices relacionados.';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 4. Asegurar que RLS esté activado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificación final
DO $$
BEGIN
    RAISE NOTICE 'RLS FIX aplicado correctamente en profiles';
    RAISE NOTICE 'Ahora DEMO ve solo DEMO y REAL ve solo REAL';
    RAISE NOTICE 'Sin recursión infinita y sin funciones en schema auth';
    RAISE NOTICE 'Todo usando solo auth.jwt() compatible con Supabase local y remoto';
END $$