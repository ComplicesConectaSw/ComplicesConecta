-- =====================================================
-- AUDITORÍA COMPLETA Y REPARACIÓN AUTOMÁTICA SUPABASE
-- ComplicesConecta v2.1.1 - Sistema de Validación Integral
-- Fecha: 06 de septiembre, 2025 - 04:59 hrs
-- =====================================================

-- 🔍 PASO 1: VERIFICACIÓN DE TABLAS CRÍTICAS
DO $$
DECLARE
    tabla_faltante TEXT;
    tablas_criticas TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
    tabla TEXT;
    contador_tablas INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 === INICIANDO AUDITORÍA COMPLETA SUPABASE ===';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    
    RAISE NOTICE '📋 1. VERIFICANDO TABLAS CRÍTICAS...';
    
    FOREACH tabla IN ARRAY tablas_criticas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = tabla) THEN
            contador_tablas := contador_tablas + 1;
            RAISE NOTICE '✅ Tabla % existe', tabla;
        ELSE
            RAISE NOTICE '❌ FALTA: Tabla %', tabla;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 RESULTADO TABLAS: %/% existentes', contador_tablas, array_length(tablas_criticas, 1);
END $$;

-- 🔍 PASO 2: VERIFICACIÓN DE COLUMNAS CRÍTICAS EN PROFILES
DO $$
DECLARE
    columnas_criticas TEXT[] := ARRAY[
        'interests', 'looking_for', 'swinger_experience', 
        'age_range_min', 'age_range_max', 'max_distance'
    ];
    columna TEXT;
    contador_columnas INTEGER := 0;
BEGIN
    RAISE NOTICE '📋 2. VERIFICANDO COLUMNAS CRÍTICAS EN PROFILES...';
    
    FOREACH columna IN ARRAY columnas_criticas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = columna) THEN
            contador_columnas := contador_columnas + 1;
            RAISE NOTICE '✅ Columna profiles.% existe', columna;
        ELSE
            RAISE NOTICE '❌ FALTA: Columna profiles.%', columna;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 RESULTADO COLUMNAS: %/% existentes', contador_columnas, array_length(columnas_criticas, 1);
END $$;

-- 🔍 PASO 3: VERIFICACIÓN DE RLS Y POLÍTICAS
DO $$
DECLARE
    tabla TEXT;
    tablas_criticas TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
    rls_activo BOOLEAN;
    num_politicas INTEGER;
    contador_rls INTEGER := 0;
    total_politicas INTEGER := 0;
BEGIN
    RAISE NOTICE '🔒 3. VERIFICANDO RLS Y POLÍTICAS DE SEGURIDAD...';
    
    FOREACH tabla IN ARRAY tablas_criticas
    LOOP
        -- Verificar si la tabla existe primero
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = tabla) THEN
            
            -- Verificar RLS activo
            SELECT relrowsecurity INTO rls_activo
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = tabla;
            
            -- Contar políticas
            SELECT COUNT(*) INTO num_politicas
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = tabla;
            
            IF rls_activo THEN
                contador_rls := contador_rls + 1;
                total_politicas := total_politicas + num_politicas;
                RAISE NOTICE '✅ % - RLS: ✓ | Políticas: %', tabla, num_politicas;
            ELSE
                RAISE NOTICE '❌ % - RLS: ✗ | Políticas: %', tabla, num_politicas;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 RESULTADO RLS: %/% tablas con RLS activo', contador_rls, array_length(tablas_criticas, 1);
    RAISE NOTICE '📊 TOTAL POLÍTICAS: % políticas implementadas', total_politicas;
END $$;

-- 🔍 PASO 4: VERIFICACIÓN DE FUNCIONES CRÍTICAS
DO $$
DECLARE
    funciones_criticas TEXT[] := ARRAY[
        'has_role', 'handle_new_user', 'update_updated_at_column', 
        'exec_sql', 'detect_mutual_match', 'get_user_matches', 'get_potential_matches'
    ];
    funcion TEXT;
    contador_funciones INTEGER := 0;
    funciones_faltantes TEXT[] := '{}';
