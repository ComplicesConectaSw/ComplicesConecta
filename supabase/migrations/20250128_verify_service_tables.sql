-- Script para verificar tablas existentes en Supabase
-- Verificar cuáles de las 9 tablas de servicios ya existen

SELECT 
    table_name,
    table_type,
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
        ) THEN '✅ REQUERIDA'
        ELSE '❌ NO REQUERIDA'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar específicamente las 9 tablas requeridas
SELECT 
    'token_analytics' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_analytics' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'user_token_balances' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_token_balances' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'staking_records' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staking_records' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'token_transactions' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_transactions' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'couple_profiles' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couple_profiles' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'invitations' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'gallery_permissions' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_permissions' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'invitation_templates' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitation_templates' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
UNION ALL
SELECT 
    'invitation_statistics' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitation_statistics' AND table_schema = 'public') 
         THEN '✅ EXISTE' 
         ELSE '❌ FALTA' 
    END as estado
ORDER BY tabla;
