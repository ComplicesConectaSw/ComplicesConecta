-- ================================================
-- ADD NAME COLUMN TO PROFILES TABLE
-- ================================================
-- Esta migración agrega la columna 'name' a la tabla 'profiles'
-- y migra los datos existentes de 'first_name' y 'last_name'
-- Fecha: 2025-10-28
-- Versión: v3.4.1
-- ================================================

-- Agregar columna 'name' si no existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name VARCHAR(200);

-- Migrar datos existentes: combinar first_name y last_name en name (solo si existen las columnas)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'first_name'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'last_name'
    ) THEN
        UPDATE profiles
        SET name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
        WHERE name IS NULL OR name = '';
    END IF;
END $$;

-- Establecer valor por defecto para registros sin nombre
UPDATE profiles 
SET name = 'Usuario' 
WHERE name IS NULL OR TRIM(name) = '';

-- Crear índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- Comentario de la tabla
COMMENT ON COLUMN profiles.name IS 'Nombre completo del usuario (combinación de first_name y last_name)';

DO $$
BEGIN
    RAISE NOTICE '✅ Columna name agregada exitosamente a profiles';
    RAISE NOTICE '📊 Datos migrados de first_name + last_name → name';
END $$;

