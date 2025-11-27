-- =====================================================
-- EJECUTAR QUERIES CRÍTICAS CON EXPLAIN ANALYZE
-- =====================================================
-- Este script ejecuta las queries críticas más importantes
-- para validar performance después de aplicar índices
-- =====================================================

-- Query 1.1: Feed público ordenado por fecha
-- Usa media_url (compatible con ambos entornos: local y remoto)
EXPLAIN ANALYZE
SELECT 
  id,
  user_id,
  description as content,
  content_type as post_type,
  media_url,
  views_count,
  created_at,
  updated_at
FROM stories
WHERE is_public = true
ORDER BY created_at DESC
LIMIT 20;

-- Query 2.1: Perfiles con filtros básicos
-- NOTA: Aplicar migración 20251103000001_fix_profiles_online_column.sql primero
-- para agregar la columna is_online si no existe
EXPLAIN ANALYZE
SELECT *
FROM profiles
WHERE age >= 18 
  AND age <= 35
  AND gender = 'male'
  AND is_verified = true
ORDER BY updated_at DESC
LIMIT 20;

-- Query 3.1: Mensajes por chat
-- Nota: Usar un room_id real de tu base de datos
EXPLAIN ANALYZE
SELECT 
  id,
  room_id,
  sender_id,
  content,
  created_at
FROM messages
WHERE room_id IN (
  SELECT id FROM chat_rooms LIMIT 1
)
ORDER BY created_at DESC
LIMIT 50;

-- Query 7.1: Usuarios en S2 cell
-- Nota: Usar un s2_cell_id real de tu base de datos
EXPLAIN ANALYZE
SELECT *
FROM profiles
WHERE s2_cell_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 20;

-- Query 7.3: Función get_profiles_in_cells
EXPLAIN ANALYZE
SELECT * FROM get_profiles_in_cells(
  (SELECT ARRAY_AGG(DISTINCT s2_cell_id) FROM profiles WHERE s2_cell_id IS NOT NULL LIMIT 3),
  20
);

