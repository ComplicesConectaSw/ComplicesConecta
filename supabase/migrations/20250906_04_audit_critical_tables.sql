-- ==========================================
-- AUDITORÍA Y VALIDACIÓN DE TABLAS CRÍTICAS
-- Fecha: 2025-09-06
-- Propósito: Verificar existencia y estructura de todas las tablas críticas
-- ==========================================

-- FUNCIÓN DE AUDITORÍA
CREATE OR REPLACE FUNCTION public.audit_critical_tables()
RETURNS TABLE(
    table_name text,
    exists boolean,
    rls_enabled boolean,
    policy_count bigint,
    status text
) AS $$
BEGIN
    RETURN QUERY
    WITH critical_tables AS (
        SELECT unnest(ARRAY[
            'profiles', 'user_roles', 'invitations', 'gallery_permissions', 
            'images', 'image_permissions', 'gallery_access_requests',
            'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
            'user_likes', 'matches', 'match_interactions'
        ]) AS table_name
    ),
    table_info AS (
        SELECT 
            ct.table_name,
            CASE WHEN t.table_name IS NOT NULL THEN true ELSE false END as exists,
            COALESCE(pt.rowsecurity, false) as rls_enabled,
            COALESCE(pc.policy_count, 0) as policy_count
        FROM critical_tables ct
        LEFT JOIN information_schema.tables t 
            ON ct.table_name = t.table_name AND t.table_schema = 'public'
        LEFT JOIN pg_tables pt 
            ON ct.table_name = pt.tablename AND pt.schemaname = 'public'
        LEFT JOIN (
            SELECT tablename, COUNT(*) as policy_count
            FROM pg_policies 
            WHERE schemaname = 'public'
            GROUP BY tablename
        ) pc ON ct.table_name = pc.tablename
    )
    SELECT 
        ti.table_name,
        ti.exists,
        ti.rls_enabled,
        ti.policy_count,
        CASE 
            WHEN NOT ti.exists THEN '❌ MISSING'
            WHEN ti.exists AND NOT ti.rls_enabled THEN '⚠️ NO RLS'
            WHEN ti.exists AND ti.rls_enabled AND ti.policy_count = 0 THEN '⚠️ NO POLICIES'
            WHEN ti.exists AND ti.rls_enabled AND ti.policy_count > 0 THEN '✅ OK'
            ELSE '❓ UNKNOWN'
        END as status
    FROM table_info ti
    ORDER BY ti.table_name;
END;
$$ LANGUAGE plpgsql;

-- EJECUTAR AUDITORÍA
SELECT * FROM public.audit_critical_tables();

-- VALIDAR FUNCIONES CRÍTICAS
SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('has_role', 'handle_new_user', 'update_updated_at_column', 'exec_sql')
ORDER BY routine_name;

-- VALIDAR TRIGGERS
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    '✅ ACTIVE' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('trg_profiles_updated_at', 'trg_invitations_updated_at', 'trg_images_updated_at', 'on_auth_user_created')
ORDER BY trigger_name;
