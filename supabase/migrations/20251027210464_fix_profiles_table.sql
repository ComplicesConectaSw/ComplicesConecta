-- =====================================================
-- MIGRACIÓN: Corrección de tabla profiles
-- Fecha: 28 de Enero 2025
-- Descripción: Asegurar que is_premium existe en profiles
-- =====================================================

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

-- Actualizar usuarios que tienen premium_plan activo
UPDATE profiles 
SET is_premium = true 
WHERE premium_plan IS NOT NULL 
  AND premium_expires_at > NOW()
  AND is_premium IS NULL;

