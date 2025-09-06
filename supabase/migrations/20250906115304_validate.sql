-- =====================================================
-- ✅ MIGRACIÓN: VALIDACIÓN COMPLETA DEL SISTEMA
-- ComplicesConecta v2.1.2 - Database Validation
-- Fecha: 06 de septiembre, 2025
-- =====================================================

-- 🔍 FUNCIÓN DE VALIDACIÓN COMPLETA
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_database_complete()
RETURNS TABLE (
    category TEXT,
    item TEXT,
    status TEXT,
    score INTEGER,
    details TEXT
) AS $$
DECLARE
    total_score INTEGER := 0;
    max_score INTEGER := 100;
    table_count INTEGER;
    rls_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- 📊 VALIDAR TABLAS CRÍTICAS (40 puntos)
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
    );
    
    RETURN QUERY SELECT 
        'TABLAS'::TEXT,
        'Tablas Críticas'::TEXT,
        CASE WHEN table_count = 11 THEN 'COMPLETO' ELSE 'INCOMPLETO' END::TEXT,
        CASE WHEN table_count = 11 THEN 40 ELSE (table_count * 40 / 11) END::INTEGER,
        format('Encontradas: %s/11', table_count)::TEXT;
    
    total_score := total_score + CASE WHEN table_count = 11 THEN 40 ELSE (table_count * 40 / 11) END;

    -- 🛡️ VALIDAR RLS HABILITADO (30 puntos)
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
    )
    AND c.relrowsecurity = true;
    
    RETURN QUERY SELECT 
        'SEGURIDAD'::TEXT,
        'RLS Habilitado'::TEXT,
        CASE WHEN rls_count = 11 THEN 'COMPLETO' ELSE 'INCOMPLETO' END::TEXT,
        CASE WHEN rls_count = 11 THEN 30 ELSE (rls_count * 30 / 11) END::INTEGER,
        format('RLS activo: %s/11 tablas', rls_count)::TEXT;
    
    total_score := total_score + CASE WHEN rls_count = 11 THEN 30 ELSE (rls_count * 30 / 11) END;

    -- 🔐 VALIDAR POLÍTICAS RLS (20 puntos)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public';
    
    RETURN QUERY SELECT 
        'SEGURIDAD'::TEXT,
        'Políticas RLS'::TEXT,
        CASE WHEN policy_count >= 30 THEN 'COMPLETO' ELSE 'PARCIAL' END::TEXT,
        CASE WHEN policy_count >= 30 THEN 20 ELSE (policy_count * 20 / 30) END::INTEGER,
        format('Políticas creadas: %s (mínimo 30)', policy_count)::TEXT;
    
    total_score := total_score + CASE WHEN policy_count >= 30 THEN 20 ELSE (policy_count * 20 / 30) END;

    -- 📋 VALIDAR COLUMNAS CRÍTICAS EN profiles (10 puntos)
    RETURN QUERY SELECT 
        'COLUMNAS'::TEXT,
        'profiles - interests'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'interests'
        ) THEN 'EXISTE' ELSE 'FALTA' END::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'interests'
        ) THEN 2 ELSE 0 END::INTEGER,
        'Columna interests en tabla profiles'::TEXT;
    
    total_score := total_score + CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'interests'
    ) THEN 2 ELSE 0 END;

    RETURN QUERY SELECT 
        'COLUMNAS'::TEXT,
        'profiles - looking_for'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'looking_for'
        ) THEN 'EXISTE' ELSE 'FALTA' END::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'looking_for'
        ) THEN 2 ELSE 0 END::INTEGER,
        'Columna looking_for en tabla profiles'::TEXT;
    
    total_score := total_score + CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'looking_for'
    ) THEN 2 ELSE 0 END;

    RETURN QUERY SELECT 
        'COLUMNAS'::TEXT,
        'profiles - swinger_experience'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'swinger_experience'
        ) THEN 'EXISTE' ELSE 'FALTA' END::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'swinger_experience'
        ) THEN 2 ELSE 0 END::INTEGER,
        'Columna swinger_experience en tabla profiles'::TEXT;
    
    total_score := total_score + CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'swinger_experience'
    ) THEN 2 ELSE 0 END;

    RETURN QUERY SELECT 
        'COLUMNAS'::TEXT,
        'profiles - age_range_min/max'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'age_range_min'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'age_range_max'
        ) THEN 'EXISTE' ELSE 'FALTA' END::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'age_range_min'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'age_range_max'
        ) THEN 2 ELSE 0 END::INTEGER,
        'Columnas age_range_min y age_range_max en tabla profiles'::TEXT;
    
    total_score := total_score + CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'age_range_min'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'age_range_max'
    ) THEN 2 ELSE 0 END;

    RETURN QUERY SELECT 
        'COLUMNAS'::TEXT,
        'profiles - is_demo/is_active'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'is_demo'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'is_active'
        ) THEN 'EXISTE' ELSE 'FALTA' END::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'is_demo'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'is_active'
        ) THEN 2 ELSE 0 END::INTEGER,
        'Columnas is_demo y is_active en tabla profiles'::TEXT;
    
    total_score := total_score + CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_demo'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN 2 ELSE 0 END;

    -- 🎯 PUNTUACIÓN FINAL
    RETURN QUERY SELECT 
        'RESULTADO'::TEXT,
        'PUNTUACIÓN TOTAL'::TEXT,
        CASE 
            WHEN total_score >= 95 THEN 'EXCELENTE'
            WHEN total_score >= 85 THEN 'BUENO'
            WHEN total_score >= 70 THEN 'ACEPTABLE'
            ELSE 'REQUIERE MEJORAS'
        END::TEXT,
        total_score::INTEGER,
        format('Puntuación: %s/100 - Sistema %s para producción', 
            total_score,
            CASE WHEN total_score >= 90 THEN 'LISTO' ELSE 'NO LISTO' END
        )::TEXT;

