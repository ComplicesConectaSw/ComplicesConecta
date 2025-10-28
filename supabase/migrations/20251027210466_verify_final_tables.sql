-- Script de verificación final de tablas de servicios
-- Verificar que las 9 tablas requeridas existen

SELECT 
    '📊 VERIFICACIÓN FINAL DE TABLAS DE SERVICIOS' as titulo,
    '' as separador;

-- Contar tablas existentes
SELECT 
    COUNT(*) as total_tablas_existentes,
    'de 9 tablas requeridas' as descripcion
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'token_analytics', 
    'user_token_balances', 
    'staking_records',
    'token_transactions', 
    'couple_profiles', 
    'invitations',
    'gallery_permissions', 
    'invitation_templates', 
    'invitation_statistics'
);

-- Lista detallada de tablas
SELECT 
    table_name as tabla,
    CASE 
        WHEN table_name IN (
            'token_analytics', 
            'user_token_balances', 
            'staking_records',
            'token_transactions', 
            'couple_profiles', 
            'invitations',
            'gallery_permissions', 
            'invitation_templates', 
            'invitation_statistics'
        ) THEN '✅ EXISTE'
        ELSE '❌ NO REQUERIDA'
    END as estado,
    CASE 
        WHEN table_name = 'token_analytics' THEN 'Métricas de tokens CMPX y GTK'
        WHEN table_name = 'user_token_balances' THEN 'Balances de usuarios'
        WHEN table_name = 'staking_records' THEN 'Registros de staking'
        WHEN table_name = 'token_transactions' THEN 'Historial de transacciones'
        WHEN table_name = 'couple_profiles' THEN 'Perfiles de parejas'
        WHEN table_name = 'invitations' THEN 'Sistema de invitaciones'
        WHEN table_name = 'gallery_permissions' THEN 'Permisos de galería'
        WHEN table_name = 'invitation_templates' THEN 'Plantillas de invitaciones'
        WHEN table_name = 'invitation_statistics' THEN 'Estadísticas de invitaciones'
        ELSE 'Tabla adicional'
    END as descripcion
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN (
            'token_analytics', 
            'user_token_balances', 
            'staking_records',
            'token_transactions', 
            'couple_profiles', 
            'invitations',
            'gallery_permissions', 
            'invitation_templates', 
            'invitation_statistics'
        ) THEN 0
        ELSE 1
    END,
    table_name;

-- Verificar índices
SELECT 
    '📈 VERIFICACIÓN DE ÍNDICES' as titulo,
    '' as separador;

SELECT 
    schemaname,
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Índice optimizado'
        ELSE '⚠️ Índice por defecto'
    END as tipo_indice
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
    'token_analytics', 
    'user_token_balances', 
    'staking_records',
    'token_transactions', 
    'couple_profiles', 
    'invitations',
    'gallery_permissions', 
    'invitation_templates', 
    'invitation_statistics'
)
ORDER BY tablename, indexname;

-- Verificar RLS
SELECT 
    '🔒 VERIFICACIÓN DE SEGURIDAD (RLS)' as titulo,
    '' as separador;

SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Deshabilitado'
    END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'token_analytics', 
    'user_token_balances', 
    'staking_records',
    'token_transactions', 
    'couple_profiles', 
    'invitations',
    'gallery_permissions', 
    'invitation_templates', 
    'invitation_statistics'
)
ORDER BY tablename;

-- Resumen final
SELECT 
    '🎯 RESUMEN FINAL' as titulo,
    '' as separador;

WITH tabla_status AS (
    SELECT 
        COUNT(*) as total_tablas,
        COUNT(CASE WHEN table_name IN (
            'token_analytics', 
            'user_token_balances', 
            'staking_records',
            'token_transactions', 
            'couple_profiles', 
            'invitations',
            'gallery_permissions', 
            'invitation_templates', 
            'invitation_statistics'
        ) THEN 1 END) as tablas_servicios
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
SELECT 
    tablas_servicios as tablas_de_servicios_existentes,
    9 as tablas_requeridas,
    CASE 
        WHEN tablas_servicios = 9 THEN '✅ COMPLETO'
        WHEN tablas_servicios > 9 THEN '⚠️ EXCESO'
        ELSE '❌ FALTANTES'
    END as estado_final,
    (tablas_servicios * 100.0 / 9) as porcentaje_completado
FROM tabla_status;
