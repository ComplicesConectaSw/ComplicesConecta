-- WorldID Verification Schema Check
-- Ejecutar en Supabase SQL Editor para verificar que las tablas están correctas

-- 1. Verificar que las columnas World ID se agregaron a user_token_balances
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_token_balances' 
AND column_name LIKE 'worldid%'
ORDER BY column_name;

-- 2. Verificar que la tabla referral_rewards existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'referral_rewards'
ORDER BY ordinal_position;

-- 3. Verificar que las funciones World ID se crearon
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN ('process_worldid_verification_reward', 'get_worldid_stats')
AND routine_schema = 'public';

-- 4. Verificar estructura completa de user_token_balances
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_token_balances'
ORDER BY ordinal_position;

-- 5. Contar registros existentes (opcional)
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN worldid_verified = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN worldid_nullifier_hash IS NOT NULL THEN 1 END) as users_with_hash
FROM user_token_balances;
