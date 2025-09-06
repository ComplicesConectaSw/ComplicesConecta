-- =====================================================
-- VALIDACIÓN FINAL SUPABASE - VERIFICACIÓN POST-CORRECCIONES
-- ComplicesConecta v2.1.1 - Validación Integral del Sistema
-- Fecha: 06 de septiembre, 2025 - 04:59 hrs
-- =====================================================

-- 🔍 VALIDACIÓN FINAL: VERIFICAR QUE TODAS LAS CORRECCIONES SE APLICARON CORRECTAMENTE
DO $$
DECLARE
    -- Contadores para métricas finales
    tablas_existentes INTEGER := 0;
    columnas_existentes INTEGER := 0;
    funciones_existentes INTEGER := 0;
    triggers_existentes INTEGER := 0;
    buckets_existentes INTEGER := 0;
    tablas_con_rls INTEGER := 0;
    total_politicas INTEGER := 0;
    indices_performance INTEGER := 0;
    
    -- Arrays de elementos críticos
    tablas_criticas TEXT[] := ARRAY[
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];
    
    columnas_criticas TEXT[] := ARRAY[
        'interests', 'looking_for', 'swinger_experience', 
        'age_range_min', 'age_range_max', 'max_distance'
    ];
    
    funciones_criticas TEXT[] := ARRAY[
        'has_role', 'handle_new_user', 'update_updated_at_column', 
        'exec_sql', 'detect_mutual_match', 'get_user_matches', 'get_potential_matches'
    ];
    
    triggers_criticos TEXT[] := ARRAY[
        'trg_profiles_updated_at', 'trg_invitations_updated_at', 
        'trg_images_updated_at', 'on_auth_user_created'
    ];
    
    buckets_criticos TEXT[] := ARRAY['profile-images', 'gallery-images', 'chat-media'];
    
    -- Variables temporales
    tabla TEXT;
    columna TEXT;
    funcion TEXT;
    trigger_name TEXT;
    bucket_name TEXT;
    rls_activo BOOLEAN;
    num_politicas INTEGER;
    
    -- Puntuación final
    puntuacion_total NUMERIC := 0;
    puntuacion_maxima NUMERIC := 700; -- 100 puntos por cada categoría
    
