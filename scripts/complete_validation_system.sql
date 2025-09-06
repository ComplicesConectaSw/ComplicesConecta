-- =====================================================
-- 🎯 SISTEMA COMPLETO DE VALIDACIÓN Y PUNTUACIÓN
-- ComplicesConecta v2.1.2 - Validación Automática 0-100
-- Fecha: 06 de septiembre, 2025 - 05:32 hrs
-- =====================================================

-- 🤖 AUDITOR Y VALIDADOR AUTOMÁTICO COMPLETO
-- Valida toda la base de datos y genera puntuación 0-100
-- Reporta estado completo del sistema

DO $$
BEGIN
    RAISE NOTICE '🎯 INICIANDO SISTEMA AUTOMÁTICO DE VALIDACIÓN COMPLETA';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    RAISE NOTICE '📊 Validando base de datos y generando puntuación...';
END $$;

-- 🔍 FUNCIÓN: validate_database_complete - Validación completa
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_database_complete()
RETURNS TABLE (
    category TEXT,
    item TEXT,
    status TEXT,
    score INTEGER,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_score INTEGER := 0;
    max_score INTEGER := 0;
    final_score INTEGER := 0;
    table_count INTEGER := 0;
    column_count INTEGER := 0;
    rls_count INTEGER := 0;
    function_count INTEGER := 0;
    bucket_count INTEGER := 0;
    index_count INTEGER := 0;
    policy_count INTEGER := 0;
BEGIN
    -- 📊 VALIDAR TABLAS CRÍTICAS (25 puntos máximo)
    -- =====================================================
    
    max_score := max_score + 25;
    
    -- Contar tablas críticas existentes
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    );
    
    IF table_count >= 14 THEN
        total_score := total_score + 25;
        RETURN QUERY SELECT 'TABLAS'::TEXT, 'Tablas Críticas'::TEXT, '✅ COMPLETO'::TEXT, 25, format('14/14 tablas críticas creadas')::TEXT;
    ELSIF table_count >= 10 THEN
        total_score := total_score + 20;
        RETURN QUERY SELECT 'TABLAS'::TEXT, 'Tablas Críticas'::TEXT, '⚠️ PARCIAL'::TEXT, 20, format('%s/14 tablas críticas creadas', table_count)::TEXT;
    ELSIF table_count >= 5 THEN
        total_score := total_score + 10;
        RETURN QUERY SELECT 'TABLAS'::TEXT, 'Tablas Críticas'::TEXT, '🔶 BÁSICO'::TEXT, 10, format('%s/14 tablas críticas creadas', table_count)::TEXT;
    ELSE
        RETURN QUERY SELECT 'TABLAS'::TEXT, 'Tablas Críticas'::TEXT, '❌ FALTANTE'::TEXT, 0, format('%s/14 tablas críticas creadas', table_count)::TEXT;
    END IF;
    
    -- 📋 VALIDAR COLUMNAS CRÍTICAS (20 puntos máximo)
    -- =====================================================
    
    max_score := max_score + 20;
    
    -- Contar columnas críticas en profiles
    SELECT COUNT(*) INTO column_count FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN (
        'interests', 'looking_for', 'swinger_experience', 'age_range_min', 
        'age_range_max', 'max_distance', 'is_demo', 'is_active'
    );
    
    IF column_count >= 8 THEN
        total_score := total_score + 20;
        RETURN QUERY SELECT 'COLUMNAS'::TEXT, 'Columnas Profiles'::TEXT, '✅ COMPLETO'::TEXT, 20, format('8/8 columnas críticas en profiles')::TEXT;
    ELSIF column_count >= 6 THEN
        total_score := total_score + 15;
        RETURN QUERY SELECT 'COLUMNAS'::TEXT, 'Columnas Profiles'::TEXT, '⚠️ PARCIAL'::TEXT, 15, format('%s/8 columnas críticas en profiles', column_count)::TEXT;
    ELSIF column_count >= 3 THEN
        total_score := total_score + 8;
        RETURN QUERY SELECT 'COLUMNAS'::TEXT, 'Columnas Profiles'::TEXT, '🔶 BÁSICO'::TEXT, 8, format('%s/8 columnas críticas en profiles', column_count)::TEXT;
    ELSE
        RETURN QUERY SELECT 'COLUMNAS'::TEXT, 'Columnas Profiles'::TEXT, '❌ FALTANTE'::TEXT, 0, format('%s/8 columnas críticas en profiles', column_count)::TEXT;
    END IF;
    
    -- 🔒 VALIDAR RLS HABILITADO (20 puntos máximo)
    -- =====================================================
    
    max_score := max_score + 20;
    
    -- Contar tablas con RLS habilitado
    SELECT COUNT(*) INTO rls_count FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
    AND c.relrowsecurity = true
    AND c.relname IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    );
    
    IF rls_count >= 14 THEN
        total_score := total_score + 20;
        RETURN QUERY SELECT 'SEGURIDAD'::TEXT, 'RLS Habilitado'::TEXT, '✅ COMPLETO'::TEXT, 20, format('14/14 tablas con RLS habilitado')::TEXT;
    ELSIF rls_count >= 10 THEN
        total_score := total_score + 15;
        RETURN QUERY SELECT 'SEGURIDAD'::TEXT, 'RLS Habilitado'::TEXT, '⚠️ PARCIAL'::TEXT, 15, format('%s/14 tablas con RLS habilitado', rls_count)::TEXT;
    ELSIF rls_count >= 5 THEN
        total_score := total_score + 8;
        RETURN QUERY SELECT 'SEGURIDAD'::TEXT, 'RLS Habilitado'::TEXT, '🔶 BÁSICO'::TEXT, 8, format('%s/14 tablas con RLS habilitado', rls_count)::TEXT;
    ELSE
        RETURN QUERY SELECT 'SEGURIDAD'::TEXT, 'RLS Habilitado'::TEXT, '❌ FALTANTE'::TEXT, 0, format('%s/14 tablas con RLS habilitado', rls_count)::TEXT;
    END IF;
    
    -- 🔧 VALIDAR FUNCIONES CRÍTICAS (15 puntos máximo)
    -- =====================================================
    
    max_score := max_score + 15;
    
    -- Contar funciones críticas
    SELECT COUNT(*) INTO function_count FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN (
        'has_role', 'detect_mutual_match', 'get_user_matches', 
        'create_match_if_mutual', 'calculate_compatibility_score',
        'cleanup_old_matches', 'search_compatible_profiles', 'get_user_profile_complete'
    );
    
    IF function_count >= 8 THEN
        total_score := total_score + 15;
        RETURN QUERY SELECT 'FUNCIONES'::TEXT, 'Funciones Críticas'::TEXT, '✅ COMPLETO'::TEXT, 15, format('8/8 funciones críticas creadas')::TEXT;
    ELSIF function_count >= 6 THEN
        total_score := total_score + 12;
        RETURN QUERY SELECT 'FUNCIONES'::TEXT, 'Funciones Críticas'::TEXT, '⚠️ PARCIAL'::TEXT, 12, format('%s/8 funciones críticas creadas', function_count)::TEXT;
    ELSIF function_count >= 3 THEN
        total_score := total_score + 6;
        RETURN QUERY SELECT 'FUNCIONES'::TEXT, 'Funciones Críticas'::TEXT, '🔶 BÁSICO'::TEXT, 6, format('%s/8 funciones críticas creadas', function_count)::TEXT;
    ELSE
        RETURN QUERY SELECT 'FUNCIONES'::TEXT, 'Funciones Críticas'::TEXT, '❌ FALTANTE'::TEXT, 0, format('%s/8 funciones críticas creadas', function_count)::TEXT;
    END IF;
    
    -- 🗂️ VALIDAR STORAGE BUCKETS (10 puntos máximo)
    -- =====================================================
    
    max_score := max_score + 10;
    
    -- Contar buckets de storage
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets 
    WHERE id IN ('profile-images', 'gallery-images', 'chat-media');
    
    IF bucket_count >= 3 THEN
        total_score := total_score + 10;
        RETURN QUERY SELECT 'STORAGE'::TEXT, 'Buckets Storage'::TEXT, '✅ COMPLETO'::TEXT, 10, format('3/3 buckets de storage creados')::TEXT;
    ELSIF bucket_count >= 2 THEN
        total_score := total_score + 7;
        RETURN QUERY SELECT 'STORAGE'::TEXT, 'Buckets Storage'::TEXT, '⚠️ PARCIAL'::TEXT, 7, format('%s/3 buckets de storage creados', bucket_count)::TEXT;
    ELSIF bucket_count >= 1 THEN
        total_score := total_score + 3;
        RETURN QUERY SELECT 'STORAGE'::TEXT, 'Buckets Storage'::TEXT, '🔶 BÁSICO'::TEXT, 3, format('%s/3 buckets de storage creados', bucket_count)::TEXT;
    ELSE
        RETURN QUERY SELECT 'STORAGE'::TEXT, 'Buckets Storage'::TEXT, '❌ FALTANTE'::TEXT, 0, format('%s/3 buckets de storage creados', bucket_count)::TEXT;
    END IF;
    
    -- 🚀 VALIDAR ÍNDICES OPTIMIZADOS (10 puntos máximo)
    -- =====================================================
    
    max_score := max_score + 10;
    
    -- Contar índices críticos
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    AND tablename IN (
        'profiles', 'user_roles', 'invitations', 'images', 
        'matches', 'user_likes', 'chat_rooms', 'messages'
    );
    
    IF index_count >= 20 THEN
        total_score := total_score + 10;
        RETURN QUERY SELECT 'PERFORMANCE'::TEXT, 'Índices Optimizados'::TEXT, '✅ COMPLETO'::TEXT, 10, format('%s+ índices de performance creados', index_count)::TEXT;
    ELSIF index_count >= 15 THEN
        total_score := total_score + 8;
        RETURN QUERY SELECT 'PERFORMANCE'::TEXT, 'Índices Optimizados'::TEXT, '⚠️ PARCIAL'::TEXT, 8, format('%s índices de performance creados', index_count)::TEXT;
    ELSIF index_count >= 8 THEN
        total_score := total_score + 5;
        RETURN QUERY SELECT 'PERFORMANCE'::TEXT, 'Índices Optimizados'::TEXT, '🔶 BÁSICO'::TEXT, 5, format('%s índices de performance creados', index_count)::TEXT;
    ELSE
        RETURN QUERY SELECT 'PERFORMANCE'::TEXT, 'Índices Optimizados'::TEXT, '❌ FALTANTE'::TEXT, 0, format('%s índices de performance creados', index_count)::TEXT;
    END IF;
    
    -- 📊 CALCULAR PUNTUACIÓN FINAL
    -- =====================================================
    
    final_score := ROUND((total_score::NUMERIC / max_score::NUMERIC) * 100);
    
    -- Clasificación final
    IF final_score >= 95 THEN
        RETURN QUERY SELECT 'RESULTADO'::TEXT, 'Puntuación Final'::TEXT, '🏆 EXCELENTE'::TEXT, final_score, format('Sistema completamente funcional - Listo para producción')::TEXT;
    ELSIF final_score >= 85 THEN
        RETURN QUERY SELECT 'RESULTADO'::TEXT, 'Puntuación Final'::TEXT, '✅ MUY BUENO'::TEXT, final_score, format('Sistema funcional - Correcciones menores pendientes')::TEXT;
    ELSIF final_score >= 70 THEN
        RETURN QUERY SELECT 'RESULTADO'::TEXT, 'Puntuación Final'::TEXT, '⚠️ BUENO'::TEXT, final_score, format('Sistema parcialmente funcional - Requiere correcciones')::TEXT;
    ELSIF final_score >= 50 THEN
        RETURN QUERY SELECT 'RESULTADO'::TEXT, 'Puntuación Final'::TEXT, '🔶 REGULAR'::TEXT, final_score, format('Sistema básico - Requiere trabajo adicional')::TEXT;
    ELSE
        RETURN QUERY SELECT 'RESULTADO'::TEXT, 'Puntuación Final'::TEXT, '❌ DEFICIENTE'::TEXT, final_score, format('Sistema incompleto - Requiere corrección integral')::TEXT;
    END IF;
    
    RETURN;
