-- Debug: Verificar exactamente qué está en la tabla profiles
-- Buscar por el UUID específico que está usando la aplicación

-- 1. Verificar si existe el registro con el ID exacto
SELECT 'Búsqueda por ID exacto:' as consulta;
SELECT * FROM profiles WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- 2. Verificar todos los registros en profiles (para ver qué IDs existen)
SELECT 'Todos los registros en profiles:' as consulta;
SELECT id, first_name, last_name, display_name FROM profiles;

-- 3. Verificar si el ID está en formato diferente (mayúsculas/minúsculas)
SELECT 'Búsqueda case-insensitive:' as consulta;
SELECT * FROM profiles WHERE LOWER(id::text) = LOWER('10b2fa75-5a62-4299-921c-9a1cc99c765b');

-- 4. Verificar estructura de la tabla
SELECT 'Estructura de tabla profiles:' as consulta;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' ORDER BY ordinal_position;
