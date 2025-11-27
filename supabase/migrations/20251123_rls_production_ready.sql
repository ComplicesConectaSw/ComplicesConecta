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
CREATE POLICY "Demo users access demo profiles"
ON profiles
FOR ALL
USING (
  -- Permitir acceso si es el propio perfil
  user_id = auth.uid()
  OR
  -- O si ambos (usuario actual y perfil consultado) son demo
  (
    is_demo = true 
    AND 
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = true
  )
);

-- 4. Política para usuarios REALES - Sin recursión usando metadata
CREATE POLICY "Real users access real profiles"
ON profiles
FOR ALL
USING (
  -- Permitir acceso si es el propio perfil
  user_id = auth.uid()
  OR
  -- O si ambos (usuario actual y perfil consultado) son reales
  (
    is_demo = false 
    AND 
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false
  )
);

-- 5. Crear índices para optimizar las consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_rls_demo_user ON profiles(is_demo, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rls_user_demo ON profiles(user_id, is_demo);

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

-- 8. Comentarios para documentación
COMMENT ON POLICY "Demo users access demo profiles" ON profiles IS 'Usuarios demo acceden a perfiles demo usando JWT metadata, sin recursión';
COMMENT ON POLICY "Real users access real profiles" ON profiles IS 'Usuarios reales acceden a perfiles reales usando JWT metadata, sin recursión';
COMMENT ON TABLE profiles IS 'RLS habilitado con políticas que usan JWT metadata para evitar recursión infinita';