END;
$$;

-- 📋 FUNCIÓN: generate_audit_report - Generar reporte de auditoría
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_audit_report()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    report_text TEXT := '';
    validation_record RECORD;
    current_time TEXT;
BEGIN
    current_time := to_char(NOW(), 'DD/MM/YYYY HH24:MI:SS');
    
    report_text := report_text || E'🤖 REPORTE AUTOMÁTICO DE AUDITORÍA SUPABASE\n';
    report_text := report_text || E'ComplicesConecta v2.1.2 - Sistema de Corrección Automática\n';
    report_text := report_text || E'Fecha: ' || current_time || E'\n';
    report_text := report_text || E'=====================================================\n\n';
    
    -- Ejecutar validación y generar reporte
    FOR validation_record IN 
        SELECT * FROM public.validate_database_complete()
    LOOP
        report_text := report_text || format(E'%s: %s - %s (%s puntos)\n%s\n\n', 
            validation_record.category,
            validation_record.item,
            validation_record.status,
            validation_record.score,
            validation_record.details
        );
    END LOOP;
    
    report_text := report_text || E'=====================================================\n';
    report_text := report_text || E'🎯 AUDITORÍA COMPLETADA EXITOSAMENTE\n';
    report_text := report_text || E'📊 Revisa la puntuación final para determinar el estado del sistema\n';
    
    RETURN report_text;