END;
$$ LANGUAGE plpgsql;

-- 📊 FUNCIÓN DE REPORTE RESUMIDO
-- =====================================================
CREATE OR REPLACE FUNCTION public.database_health_check()
RETURNS TABLE (
    component TEXT,
    status TEXT,
    percentage INTEGER
) AS $$
BEGIN
    -- Tablas
    RETURN QUERY SELECT 
        'Tablas Críticas'::TEXT,
        CASE WHEN (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
                'profiles', 'user_roles', 'invitations', 'gallery_permissions',
                'images', 'image_permissions', 'gallery_access_requests',
                'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
            )
        ) = 11 THEN 'COMPLETO' ELSE 'INCOMPLETO' END::TEXT,
        ((SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN (
              'profiles', 'user_roles', 'invitations', 'gallery_permissions',
              'images', 'image_permissions', 'gallery_access_requests',
              'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
          )) * 100 / 11)::INTEGER;

    -- RLS
    RETURN QUERY SELECT 
        'Seguridad RLS'::TEXT,
        CASE WHEN (
            SELECT COUNT(*) FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relname IN (
                'profiles', 'user_roles', 'invitations', 'gallery_permissions',
                'images', 'image_permissions', 'gallery_access_requests',
                'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
            )
            AND c.relrowsecurity = true
        ) = 11 THEN 'COMPLETO' ELSE 'INCOMPLETO' END::TEXT,
        ((SELECT COUNT(*) FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public'
          AND c.relname IN (
              'profiles', 'user_roles', 'invitations', 'gallery_permissions',
              'images', 'image_permissions', 'gallery_access_requests',
              'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
          )
          AND c.relrowsecurity = true) * 100 / 11)::INTEGER;

    -- Políticas
    RETURN QUERY SELECT 
        'Políticas RLS'::TEXT,
        CASE WHEN (
            SELECT COUNT(*) FROM pg_policy p
            JOIN pg_class c ON c.oid = p.polrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
        ) >= 30 THEN 'COMPLETO' ELSE 'PARCIAL' END::TEXT,
        LEAST(100, ((SELECT COUNT(*) FROM pg_policy p
                     JOIN pg_class c ON c.oid = p.polrelid
                     JOIN pg_namespace n ON n.oid = c.relnamespace
                     WHERE n.nspname = 'public') * 100 / 30))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ✅ EJECUTAR VALIDACIÓN INMEDIATA
-- =====================================================
DO $$
DECLARE
    validation_result RECORD;
    health_result RECORD;
BEGIN
    RAISE NOTICE '🔍 EJECUTANDO VALIDACIÓN COMPLETA DEL SISTEMA...';
    RAISE NOTICE '================================================';
    
    -- Mostrar resultados de validación
    FOR validation_result IN 
        SELECT * FROM public.validate_database_complete()
    LOOP
        RAISE NOTICE '[%] % - % (% puntos): %', 
            validation_result.category,
            validation_result.item,
            validation_result.status,
            validation_result.score,
            validation_result.details;
    END LOOP;
    
    RAISE NOTICE '================================================';
    RAISE NOTICE '📊 RESUMEN DE SALUD DEL SISTEMA:';
    
    -- Mostrar resumen de salud
    FOR health_result IN 
        SELECT * FROM public.database_health_check()
    LOOP
        RAISE NOTICE '• % - % (%% completado)', 
            health_result.component,
            health_result.status,
            health_result.percentage;
    END LOOP;
    
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ VALIDACIÓN COMPLETADA - Funciones creadas:';
    RAISE NOTICE '• validate_database_complete() - Validación detallada';
    RAISE NOTICE '• database_health_check() - Resumen de salud';
END $$;