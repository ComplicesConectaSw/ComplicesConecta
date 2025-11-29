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

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'stories'
    ) THEN
        -- Índice compuesto para queries de feed público ordenadas por fecha
        CREATE INDEX IF NOT EXISTS idx_stories_public_created_at 
        ON stories(is_public, created_at DESC) 
        WHERE is_public = true;

        -- Índice para stories con likes/comments/shares (para agregaciones)
        CREATE INDEX IF NOT EXISTS idx_stories_engagement 
        ON stories(created_at DESC, is_public) 
        WHERE is_public = true;
    END IF;
END $$;

-- =====================================================
-- 2. PROFILES QUERIES - FILTROS BÁSICOS
-- =====================================================

-- Índice para edad (filtro común)
CREATE INDEX IF NOT EXISTS idx_profiles_age 
ON profiles(age) 
WHERE age IS NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'gender'
    ) THEN
        -- Índice para género (filtro común)
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender) WHERE gender IS NOT NULL';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'interests'
    ) THEN
        -- Índice GIN para intereses (búsqueda de arrays)
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin ON public.profiles USING GIN(interests) WHERE interests IS NOT NULL AND array_length(interests, 1) > 0';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'is_verified'
    ) THEN
        -- Índice compuesto para filtros comunes (verificado)
        -- Nota: profiles no tiene is_active, solo is_verified
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_filters_composite ON public.profiles(is_verified, updated_at DESC) WHERE is_verified = true';
    END IF;
END $$;

-- Índice para S2 geohashing (si está implementado)
CREATE INDEX IF NOT EXISTS idx_profiles_s2_cell 
ON profiles(s2_cell_id, s2_level) 
WHERE s2_cell_id IS NOT NULL;

-- Índice para analytics de perfiles
CREATE INDEX IF NOT EXISTS idx_profiles_analytics 
ON profiles(created_at DESC, is_premium);

-- Índice para perfiles recientes ordenados por fecha
-- Nota: No se puede usar NOW() en WHERE de índice parcial (no es inmutable)
-- Este índice cubre todos los perfiles ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_profiles_recent 
ON profiles(created_at DESC);

-- =====================================================
-- 3. TOKEN ANALYTICS QUERIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'token_analytics'
    ) THEN
        -- Token analytics ordenados por fecha
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_token_analytics_created_at ON public.token_analytics(created_at DESC)';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_token_balances'
    ) THEN
        -- User token balances (solo con balances activos)
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_token_balances_active ON public.user_token_balances(cmpx_balance, gtk_balance) WHERE cmpx_balance IS NOT NULL AND gtk_balance IS NOT NULL';
    END IF;
END $$;

-- Staking records (si existe la tabla)
-- Nota: Verificar que la tabla staking_records exista y tenga la columna is_active
-- CREATE INDEX IF NOT EXISTS idx_staking_records_active 
-- ON staking_records(is_active, created_at DESC) 
-- WHERE is_active = true;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'token_transactions'
    ) THEN
        -- Token transactions recientes (últimas 24 horas)
        -- NOTA: Este índice parcial se actualiza periódicamente
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_token_transactions_recent ON public.token_transactions(created_at DESC)';

        -- Índice para token transactions por tipo
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON public.token_transactions(token_type, created_at DESC)';
    END IF;
END $$;

-- =====================================================
-- 4. MESSAGES/CHAT QUERIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'messages'
    ) THEN
        -- Mensajes por room ordenados por fecha
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_room_created_at ON public.messages(room_id, created_at DESC) WHERE room_id IS NOT NULL';

        -- Mensajes por sender
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC) WHERE sender_id IS NOT NULL';
    END IF;
END $$;

-- Nota: La tabla 'messages' no tiene 'receiver_id' ni 'is_read'
-- Para mensajes no leídos, usar tabla 'chat_messages' que sí tiene 'is_read'

-- =====================================================
-- 5. MATCHES QUERIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'matches'
    ) THEN
        -- Matches por usuario ordenados por fecha
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_matches_user1_created_at ON public.matches(user1_id, created_at DESC)';

        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_matches_user2_created_at ON public.matches(user2_id, created_at DESC)';

        -- Matches mutuos (query común)
        -- Nota: Verificar columnas reales de matches (puede no tener compatibility_score)
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_matches_mutual ON public.matches(user1_id, user2_id, created_at DESC)';
    END IF;
END $$;

-- =====================================================
-- 6. POSTS/STORIES QUERIES
-- =====================================================

-- Posts públicos ordenados por fecha
-- Nota: Verificar que la tabla 'posts' exista (puede ser que solo exista 'stories')
-- CREATE INDEX IF NOT EXISTS idx_posts_public_created_at 
-- ON posts(is_public, created_at DESC) 
-- WHERE is_public = true;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'stories'
    ) THEN
        -- Stories por usuario
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_stories_user_created_at ON public.stories(user_id, created_at DESC) WHERE user_id IS NOT NULL';
    END IF;
END $$;

-- =====================================================
-- 7. REPORTS/MODERATION QUERIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reports'
          AND column_name = 'status'
    ) THEN
        -- Reportes por estado
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC)';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reports'
          AND column_name = 'content_type'
    ) THEN
        -- Reportes por tipo de contenido
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reports_content_type ON public.reports(content_type, created_at DESC)';
    END IF;
END $$;

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