END;
$$;

-- 🔍 EJECUTAR VALIDACIÓN AUTOMÁTICA
-- =====================================================

DO $$
DECLARE
    validation_record RECORD;
    final_score INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 EJECUTANDO VALIDACIÓN AUTOMÁTICA COMPLETA...';
    RAISE NOTICE '=====================================================';
    
    FOR validation_record IN 
        SELECT * FROM public.validate_database_complete()
    LOOP
        RAISE NOTICE '% - % - % (% puntos)', 
            validation_record.category,
            validation_record.status,
            validation_record.item,
            validation_record.score;
        
        IF validation_record.category = 'RESULTADO' THEN
            final_score := validation_record.score;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎯 PUNTUACIÓN FINAL DEL SISTEMA: %/100', final_score;
    
    IF final_score >= 95 THEN
        RAISE NOTICE '🏆 SISTEMA EXCELENTE - LISTO PARA PRODUCCIÓN';
    ELSIF final_score >= 85 THEN
        RAISE NOTICE '✅ SISTEMA MUY BUENO - CORRECCIONES MENORES';
    ELSIF final_score >= 70 THEN
        RAISE NOTICE '⚠️ SISTEMA BUENO - REQUIERE CORRECCIONES';
    ELSIF final_score >= 50 THEN
        RAISE NOTICE '🔶 SISTEMA REGULAR - TRABAJO ADICIONAL REQUERIDO';
    ELSE
        RAISE NOTICE '❌ SISTEMA DEFICIENTE - CORRECCIÓN INTEGRAL REQUERIDA';
    END IF;
    
    RAISE NOTICE '✅ VALIDACIÓN AUTOMÁTICA COMPLETADA';
END $$;
