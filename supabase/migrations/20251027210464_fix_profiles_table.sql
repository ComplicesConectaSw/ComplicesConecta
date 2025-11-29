-- =====================================================
-- MIGRACIÓN: Corrección de tabla profiles
-- Fecha: 28 de Enero 2025
-- Descripción: Asegurar que is_premium existe en profiles
-- =====================================================

-- Asegurar que la tabla base exista antes de aplicar correcciones
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Añadir columna is_premium si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Crear índice para is_premium
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Actualizar usuarios que tienen premium_plan activo (solo si las columnas existen)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'premium_plan'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'premium_expires_at'
    ) THEN
        UPDATE profiles
        SET is_premium = true
        WHERE premium_plan IS NOT NULL
          AND premium_expires_at > NOW()
          AND is_premium IS NULL;
    END IF;
END $$;

