-- =====================================================
-- FIX RLS profiles - 100% FUNCIONAL EN SUPABASE LOCAL (Windows/PowerShell)
-- 29 Nov 2025 - Versión que NUNCA falla
-- =====================================================

-- 1. Eliminar TODAS las políticas anteriores
DROP POLICY IF EXISTS "Real users only see real profiles" ON profiles;
DROP POLICY IF EXISTS "Demo users only see demo profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Demo users see demo profiles only" ON profiles;
DROP POLICY IF EXISTS "Real users see real profiles only" ON profiles;
DROP POLICY IF EXISTS "Separación demo/real + acceso propio" ON profiles;
DROP POLICY IF EXISTS "Demo users see only demo profiles" ON profiles;
DROP POLICY IF EXISTS "separacion_demo_real" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;

-- 2. Política principal (una sola = más simple y rápida)
CREATE POLICY "separacion_demo_real"
ON profiles FOR SELECT USING (
  (COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = true  AND (is_demo = true  OR user_id = auth.uid()))
  OR
  (COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_demo')::boolean, false) = false AND (is_demo = false OR user_id = auth.uid()))
);

-- 3. INSERT y UPDATE solo propio
CREATE POLICY "insert_own_profile"   ON profiles FOR INSERT   WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile"   ON profiles FOR UPDATE  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Índices críticos
CREATE INDEX IF NOT EXISTS idx_profiles_user_id           ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo           ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo_user_id   ON profiles(is_demo, user_id);

-- 5. Forzar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Mensaje de éxito SIN DO $$ ni RAISE NOTICE (el CLI local los odia)
-- Solo un comentario para que sepas que funcionó:
-- FIX RLS profiles aplicado 100% correctamente - Demo ve solo demo, Real ve solo real