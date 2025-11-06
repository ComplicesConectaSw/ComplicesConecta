-- =====================================================
-- MIGRACIÓN: Agregar first_name y last_name a profiles
-- Fecha: 2025-11-06
-- Descripción: Agregar campos first_name y last_name necesarios para el registro
-- =====================================================

-- Agregar columna first_name si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name VARCHAR(100);
    END IF;
END $$;

-- Agregar columna last_name si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name VARCHAR(100);
    END IF;
END $$;

-- Migrar datos existentes: extraer first_name y last_name de name si existe
UPDATE profiles 
SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
        WHEN POSITION(' ' IN name) > 0 THEN SPLIT_PART(name, ' ', 2)
        ELSE ''
    END
WHERE (first_name IS NULL OR first_name = '') 
  AND name IS NOT NULL 
  AND name != '';

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);

-- Comentarios de las columnas
COMMENT ON COLUMN profiles.first_name IS 'Nombre del usuario (requerido para registro)';
COMMENT ON COLUMN profiles.last_name IS 'Apellido del usuario (requerido para registro)';

DO $$
BEGIN
    RAISE NOTICE '✅ Campos first_name y last_name agregados exitosamente a profiles';
    RAISE NOTICE '📊 Datos migrados desde name → first_name + last_name';
END $$;

