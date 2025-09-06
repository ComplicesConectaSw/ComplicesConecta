-- =====================================================
-- SCRIPT DE VALIDACIÓN FINAL POST-CORRECCIONES
-- ComplicesConecta v2.1.2 - Sistema de Validación Supabase
-- Fecha: 06 de septiembre, 2025 - 05:09 hrs
-- =====================================================

-- PASO 1: VALIDAR EXISTENCIA DE TABLAS CRÍTICAS
-- =====================================================

DO $$
DECLARE
    table_count INTEGER := 0;
    missing_tables TEXT[] := '{}';
    critical_tables TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions', 
        'images', 'image_permissions', 'gallery_access_requests', 
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE TABLAS CRÍTICAS ===';
    
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = table_name) THEN
            table_count := table_count + 1;
            RAISE NOTICE '✅ Tabla % existe', table_name;
        ELSE
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '❌ Tabla % NO existe', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Tablas encontradas: % de %', table_count, array_length(critical_tables, 1);
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Tablas faltantes: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- PASO 2: VALIDAR COLUMNAS CRÍTICAS EN PROFILES
-- =====================================================

DO $$
DECLARE
    column_count INTEGER := 0;
    missing_columns TEXT[] := '{}';
    critical_columns TEXT[] := ARRAY[
        'interests', 'looking_for', 'swinger_experience', 
        'age_range_min', 'age_range_max', 'max_distance'
    ];
    column_name TEXT;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE COLUMNAS CRÍTICAS EN PROFILES ===';
    
    FOREACH column_name IN ARRAY critical_columns
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = column_name) THEN
            column_count := column_count + 1;
            RAISE NOTICE '✅ Columna profiles.% existe', column_name;
        ELSE
            missing_columns := array_append(missing_columns, column_name);
            RAISE NOTICE '❌ Columna profiles.% NO existe', column_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Columnas encontradas: % de %', column_count, array_length(critical_columns, 1);
END $$;

-- PASO 3: VALIDAR RLS HABILITADO EN TODAS LAS TABLAS
-- =====================================================

DO $$
DECLARE
    rls_count INTEGER := 0;
    no_rls_tables TEXT[] := '{}';
    critical_tables TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions', 
        'images', 'image_permissions', 'gallery_access_requests', 
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE RLS (ROW LEVEL SECURITY) ===';
    
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = table_name AND n.nspname = 'public';
        
        IF rls_enabled THEN
            rls_count := rls_count + 1;
            RAISE NOTICE '✅ RLS habilitado en %', table_name;
        ELSE
            no_rls_tables := array_append(no_rls_tables, table_name);
            RAISE NOTICE '❌ RLS NO habilitado en %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Tablas con RLS: % de %', rls_count, array_length(critical_tables, 1);
END $$;

-- PASO 4: VALIDAR FUNCIONES CRÍTICAS
-- =====================================================

DO $$
DECLARE
    function_count INTEGER := 0;
    missing_functions TEXT[] := '{}';
    critical_functions TEXT[] := ARRAY[
        'has_role', 'handle_new_user', 'update_updated_at_column', 
        'exec_sql', 'detect_mutual_match', 'get_user_matches', 'get_potential_matches'
    ];
    function_name TEXT;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE FUNCIONES CRÍTICAS ===';
    
    FOREACH function_name IN ARRAY critical_functions
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.routines 
                   WHERE routine_schema = 'public' AND routine_name = function_name) THEN
            function_count := function_count + 1;
            RAISE NOTICE '✅ Función % existe', function_name;
        ELSE
            missing_functions := array_append(missing_functions, function_name);
            RAISE NOTICE '❌ Función % NO existe', function_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Funciones encontradas: % de %', function_count, array_length(critical_functions, 1);
END $$;

-- PASO 5: VALIDAR TRIGGERS AUTOMÁTICOS
-- =====================================================

DO $$
DECLARE
    trigger_count INTEGER := 0;
    missing_triggers TEXT[] := '{}';
    critical_triggers TEXT[] := ARRAY[
        'trg_profiles_updated_at', 'trg_invitations_updated_at', 
        'trg_images_updated_at', 'on_auth_user_created'
    ];
    trigger_name TEXT;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE TRIGGERS AUTOMÁTICOS ===';
    
    FOREACH trigger_name IN ARRAY critical_triggers
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = trigger_name) THEN
            trigger_count := trigger_count + 1;
            RAISE NOTICE '✅ Trigger % existe', trigger_name;
        ELSE
            missing_triggers := array_append(missing_triggers, trigger_name);
            RAISE NOTICE '❌ Trigger % NO existe', trigger_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Triggers encontrados: % de %', trigger_count, array_length(critical_triggers, 1);
