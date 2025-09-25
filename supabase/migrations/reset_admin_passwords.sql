-- Script para resetear contraseñas de administradores
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuarios existentes y su estado de confirmación
SELECT 
    id,
    email,
    email_confirmed_at,
    encrypted_password IS NOT NULL as has_password,
    created_at,
    updated_at
FROM auth.users 
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY email;

-- 2. Confirmar emails si no están confirmados
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
AND email_confirmed_at IS NULL;

-- 3. Para djwacko28@gmail.com - crear usuario si no existe
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) 
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'djwacko28@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'djwacko28@gmail.com'
);

-- 4. Actualizar contraseña para ambos usuarios (123456)
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com');

-- 5. Verificar resultado final
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    encrypted_password IS NOT NULL as has_password,
    created_at
FROM auth.users 
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY email;
