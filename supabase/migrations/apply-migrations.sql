-- Script para aplicar migraciones faltantes en Supabase
-- ComplicesConecta v3.4.0 - Migraciones críticas

-- Ejecutar en Supabase SQL Editor o CLI cuando esté disponible

-- 1. Aplicar migración de intereses swinger
\i supabase/migrations/20250928_create_interests_tables.sql

-- 2. Aplicar migración de tablas faltantes
\i supabase/migrations/20250928_create_missing_tables.sql

-- 3. Verificar que las tablas se crearon correctamente
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'swinger_interests',
  'explicit_preferences', 
  'user_interests',
  'user_explicit_preferences',
  'compatibility_scores',
  'faq_items',
  'app_metrics',
  'apk_downloads',
  'notifications',
  'reports',
  'user_roles',
  'career_applications',
  'moderator_requests',
  'subscribers'
)
ORDER BY table_name;

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'swinger_interests',
  'explicit_preferences', 
  'user_interests',
  'user_explicit_preferences',
  'compatibility_scores',
  'faq_items',
  'app_metrics',
  'apk_downloads',
  'notifications',
  'reports',
  'user_roles',
  'career_applications',
  'moderator_requests',
  'subscribers'
)
ORDER BY tablename, policyname;

-- 5. Verificar índices
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
  'swinger_interests',
  'explicit_preferences', 
  'user_interests',
  'user_explicit_preferences',
  'compatibility_scores',
  'faq_items',
  'app_metrics',
  'apk_downloads',
  'notifications',
  'reports',
  'user_roles',
  'career_applications',
  'moderator_requests',
  'subscribers'
)
ORDER BY tablename, indexname;

-- 6. Verificar funciones
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'calculate_compatibility',
  'update_updated_at_column'
)
ORDER BY routine_name;

-- 7. Verificar triggers
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN (
  'swinger_interests',
  'explicit_preferences',
  'faq_items',
  'reports',
  'career_applications',
  'moderator_requests',
  'subscribers'
)
ORDER BY event_object_table, trigger_name;

-- Mensaje de confirmación
SELECT 'Migraciones aplicadas exitosamente' as status;
