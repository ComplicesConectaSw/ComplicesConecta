-- =====================================================
-- MIGRACIÓN SIMPLE: Deshabilitar RLS temporalmente para desarrollo
-- Fecha: 23 Noviembre 2025 02:33 AM
-- Problema: Error de permisos en schema auth
-- Solución: Deshabilitar RLS completamente para desarrollo
-- =====================================================

-- 1. Deshabilitar RLS en tabla profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Demo users see demo profiles only" ON profiles;
DROP POLICY IF EXISTS "Real users see real profiles only" ON profiles;

-- 3. Verificar que RLS esté deshabilitado
DO $$
BEGIN
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    RAISE WARNING 'RLS sigue habilitado en tabla profiles';
  ELSE
    RAISE NOTICE 'RLS deshabilitado correctamente en tabla profiles';
  END IF;
END $$;

-- 4. Comentario para producción
COMMENT ON TABLE profiles IS 'RLS deshabilitado temporalmente para desarrollo - REACTIVAR EN PRODUCCIÓN';
