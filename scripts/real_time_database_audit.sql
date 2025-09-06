-- ==========================================
-- AUDITORÍA INTEGRAL EN TIEMPO REAL - ComplicesConecta v2.1.1
-- Fecha: 2025-09-06 04:50 UTC-6
-- Propósito: Validación completa estado BD actual
-- ==========================================

-- 1. VERIFICAR TABLAS CRÍTICAS Y ESTRUCTURA
DO $$
DECLARE
    table_count INTEGER;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    critical_tables TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO TABLAS CRÍTICAS...';
    
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = table_name;
        
        IF table_count = 0 THEN
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '❌ TABLA FALTANTE: %', table_name;
        ELSE
            RAISE NOTICE '✅ TABLA OK: %', table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'CRÍTICO: Faltan % tablas: %', array_length(missing_tables, 1), array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ TODAS LAS TABLAS CRÍTICAS EXISTEN (%/14)', array_length(critical_tables, 1);
END $$;

-- 2. VERIFICAR COLUMNAS CRÍTICAS EN PROFILES
DO $$
DECLARE
    column_count INTEGER;
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    critical_columns TEXT[] := ARRAY[
        'interests', 'looking_for', 'swinger_experience',
        'age_range_min', 'age_range_max', 'max_distance'
    ];
    column_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO COLUMNAS CRÍTICAS EN PROFILES...';
    
    FOREACH column_name IN ARRAY critical_columns
    LOOP
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = column_name;
        
        IF column_count = 0 THEN
            missing_columns := array_append(missing_columns, column_name);
            RAISE NOTICE '❌ COLUMNA FALTANTE: profiles.%', column_name;
        ELSE
            RAISE NOTICE '✅ COLUMNA OK: profiles.%', column_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'CRÍTICO: Faltan columnas en profiles: %', array_to_string(missing_columns, ', ');
    END IF;
    
    RAISE NOTICE '✅ TODAS LAS COLUMNAS CRÍTICAS EXISTEN EN PROFILES';
END $$;

-- 3. VERIFICAR FUNCIONES CRÍTICAS
DO $$
DECLARE
    function_count INTEGER;
    missing_functions TEXT[] := ARRAY[]::TEXT[];
    critical_functions TEXT[] := ARRAY[
        'has_role', 'handle_new_user', 'update_updated_at_column', 'exec_sql'
    ];
    pending_functions TEXT[] := ARRAY[
        'detect_mutual_match', 'get_user_matches', 'get_potential_matches'
    ];
    function_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO FUNCIONES CRÍTICAS...';
    
    -- Verificar funciones existentes
    FOREACH function_name IN ARRAY critical_functions
    LOOP
        SELECT COUNT(*) INTO function_count
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = function_name;
        
        IF function_count = 0 THEN
            missing_functions := array_append(missing_functions, function_name);
            RAISE NOTICE '❌ FUNCIÓN FALTANTE: %', function_name;
        ELSE
            RAISE NOTICE '✅ FUNCIÓN OK: %', function_name;
        END IF;
    END LOOP;
    
    -- Verificar funciones pendientes
    FOREACH function_name IN ARRAY pending_functions
    LOOP
        SELECT COUNT(*) INTO function_count
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = function_name;
        
        IF function_count = 0 THEN
            RAISE NOTICE '⚠️ FUNCIÓN PENDIENTE: %', function_name;
        ELSE
            RAISE NOTICE '✅ FUNCIÓN IMPLEMENTADA: %', function_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE EXCEPTION 'CRÍTICO: Faltan funciones: %', array_to_string(missing_functions, ', ');
    END IF;
END $$;

-- 4. VERIFICAR RLS Y POLÍTICAS
DO $$
DECLARE
    rls_count INTEGER := 0;
    policy_count INTEGER := 0;
    table_name TEXT;
    critical_tables TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO RLS Y POLÍTICAS...';
    
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        -- Verificar RLS habilitado
        SELECT COUNT(*) INTO rls_count
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = table_name 
        AND rowsecurity = true;
        
        IF rls_count = 0 THEN
            RAISE NOTICE '❌ RLS DESHABILITADO: %', table_name;
        ELSE
            RAISE NOTICE '✅ RLS OK: %', table_name;
        END IF;
        
        -- Contar políticas
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = table_name;
        
        RAISE NOTICE '📋 POLÍTICAS EN %: %', table_name, policy_count;
    END LOOP;
    
    -- Total de políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ TOTAL POLÍTICAS RLS ACTIVAS: %', policy_count;
END $$;

-- 5. VERIFICAR TRIGGERS
DO $$
DECLARE
    trigger_count INTEGER;
    missing_triggers TEXT[] := ARRAY[]::TEXT[];
    critical_triggers TEXT[] := ARRAY[
        'trg_profiles_updated_at', 'trg_invitations_updated_at',
        'trg_images_updated_at', 'on_auth_user_created'
    ];
    trigger_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO TRIGGERS...';
    
    FOREACH trigger_name IN ARRAY critical_triggers
    LOOP
        SELECT COUNT(*) INTO trigger_count
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name = trigger_name;
        
        IF trigger_count = 0 THEN
            missing_triggers := array_append(missing_triggers, trigger_name);
            RAISE NOTICE '❌ TRIGGER FALTANTE: %', trigger_name;
        ELSE
            RAISE NOTICE '✅ TRIGGER OK: %', trigger_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_triggers, 1) > 0 THEN
        RAISE WARNING 'Faltan triggers: %', array_to_string(missing_triggers, ', ');
    END IF;
