-- ==========================================
-- LIMPIEZA DE REGISTROS DUPLICADOS EN SCHEMA_MIGRATIONS
-- Fecha: 2025-09-06
-- Propósito: Resolver conflictos de version=20250106 duplicada
-- ==========================================

-- PASO 1: Eliminar registros duplicados de schema_migrations
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250106' 
AND applied_at IS NOT NULL;

-- PASO 2: Insertar registros correctos con timestamps únicos
INSERT INTO supabase_migrations.schema_migrations (version, statements, name) 
VALUES 
  ('20250106_01', ARRAY[]::text[], '20250106_01_create_chat_system'),
  ('20250106_02', ARRAY[]::text[], '20250106_02_create_matching_system')
ON CONFLICT (version) DO NOTHING;

-- PASO 3: Verificar estado final
SELECT version, name, applied_at 
FROM supabase_migrations.schema_migrations 
WHERE version LIKE '20250106%' 
ORDER BY version;
