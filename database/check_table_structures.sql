-- =====================================================
-- VERIFICAR ESTRUCTURA DE TABLAS EXISTENTES
-- =====================================================
-- Este script verifica la estructura de las tablas que ya existen
-- para identificar problemas de columnas
-- =====================================================

-- Verificar estructura de referral_rewards
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'referral_rewards' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de user_referral_balances
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_referral_balances' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de token_analytics
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'token_analytics' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de two_factor_auth
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'two_factor_auth' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