BEGIN
    RAISE NOTICE '⚙️ 4. VERIFICANDO FUNCIONES CRÍTICAS...';
    
    FOREACH funcion IN ARRAY funciones_criticas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.routines 
                  WHERE routine_schema = 'public' 
                  AND routine_name = funcion 
                  AND routine_type = 'FUNCTION') THEN
            contador_funciones := contador_funciones + 1;
            RAISE NOTICE '✅ Función % existe', funcion;
        ELSE
            funciones_faltantes := array_append(funciones_faltantes, funcion);
            RAISE NOTICE '❌ FALTA: Función %', funcion;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 RESULTADO FUNCIONES: %/% existentes', contador_funciones, array_length(funciones_criticas, 1);
    
    -- Mostrar funciones faltantes para corrección
    IF array_length(funciones_faltantes, 1) > 0 THEN
        RAISE NOTICE '🔧 FUNCIONES PENDIENTES DE CREAR: %', array_to_string(funciones_faltantes, ', ');
    END IF;
END $$;

-- 🔍 PASO 5: VERIFICACIÓN DE TRIGGERS
DO $$
DECLARE
    triggers_criticos TEXT[] := ARRAY[
        'trg_profiles_updated_at', 'trg_invitations_updated_at', 
        'trg_images_updated_at', 'on_auth_user_created'
    ];
    trigger_name TEXT;
    contador_triggers INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 5. VERIFICANDO TRIGGERS AUTOMÁTICOS...';
    
    FOREACH trigger_name IN ARRAY triggers_criticos
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.triggers 
                  WHERE trigger_schema = 'public' 
                  AND trigger_name = trigger_name) THEN
            contador_triggers := contador_triggers + 1;
            RAISE NOTICE '✅ Trigger % existe', trigger_name;
        ELSE
            RAISE NOTICE '❌ FALTA: Trigger %', trigger_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 RESULTADO TRIGGERS: %/% existentes', contador_triggers, array_length(triggers_criticos, 1);
END $$;

-- 🔍 PASO 6: VERIFICACIÓN DE BUCKETS DE STORAGE
DO $$
DECLARE
    buckets_criticos TEXT[] := ARRAY['profile-images', 'gallery-images', 'chat-media'];
    bucket_name TEXT;
    contador_buckets INTEGER := 0;
BEGIN
    RAISE NOTICE '🗄️ 6. VERIFICANDO BUCKETS DE STORAGE...';
    
    FOREACH bucket_name IN ARRAY buckets_criticos
    LOOP
        IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = bucket_name) THEN
            contador_buckets := contador_buckets + 1;
            RAISE NOTICE '✅ Bucket % existe', bucket_name;
        ELSE
            RAISE NOTICE '❌ FALTA: Bucket %', bucket_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 RESULTADO BUCKETS: %/% existentes', contador_buckets, array_length(buckets_criticos, 1);
END $$;

-- 🔍 PASO 7: VERIFICACIÓN DE ÍNDICES DE PERFORMANCE
DO $$
DECLARE
    contador_indices INTEGER;
BEGIN
    RAISE NOTICE '🚀 7. VERIFICANDO ÍNDICES DE PERFORMANCE...';
    
    SELECT COUNT(*) INTO contador_indices
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname NOT LIKE '%_pkey';
    
    RAISE NOTICE '📊 ÍNDICES PERSONALIZADOS: % índices encontrados', contador_indices;
    
    -- Mostrar algunos índices críticos
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%profiles%') THEN
        RAISE NOTICE '✅ Índices de profiles encontrados';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%matches%') THEN
        RAISE NOTICE '✅ Índices de matches encontrados';
    END IF;
END $$;

-- 📊 RESUMEN FINAL DE AUDITORÍA
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 === RESUMEN FINAL DE AUDITORÍA ===';
    RAISE NOTICE '⏰ Completado: %', NOW();
    RAISE NOTICE '';
    RAISE NOTICE '✅ Auditoría completa ejecutada';
    RAISE NOTICE '🔍 Verificadas: Tablas, Columnas, RLS, Funciones, Triggers, Buckets, Índices';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 PRÓXIMO PASO: Ejecutar script de correcciones automáticas';
    RAISE NOTICE '📁 Archivo: scripts/correcciones_automaticas_supabase.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=== FIN DE AUDITORÍA ===';
END $$;
