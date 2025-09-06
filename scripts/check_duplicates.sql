-- =====================================================
-- VERIFICACIÓN DE DUPLICADOS EN SCRIPTS SQL
-- ComplicesConecta v2.1.2 - Detección de Funciones Duplicadas
-- Fecha: 06 de septiembre, 2025 - 05:19 hrs
-- =====================================================

-- VERIFICAR FUNCIONES DUPLICADAS EN BASE DE DATOS
DO $$
DECLARE
    func_record RECORD;
    duplicate_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE FUNCIONES DUPLICADAS ===';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
    
    -- Buscar funciones con el mismo nombre pero diferentes definiciones
    FOR func_record IN
        SELECT 
            proname as function_name,
            COUNT(*) as count,
            array_agg(DISTINCT oid) as function_oids
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname IN (
            'detect_mutual_match', 'get_user_matches', 'get_potential_matches', 
            'create_match_if_mutual', 'has_role', 'handle_new_user', 
            'update_updated_at_column', 'exec_sql'
        )
        GROUP BY proname
        HAVING COUNT(*) > 1
    LOOP
        duplicate_count := duplicate_count + 1;
        RAISE NOTICE '⚠️  DUPLICADO ENCONTRADO: Función % tiene % versiones', 
            func_record.function_name, func_record.count;
        RAISE NOTICE '   OIDs: %', func_record.function_oids;
    END LOOP;
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE '✅ No se encontraron funciones duplicadas';
    ELSE
        RAISE NOTICE '❌ Se encontraron % funciones duplicadas', duplicate_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICACIÓN DE TABLAS DUPLICADAS ===';
    
    -- Verificar si existen tablas duplicadas (no debería pasar, pero verificamos)
    FOR func_record IN
        SELECT 
            tablename,
            schemaname,
            COUNT(*) as count
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN (
            'profiles', 'user_roles', 'invitations', 'gallery_permissions',
            'images', 'image_permissions', 'gallery_access_requests',
            'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
            'user_likes', 'matches', 'match_interactions'
        )
        GROUP BY tablename, schemaname
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE '⚠️  TABLA DUPLICADA: %', func_record.tablename;
    END LOOP;
    
    RAISE NOTICE '✅ Verificación de tablas completada';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICACIÓN DE ÍNDICES DUPLICADOS ===';
    
    -- Verificar índices duplicados
    FOR func_record IN
        SELECT 
            indexname,
            tablename,
            COUNT(*) as count
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        GROUP BY indexname, tablename
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE '⚠️  ÍNDICE DUPLICADO: % en tabla %', 
            func_record.indexname, func_record.tablename;
    END LOOP;
    
    RAISE NOTICE '✅ Verificación de índices completada';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICACIÓN DE STORAGE BUCKETS ===';
    
    -- Verificar buckets duplicados
    FOR func_record IN
        SELECT 
            name,
            COUNT(*) as count
        FROM storage.buckets 
        WHERE name IN ('profile-images', 'gallery-images', 'chat-media')
        GROUP BY name
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE '⚠️  BUCKET DUPLICADO: %', func_record.name;
    END LOOP;
    
    RAISE NOTICE '✅ Verificación de buckets completada';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE VERIFICACIÓN ===';
    RAISE NOTICE 'Verificación completada exitosamente';
    RAISE NOTICE 'Sistema listo para auditoría completa';
    RAISE NOTICE '';
END $$;
