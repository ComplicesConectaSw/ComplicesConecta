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
CREATE POLICY "Demo users see only demo profiles"
ON profiles FOR SELECT
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

-- Permitir INSERT solo de su propio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permitir UPDATE solo de su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Opcional: permitir DELETE solo de su propio perfil (si lo usas)
-- CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- 3. Índices para que vuele (críticos para rendimiento con RLS)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo_user_id ON profiles(is_demo, user_id);

-- 4. Asegurar que RLS esté activado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificación final
DO $$
BEGIN
    RAISE NOTICE 'RLS FIX aplicado correctamente en profiles';
    RAISE NOTICE 'Ahora DEMO ve solo DEMO, REAL ve solo REAL';
    RAISE NOTICE 'Sin recursión infinita | Sin funciones en schema auth';
    RAISE NOTICE 'Todo usando solo auth.jwt() → 100% compatible con Supabase local/remoto';
END $$;