BEGIN
    RAISE NOTICE '🔍 === VALIDACIÓN FINAL POST-CORRECCIONES ===';
    RAISE NOTICE '⏰ Iniciado: %', NOW();
    RAISE NOTICE '';
    
    -- ✅ 1. VALIDAR TABLAS CRÍTICAS (100 puntos)
    RAISE NOTICE '📋 1. VALIDANDO TABLAS CRÍTICAS...';
    FOREACH tabla IN ARRAY tablas_criticas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = tabla) THEN
            tablas_existentes := tablas_existentes + 1;
            RAISE NOTICE '   ✅ %', tabla;
        ELSE
            RAISE NOTICE '   ❌ FALTA: %', tabla;
        END IF;
    END LOOP;
    
    puntuacion_total := puntuacion_total + (tablas_existentes * 100.0 / array_length(tablas_criticas, 1));
    RAISE NOTICE '   📊 Resultado: %/% tablas (%% puntos)', 
        tablas_existentes, array_length(tablas_criticas, 1),
        ROUND(tablas_existentes * 100.0 / array_length(tablas_criticas, 1));
    
    -- ✅ 2. VALIDAR COLUMNAS CRÍTICAS EN PROFILES (100 puntos)
    RAISE NOTICE '';
    RAISE NOTICE '📋 2. VALIDANDO COLUMNAS CRÍTICAS EN PROFILES...';
    FOREACH columna IN ARRAY columnas_criticas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = columna) THEN
            columnas_existentes := columnas_existentes + 1;
            RAISE NOTICE '   ✅ profiles.%', columna;
        ELSE
            RAISE NOTICE '   ❌ FALTA: profiles.%', columna;
        END IF;
    END LOOP;
    
    puntuacion_total := puntuacion_total + (columnas_existentes * 100.0 / array_length(columnas_criticas, 1));
    RAISE NOTICE '   📊 Resultado: %/% columnas (%% puntos)', 
        columnas_existentes, array_length(columnas_criticas, 1),
        ROUND(columnas_existentes * 100.0 / array_length(columnas_criticas, 1));
    
    -- ✅ 3. VALIDAR FUNCIONES CRÍTICAS (100 puntos)
    RAISE NOTICE '';
    RAISE NOTICE '⚙️ 3. VALIDANDO FUNCIONES CRÍTICAS...';
    FOREACH funcion IN ARRAY funciones_criticas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.routines 
                  WHERE routine_schema = 'public' 
                  AND routine_name = funcion 
                  AND routine_type = 'FUNCTION') THEN
            funciones_existentes := funciones_existentes + 1;
            RAISE NOTICE '   ✅ %', funcion;
        ELSE
            RAISE NOTICE '   ❌ FALTA: %', funcion;
        END IF;
    END LOOP;
    
    puntuacion_total := puntuacion_total + (funciones_existentes * 100.0 / array_length(funciones_criticas, 1));
    RAISE NOTICE '   📊 Resultado: %/% funciones (%% puntos)', 
        funciones_existentes, array_length(funciones_criticas, 1),
        ROUND(funciones_existentes * 100.0 / array_length(funciones_criticas, 1));
    
    -- ✅ 4. VALIDAR TRIGGERS (100 puntos)
    RAISE NOTICE '';
    RAISE NOTICE '🔄 4. VALIDANDO TRIGGERS AUTOMÁTICOS...';
    FOREACH trigger_name IN ARRAY triggers_criticos
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.triggers 
                  WHERE trigger_schema = 'public' 
                  AND trigger_name = trigger_name) THEN
            triggers_existentes := triggers_existentes + 1;
            RAISE NOTICE '   ✅ %', trigger_name;
        ELSE
            RAISE NOTICE '   ❌ FALTA: %', trigger_name;
        END IF;
    END LOOP;
    
    puntuacion_total := puntuacion_total + (triggers_existentes * 100.0 / array_length(triggers_criticos, 1));
    RAISE NOTICE '   📊 Resultado: %/% triggers (%% puntos)', 
        triggers_existentes, array_length(triggers_criticos, 1),
        ROUND(triggers_existentes * 100.0 / array_length(triggers_criticos, 1));
    
    -- ✅ 5. VALIDAR BUCKETS DE STORAGE (100 puntos)
    RAISE NOTICE '';
    RAISE NOTICE '🗄️ 5. VALIDANDO BUCKETS DE STORAGE...';
    FOREACH bucket_name IN ARRAY buckets_criticos
    LOOP
        IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = bucket_name) THEN
            buckets_existentes := buckets_existentes + 1;
            RAISE NOTICE '   ✅ %', bucket_name;
        ELSE
            RAISE NOTICE '   ❌ FALTA: %', bucket_name;
        END IF;
    END LOOP;
    
    puntuacion_total := puntuacion_total + (buckets_existentes * 100.0 / array_length(buckets_criticos, 1));
    RAISE NOTICE '   📊 Resultado: %/% buckets (%% puntos)', 
        buckets_existentes, array_length(buckets_criticos, 1),
        ROUND(buckets_existentes * 100.0 / array_length(buckets_criticos, 1));
    
    -- ✅ 6. VALIDAR RLS Y POLÍTICAS (100 puntos)
    RAISE NOTICE '';
    RAISE NOTICE '🔒 6. VALIDANDO RLS Y POLÍTICAS DE SEGURIDAD...';
    FOREACH tabla IN ARRAY tablas_criticas
    LOOP
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
                tablas_con_rls := tablas_con_rls + 1;
                total_politicas := total_politicas + num_politicas;
                RAISE NOTICE '   ✅ % - RLS: ✓ | Políticas: %', tabla, num_politicas;
            ELSE
                RAISE NOTICE '   ❌ % - RLS: ✗ | Políticas: %', tabla, num_politicas;
            END IF;
        END IF;
    END LOOP;
    
    puntuacion_total := puntuacion_total + (tablas_con_rls * 100.0 / array_length(tablas_criticas, 1));
    RAISE NOTICE '   📊 Resultado: %/% tablas con RLS (%% puntos)', 
        tablas_con_rls, array_length(tablas_criticas, 1),
        ROUND(tablas_con_rls * 100.0 / array_length(tablas_criticas, 1));
    RAISE NOTICE '   📊 Total políticas: % implementadas', total_politicas;
    
    -- ✅ 7. VALIDAR ÍNDICES DE PERFORMANCE (100 puntos)
    RAISE NOTICE '';
    RAISE NOTICE '🚀 7. VALIDANDO ÍNDICES DE PERFORMANCE...';
    
    SELECT COUNT(*) INTO indices_performance
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname NOT LIKE '%_pkey'
    AND (indexname LIKE '%user_likes%' 
         OR indexname LIKE '%matches%' 
         OR indexname LIKE '%profiles%');
    
    -- Puntuación basada en número de índices críticos (mínimo 4 esperados)
    puntuacion_total := puntuacion_total + LEAST(indices_performance * 25.0, 100);
    RAISE NOTICE '   📊 Índices críticos encontrados: %', indices_performance;
    RAISE NOTICE '   📊 Puntuación índices: %% puntos', ROUND(LEAST(indices_performance * 25.0, 100));
    
    -- 📊 CALCULAR PUNTUACIÓN FINAL
    RAISE NOTICE '';
    RAISE NOTICE '📊 === PUNTUACIÓN FINAL DEL SISTEMA ===';
    RAISE NOTICE '🏆 PUNTUACIÓN TOTAL: %/% (%% de 100%%)', 
        ROUND(puntuacion_total), ROUND(puntuacion_maxima), 
        ROUND(puntuacion_total * 100.0 / puntuacion_maxima);
    
    -- Determinar estado del sistema
    IF puntuacion_total >= 650 THEN
        RAISE NOTICE '🎉 ESTADO: EXCELENTE - SISTEMA PRODUCTION-READY';
    ELSIF puntuacion_total >= 550 THEN
        RAISE NOTICE '✅ ESTADO: BUENO - Listo para producción con monitoreo';
    ELSIF puntuacion_total >= 450 THEN
        RAISE NOTICE '⚠️ ESTADO: ACEPTABLE - Requiere correcciones menores';
    ELSE
        RAISE NOTICE '❌ ESTADO: CRÍTICO - Requiere correcciones inmediatas';
    END IF;
    
    -- Resumen de componentes
    RAISE NOTICE '';
    RAISE NOTICE '📋 === RESUMEN DE COMPONENTES ===';
    RAISE NOTICE '📊 Tablas críticas: %/%', tablas_existentes, array_length(tablas_criticas, 1);
    RAISE NOTICE '📊 Columnas profiles: %/%', columnas_existentes, array_length(columnas_criticas, 1);
    RAISE NOTICE '📊 Funciones críticas: %/%', funciones_existentes, array_length(funciones_criticas, 1);
    RAISE NOTICE '📊 Triggers automáticos: %/%', triggers_existentes, array_length(triggers_criticos, 1);
    RAISE NOTICE '📊 Buckets storage: %/%', buckets_existentes, array_length(buckets_criticos, 1);
    RAISE NOTICE '📊 Tablas con RLS: %/%', tablas_con_rls, array_length(tablas_criticas, 1);
    RAISE NOTICE '📊 Políticas RLS: % implementadas', total_politicas;
    RAISE NOTICE '📊 Índices performance: % críticos', indices_performance;
    
    RAISE NOTICE '';
    RAISE NOTICE '⏰ Validación completada: %', NOW();
    RAISE NOTICE '🎯 Sistema ComplicesConecta v2.1.1 - Auditoría Finalizada';
    RAISE NOTICE '';
    
END $$;
