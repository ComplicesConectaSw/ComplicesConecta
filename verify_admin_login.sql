-- Script para verificar y resetear credenciales de administrador
-- Fecha: 13 de septiembre 2025

-- 1. Verificar usuario en auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    encrypted_password,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'complicesconectasw@outlook.es';

-- 2. Verificar perfil en profiles
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE email = 'complicesconectasw@outlook.es';

-- 3. Resetear contraseña si es necesario
-- NOTA: Ejecutar solo si el login no funciona
-- UPDATE auth.users 
-- SET encrypted_password = crypt('Magy_Wacko_nala28', gen_salt('bf'))
-- WHERE email = 'complicesconectasw@outlook.es';

-- 4. Verificar que el email esté confirmado
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'complicesconectasw@outlook.es' 
AND email_confirmed_at IS NULL;