END $$;

-- 6. VERIFICAR ÍNDICES DE PERFORMANCE
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO ÍNDICES DE PERFORMANCE...';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '📊 ÍNDICES DE PERFORMANCE: %', index_count;
    
    -- Verificar índices críticos específicos
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname IN ('idx_profiles_interests', 'idx_user_likes_composite', 'idx_messages_room_created');
    
    RAISE NOTICE '📊 ÍNDICES CRÍTICOS ESPECÍFICOS: %/3', index_count;
END $$;

-- 7. VERIFICAR STORAGE BUCKETS
DO $$
DECLARE
    bucket_count INTEGER;
    missing_buckets TEXT[] := ARRAY[]::TEXT[];
    critical_buckets TEXT[] := ARRAY['profile-images', 'gallery-images', 'chat-media'];
    bucket_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO STORAGE BUCKETS...';
    
    FOREACH bucket_name IN ARRAY critical_buckets
    LOOP
        SELECT COUNT(*) INTO bucket_count
        FROM storage.buckets 
        WHERE name = bucket_name;
        
        IF bucket_count = 0 THEN
            missing_buckets := array_append(missing_buckets, bucket_name);
            RAISE NOTICE '❌ BUCKET FALTANTE: %', bucket_name;
        ELSE
            RAISE NOTICE '✅ BUCKET OK: %', bucket_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_buckets, 1) > 0 THEN
        RAISE WARNING 'Faltan buckets: %', array_to_string(missing_buckets, ', ');
    END IF;
END $$;

-- 8. VERIFICAR MIGRACIONES DUPLICADAS
DO $$
DECLARE
    duplicate_count INTEGER;
    migration_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO MIGRACIONES DUPLICADAS...';
    
    -- Contar duplicados por version
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT version, COUNT(*) as cnt
        FROM supabase_migrations.schema_migrations
        GROUP BY version
        HAVING COUNT(*) > 1
    ) duplicates;
    
    -- Total migraciones
    SELECT COUNT(*) INTO migration_count
    FROM supabase_migrations.schema_migrations;
    
    IF duplicate_count > 0 THEN
        RAISE WARNING 'ENCONTRADAS % MIGRACIONES DUPLICADAS', duplicate_count;
        
        -- Mostrar duplicados
        FOR duplicate_count IN 
            SELECT version
            FROM supabase_migrations.schema_migrations
            GROUP BY version
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE '🔄 MIGRACIÓN DUPLICADA: %', duplicate_count;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ NO HAY MIGRACIONES DUPLICADAS';
    END IF;
    
    RAISE NOTICE '📊 TOTAL MIGRACIONES: %', migration_count;
END $$;

-- 9. RESUMEN FINAL
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
    trigger_count INTEGER;
    index_count INTEGER;
    bucket_count INTEGER;
    score INTEGER := 0;
    max_score INTEGER := 100;
BEGIN
    RAISE NOTICE '📊 GENERANDO RESUMEN FINAL...';
    
    -- Contar elementos
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
    SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public';
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets;
    
    -- Calcular puntuación
    IF table_count >= 14 THEN score := score + 25; END IF;
    IF function_count >= 4 THEN score := score + 15; END IF;
    IF policy_count >= 20 THEN score := score + 20; END IF;
    IF trigger_count >= 4 THEN score := score + 10; END IF;
    IF index_count >= 10 THEN score := score + 15; END IF;
    IF bucket_count >= 3 THEN score := score + 15; END IF;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🏆 RESUMEN AUDITORÍA BD - ComplicesConecta';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '📊 TABLAS: % (req: 14)', table_count;
    RAISE NOTICE '🔧 FUNCIONES: % (req: 4+)', function_count;
    RAISE NOTICE '🛡️ POLÍTICAS RLS: % (req: 20+)', policy_count;
    RAISE NOTICE '⚡ TRIGGERS: % (req: 4)', trigger_count;
    RAISE NOTICE '📈 ÍNDICES: % (req: 10+)', index_count;
    RAISE NOTICE '💾 BUCKETS: % (req: 3)', bucket_count;
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🎯 PUNTUACIÓN BD: %/% (%%%)', score, max_score, ROUND((score::DECIMAL / max_score) * 100);
    
    IF score >= 90 THEN
        RAISE NOTICE '✅ ESTADO: EXCELENTE - LISTO PRODUCCIÓN';
    ELSIF score >= 75 THEN
        RAISE NOTICE '⚠️ ESTADO: BUENO - MEJORAS MENORES';
    ELSIF score >= 60 THEN
        RAISE NOTICE '⚠️ ESTADO: REGULAR - MEJORAS REQUERIDAS';
    ELSE
        RAISE NOTICE '❌ ESTADO: CRÍTICO - CORRECCIONES URGENTES';
    END IF;
    
    RAISE NOTICE '==========================================';
END $$;
