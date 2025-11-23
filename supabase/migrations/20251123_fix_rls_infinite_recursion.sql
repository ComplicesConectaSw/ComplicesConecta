-- =====================================================
-- MIGRACIÓN CRÍTICA: Corregir Recursión Infinita en RLS
-- Fecha: 23 Noviembre 2025 02:26 AM
-- Problema: Políticas RLS causan recursión infinita al consultar profiles dentro de profiles
-- Solución: Usar auth.jwt() para determinar tipo de usuario sin consultar profiles
-- =====================================================

-- 1. Eliminar políticas problemáticas que causan recursión
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Crear función auxiliar para determinar si usuario es demo sin recursión
CREATE OR REPLACE FUNCTION auth.is_demo_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Usar metadata del JWT para determinar si es demo
  -- Esto evita consultar la tabla profiles y previene recursión
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata' ->> 'is_demo')::boolean,
    false
  );
$$;

-- 3. Política simplificada para usuarios DEMO - Sin recursión
CREATE POLICY "Demo users see demo profiles only"
ON profiles
FOR SELECT
USING (
  -- Solo mostrar perfiles demo si el usuario es demo
  (auth.is_demo_user() = true AND is_demo = true)
  OR
  -- O si es el propio perfil del usuario
  (user_id = auth.uid())
);

-- 4. Política simplificada para usuarios REALES - Sin recursión  
CREATE POLICY "Real users see real profiles only"
ON profiles
FOR SELECT
USING (
  -- Solo mostrar perfiles reales si el usuario NO es demo
  (auth.is_demo_user() = false AND is_demo = false)
  OR
  -- O si es el propio perfil del usuario
  (user_id = auth.uid())
);

-- 5. Política para INSERT - Usuarios pueden crear su propio perfil
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);

-- 6. Política para UPDATE - Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Crear índices para optimizar las consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo_user_id ON profiles(is_demo, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_is_demo ON profiles(user_id, is_demo);

-- 8. Verificar que RLS esté habilitado
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado en tabla profiles';
  ELSE
    RAISE NOTICE 'RLS ya estaba habilitado en tabla profiles';
  END IF;
END $$;

-- 9. Verificar que las políticas se crearon correctamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'profiles' 
  AND schemaname = 'public';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE 'Políticas RLS creadas correctamente: % políticas encontradas', policy_count;
  ELSE
    RAISE WARNING 'Problema con políticas RLS: solo % políticas encontradas', policy_count;
  END IF;
END $$;

-- 10. Comentarios para documentación
COMMENT ON FUNCTION auth.is_demo_user() IS 'Determina si el usuario actual es demo usando JWT metadata, evitando recursión RLS';
COMMENT ON POLICY "Demo users see demo profiles only" ON profiles IS 'Usuarios demo solo ven perfiles demo, sin recursión';
COMMENT ON POLICY "Real users see real profiles only" ON profiles IS 'Usuarios reales solo ven perfiles reales, sin recursión';
