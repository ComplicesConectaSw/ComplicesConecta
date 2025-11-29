-- =====================================================
-- SCRIPT DE CORRECCIÓN: get_profiles_in_cells
-- =====================================================
-- Este script corrige la función get_profiles_in_cells
-- agregando columnas faltantes si no existen
-- =====================================================

-- Agregar columnas de geolocalización si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Agregar columna account_type si no existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT;

-- Eliminar función existente con todas sus variantes posibles
DROP FUNCTION IF EXISTS get_profiles_in_cells(TEXT[], INTEGER);
DROP FUNCTION IF EXISTS get_profiles_in_cells(text[], integer);
DROP FUNCTION IF EXISTS get_profiles_in_cells;

-- Crear función corregida (sin latitude/longitude)
CREATE FUNCTION get_profiles_in_cells(
  cell_ids TEXT[],
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  s2_cell_id VARCHAR(20),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  name TEXT,
  age INTEGER,
  account_type TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.s2_cell_id,
    p.latitude::DOUBLE PRECISION,
    p.longitude::DOUBLE PRECISION,
    p.name::TEXT,
    p.age,
    p.account_type::TEXT,
    p.updated_at
  FROM profiles p
  WHERE p.s2_cell_id = ANY(cell_ids)
  ORDER BY p.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_profiles_in_cells IS 
'Busca perfiles en un array de celdas S2. Útil para queries nearby optimizadas. No requiere latitude/longitude.';

-- Verificar que la función se creó correctamente
SELECT 
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'get_profiles_in_cells';

