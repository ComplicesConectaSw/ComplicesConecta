-- Script para confirmar email del usuario manualmente
-- Usuario: apoyofinancieromexicano@gmail.com

-- 1. Verificar estado actual del usuario
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'apoyofinancieromexicano@gmail.com';

-- 2. Confirmar email manualmente
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'apoyofinancieromexicano@gmail.com';

-- 3. Verificar que el email fue confirmado
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    email_confirmed_at,
    updated_at
FROM auth.users 
WHERE email = 'apoyofinancieromexicano@gmail.com';
