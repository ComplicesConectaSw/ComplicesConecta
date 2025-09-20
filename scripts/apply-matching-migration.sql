-- =====================================================
-- 🚀 SCRIPT PARA APLICAR MIGRACIÓN DE MATCHING
-- Ejecutar en Supabase SQL Editor o con supabase db push
-- =====================================================

-- Verificar estado actual de las tablas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('user_likes', 'matches', 'match_interactions', 'profiles')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- NOTA: Para aplicar la migración, ejecutar el contenido de 20250920_fix_matching_schema.sql
-- directamente en el SQL Editor de Supabase o usar: supabase db push

-- Verificar cambios aplicados
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('user_likes', 'matches', 'match_interactions', 'profiles')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verificar funciones creadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_matches', 'get_potential_matches', 'update_user_activity');