END $$;

-- PASO 6: VALIDAR BUCKETS DE STORAGE
-- =====================================================

DO $$
DECLARE
    bucket_count INTEGER := 0;
    missing_buckets TEXT[] := '{}';
    critical_buckets TEXT[] := ARRAY['profile-images', 'gallery-images', 'chat-media'];
    bucket_name TEXT;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE STORAGE BUCKETS ===';
    
    FOREACH bucket_name IN ARRAY critical_buckets
    LOOP
        IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = bucket_name) THEN
            bucket_count := bucket_count + 1;
            RAISE NOTICE '✅ Bucket % existe', bucket_name;
        ELSE
            missing_buckets := array_append(missing_buckets, bucket_name);
            RAISE NOTICE '❌ Bucket % NO existe', bucket_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Buckets encontrados: % de %', bucket_count, array_length(critical_buckets, 1);
END $$;

-- PASO 7: VALIDAR ÍNDICES DE PERFORMANCE
-- =====================================================

DO $$
DECLARE
    index_count INTEGER := 0;
    total_indexes INTEGER;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE ÍNDICES DE PERFORMANCE ===';
    
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      AND indexname IN (
          'idx_profiles_interests_gin', 'idx_profiles_looking_for_gin',
          'idx_user_likes_liker_id', 'idx_user_likes_liked_id',
          'idx_matches_user1_id', 'idx_matches_user2_id',
          'idx_invitations_sender_id', 'idx_invitations_receiver_id',
          'idx_images_user_id', 'idx_messages_room_id'
      );
    
    RAISE NOTICE 'Índices críticos encontrados: %', index_count;
    RAISE NOTICE 'Total de índices personalizados: %', total_indexes;
END $$;

-- PASO 8: VALIDAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER := 0;
    total_policies INTEGER;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN DE POLÍTICAS RLS ===';
    
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename IN (
          'profiles', 'user_roles', 'invitations', 'gallery_permissions', 
          'images', 'user_likes', 'matches', 'chat_rooms', 'messages'
      );
    
    RAISE NOTICE 'Políticas RLS encontradas: %', policy_count;
    RAISE NOTICE 'Total de políticas: %', total_policies;
END $$;

-- PASO 9: CALCULAR PUNTUACIÓN FINAL DEL SISTEMA
-- =====================================================

DO $$
DECLARE
    -- Contadores para cada categoría
    tables_score INTEGER := 0;
    columns_score INTEGER := 0;
    rls_score INTEGER := 0;
    functions_score INTEGER := 0;
    triggers_score INTEGER := 0;
    buckets_score INTEGER := 0;
    indexes_score INTEGER := 0;
    policies_score INTEGER := 0;
    
    -- Puntuación final
    total_score INTEGER := 0;
    max_score INTEGER := 800; -- 8 categorías × 100 puntos cada una
    final_percentage INTEGER := 0;
    
    -- Variables auxiliares
    temp_count INTEGER;
    expected_count INTEGER;
