-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE QUERIES
-- ComplicesConecta v3.5.0
-- Fecha: 02 de Noviembre, 2025
-- =====================================================
-- 
-- Este script crea índices recomendados para optimizar
-- las queries identificadas en OPTIMIZACION_QUERIES_BD.md
-- 
-- IMPORTANTE: Ejecutar en Supabase SQL Editor
-- Verificar que no haya conflictos con índices existentes
-- =====================================================

-- =====================================================
-- 1. STORIES/FEED QUERIES
-- =====================================================

-- Índice compuesto para queries de feed público ordenadas por fecha
CREATE INDEX IF NOT EXISTS idx_stories_public_created_at 
ON stories(is_public, created_at DESC) 
WHERE is_public = true;

-- Índice para stories con likes/comments/shares (para agregaciones)
CREATE INDEX IF NOT EXISTS idx_stories_engagement 
ON stories(created_at DESC, is_public) 
WHERE is_public = true;

-- =====================================================
-- 2. PROFILES QUERIES - FILTROS BÁSICOS
-- =====================================================

-- Índice para edad (filtro común)
CREATE INDEX IF NOT EXISTS idx_profiles_age 
ON profiles(age) 
WHERE age IS NOT NULL;

-- Índice para género (filtro común)
CREATE INDEX IF NOT EXISTS idx_profiles_gender 
ON profiles(gender) 
WHERE gender IS NOT NULL;

-- Índice GIN para intereses (búsqueda de arrays)
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin 
ON profiles USING GIN(interests) 
WHERE interests IS NOT NULL AND array_length(interests, 1) > 0;

-- Índice compuesto para filtros comunes (verificado + online)
CREATE INDEX IF NOT EXISTS idx_profiles_filters_composite 
ON profiles(is_verified, is_online, last_seen DESC) 
WHERE is_verified = true OR is_online = true;

-- Índice para S2 geohashing (si está implementado)
CREATE INDEX IF NOT EXISTS idx_profiles_s2_cell 
ON profiles(s2_cell_id, s2_level) 
WHERE s2_cell_id IS NOT NULL;

-- Índice para analytics de perfiles
CREATE INDEX IF NOT EXISTS idx_profiles_analytics 
ON profiles(created_at DESC, is_premium);

-- Índice para perfiles recientes (últimas 24 horas)
CREATE INDEX IF NOT EXISTS idx_profiles_recent 
ON profiles(created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- =====================================================
-- 3. TOKEN ANALYTICS QUERIES
-- =====================================================

-- Token analytics ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_token_analytics_created_at 
ON token_analytics(created_at DESC);

-- User token balances (solo con balances activos)
CREATE INDEX IF NOT EXISTS idx_user_token_balances_active 
ON user_token_balances(cmpx_balance, gtk_balance) 
WHERE cmpx_balance IS NOT NULL AND gtk_balance IS NOT NULL;

-- Staking records activos
CREATE INDEX IF NOT EXISTS idx_staking_records_active 
ON staking_records(is_active, created_at DESC) 
WHERE is_active = true;

-- Token transactions recientes (últimas 24 horas)
-- NOTA: Este índice parcial se actualiza periódicamente
CREATE INDEX IF NOT EXISTS idx_token_transactions_recent 
ON token_transactions(created_at DESC);

-- Índice para token transactions por tipo
CREATE INDEX IF NOT EXISTS idx_token_transactions_type 
ON token_transactions(token_type, created_at DESC);

-- =====================================================
-- 4. MESSAGES/CHAT QUERIES
-- =====================================================

-- Mensajes por chat ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at 
ON messages(chat_id, created_at DESC) 
WHERE chat_id IS NOT NULL;

-- Mensajes por sender
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC) 
WHERE sender_id IS NOT NULL;

-- Mensajes por receiver
CREATE INDEX IF NOT EXISTS idx_messages_receiver 
ON messages(receiver_id, created_at DESC) 
WHERE receiver_id IS NOT NULL;

-- Mensajes no leídos (query común)
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(receiver_id, is_read, created_at DESC) 
WHERE is_read = false;

-- =====================================================
-- 5. MATCHES QUERIES
-- =====================================================

-- Matches por usuario ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_matches_user_created_at 
ON matches(user_id, created_at DESC);

-- Matches mutuos (query común)
CREATE INDEX IF NOT EXISTS idx_matches_mutual 
ON matches(user_id, matched_user_id, status) 
WHERE status = 'matched';

-- =====================================================
-- 6. POSTS/STORIES QUERIES
-- =====================================================

-- Posts públicos ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_posts_public_created_at 
ON posts(is_public, created_at DESC) 
WHERE is_public = true;

-- Stories por usuario
CREATE INDEX IF NOT EXISTS idx_stories_user_created_at 
ON stories(user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

-- =====================================================
-- 7. REPORTS/MODERATION QUERIES
-- =====================================================

-- Reportes por estado
CREATE INDEX IF NOT EXISTS idx_reports_status 
ON reports(status, created_at DESC);

-- Reportes por tipo de contenido
CREATE INDEX IF NOT EXISTS idx_reports_content_type 
ON reports(content_type, created_at DESC);

-- =====================================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- =====================================================

-- Script para verificar índices creados (ejecutar después):
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- 1. Los índices parciales (con WHERE) ocupan menos espacio
--    pero solo aceleran queries que coincidan con la condición
-- 
-- 2. Los índices GIN son útiles para arrays pero ocupan más espacio
-- 
-- 3. Los índices compuestos son eficientes para filtros múltiples
-- 
-- 4. Monitorear el tamaño de los índices:
--    SELECT 
--      pg_size_pretty(pg_relation_size('idx_profiles_interests_gin')) as size;
-- 
-- 5. Los índices ralentizan INSERT/UPDATE, monitorear impacto
-- 
-- 6. Ejecutar ANALYZE después de crear índices:
--    ANALYZE profiles;
--    ANALYZE stories;
--    ANALYZE messages;
--    ANALYZE token_transactions;
-- 
-- =====================================================

