-- =====================================================
-- MIGRACIÓN: Agregar columna full_name a profiles
-- Fecha: 2025-11-08
-- Descripción: Agregar columna full_name calculada desde first_name y last_name
-- =====================================================

-- Agregar columna full_name si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Función para actualizar full_name automáticamente
CREATE OR REPLACE FUNCTION update_profiles_full_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_name := TRIM(CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar full_name cuando cambien first_name o last_name
DROP TRIGGER IF EXISTS update_profiles_full_name_trigger ON profiles;
CREATE TRIGGER update_profiles_full_name_trigger
    BEFORE INSERT OR UPDATE OF first_name, last_name ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_full_name();

-- Actualizar full_name para registros existentes
UPDATE profiles 
SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE full_name IS NULL OR full_name = '';

-- Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- Comentario
COMMENT ON COLUMN profiles.full_name IS 'Nombre completo calculado desde first_name y last_name';

DO $$
BEGIN
    RAISE NOTICE '✅ Columna full_name agregada a profiles con trigger automático';
END $$;