BEGIN
    RAISE NOTICE '=== CÁLCULO DE PUNTUACIÓN FINAL ===';
    
    -- 1. Puntuación de Tablas (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN (
          'profiles', 'user_roles', 'invitations', 'gallery_permissions', 
          'images', 'image_permissions', 'gallery_access_requests', 
          'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
          'user_likes', 'matches', 'match_interactions'
      );
    expected_count := 14;
    tables_score := (temp_count * 100) / expected_count;
    RAISE NOTICE 'Puntuación Tablas: %/100 (% de % tablas)', tables_score, temp_count, expected_count;
    
    -- 2. Puntuación de Columnas Críticas (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
      AND column_name IN ('interests', 'looking_for', 'swinger_experience', 'age_range_min', 'age_range_max', 'max_distance');
    expected_count := 6;
    columns_score := (temp_count * 100) / expected_count;
    RAISE NOTICE 'Puntuación Columnas: %/100 (% de % columnas)', columns_score, temp_count, expected_count;
    
    -- 3. Puntuación RLS (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions', 
        'images', 'image_permissions', 'gallery_access_requests', 
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ) AND n.nspname = 'public' AND c.relrowsecurity = true;
    expected_count := 14;
    rls_score := (temp_count * 100) / expected_count;
    RAISE NOTICE 'Puntuación RLS: %/100 (% de % tablas con RLS)', rls_score, temp_count, expected_count;
    
    -- 4. Puntuación de Funciones (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
      AND routine_name IN ('has_role', 'handle_new_user', 'update_updated_at_column', 'exec_sql', 'detect_mutual_match', 'get_user_matches', 'get_potential_matches');
    expected_count := 7;
    functions_score := (temp_count * 100) / expected_count;
    RAISE NOTICE 'Puntuación Funciones: %/100 (% de % funciones)', functions_score, temp_count, expected_count;
    
    -- 5. Puntuación de Triggers (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM information_schema.triggers 
    WHERE trigger_name IN ('trg_profiles_updated_at', 'trg_invitations_updated_at', 'trg_images_updated_at', 'on_auth_user_created');
    expected_count := 4;
    triggers_score := (temp_count * 100) / expected_count;
    RAISE NOTICE 'Puntuación Triggers: %/100 (% de % triggers)', triggers_score, temp_count, expected_count;
    
    -- 6. Puntuación de Buckets (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM storage.buckets 
    WHERE id IN ('profile-images', 'gallery-images', 'chat-media');
    expected_count := 3;
    buckets_score := (temp_count * 100) / expected_count;
    RAISE NOTICE 'Puntuación Buckets: %/100 (% de % buckets)', buckets_score, temp_count, expected_count;
    
    -- 7. Puntuación de Índices (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%';
    -- Consideramos que 20+ índices personalizados es excelente
    indexes_score := LEAST(100, (temp_count * 100) / 20);
    RAISE NOTICE 'Puntuación Índices: %/100 (% índices personalizados)', indexes_score, temp_count;
    
    -- 8. Puntuación de Políticas RLS (100 puntos máximo)
    SELECT COUNT(*) INTO temp_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    -- Consideramos que 30+ políticas RLS es excelente
    policies_score := LEAST(100, (temp_count * 100) / 30);
    RAISE NOTICE 'Puntuación Políticas: %/100 (% políticas RLS)', policies_score, temp_count;
    
    -- Calcular puntuación final
    total_score := tables_score + columns_score + rls_score + functions_score + triggers_score + buckets_score + indexes_score + policies_score;
    final_percentage := (total_score * 100) / max_score;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PUNTUACIÓN FINAL DEL SISTEMA ===';
    RAISE NOTICE 'Puntuación Total: %/% puntos', total_score, max_score;
    RAISE NOTICE 'Porcentaje Final: %/100', final_percentage;
    
    -- Clasificación del sistema
    IF final_percentage >= 95 THEN
        RAISE NOTICE 'Estado: EXCELENTE - PRODUCTION READY';
    ELSIF final_percentage >= 85 THEN
        RAISE NOTICE 'Estado: BUENO - CASI LISTO PARA PRODUCCIÓN';
    ELSIF final_percentage >= 70 THEN
        RAISE NOTICE 'Estado: ACEPTABLE - REQUIERE MEJORAS MENORES';
    ELSIF final_percentage >= 50 THEN
        RAISE NOTICE 'Estado: DEFICIENTE - REQUIERE CORRECCIONES IMPORTANTES';
    ELSE
        RAISE NOTICE 'Estado: CRÍTICO - SISTEMA NO FUNCIONAL';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== RECOMENDACIONES ===';
    
    IF tables_score < 100 THEN
        RAISE NOTICE '⚠️  Ejecutar script fix_database.sql para crear tablas faltantes';
    END IF;
    
    IF rls_score < 100 THEN
        RAISE NOTICE '⚠️  Ejecutar script fix_rls_policies.sql para habilitar RLS';
    END IF;
    
    IF functions_score < 100 THEN
        RAISE NOTICE '⚠️  Ejecutar script fix_database.sql para crear funciones faltantes';
    END IF;
    
    IF buckets_score < 100 THEN
        RAISE NOTICE '⚠️  Ejecutar script fix_storage_buckets.sql para crear buckets';
    END IF;
    
    IF indexes_score < 80 THEN
        RAISE NOTICE '⚠️  Ejecutar script fix_indexes.sql para mejorar performance';
    END IF;
    
    IF final_percentage >= 95 THEN
        RAISE NOTICE '✅ Sistema listo para producción inmediata';
    END IF;
END $$;

-- =====================================================
-- FIN DEL SCRIPT DE VALIDACIÓN FINAL
-- =====================================================

-- Mensaje de finalización
SELECT 'VALIDACIÓN FINAL COMPLETADA - ComplicesConecta v2.1.2' as resultado;
