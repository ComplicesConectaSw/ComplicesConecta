-- =====================================================
-- VERIFICACIÓN DE TABLAS EXISTENTES EN SUPABASE
-- =====================================================
-- Este script verifica qué tablas existen en la base de datos
-- y cuáles necesitan ser creadas
-- =====================================================

-- Verificar tablas principales que deberían existir
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'token_analytics',
        'user_token_balances', 
        'staking_records',
        'token_transactions',
        'user_referral_balances',
        'referral_rewards',
        'referral_transactions',
        'referral_statistics',
        'referral_leaderboard',
        'story_likes',
        'story_comments',
        'story_shares',
        'comment_likes',
        'couple_profile_likes',
        'couple_profile_views',
        'couple_profile_reports',
        'two_factor_auth',
        'audit_logs',
        'gallery_permissions',
        'invitation_templates',
        'invitation_statistics'
    )
ORDER BY table_name;

-- Verificar si las tablas principales existen
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_analytics' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as token_analytics_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_referral_balances' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as user_referral_balances_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'story_likes' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as story_likes_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'two_factor_auth' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as two_factor_auth_status;
