-- Script simple para corregir perfil de administrador
-- Fecha: 13 de septiembre 2025

-- 1. Verificar usuario existente
SELECT 
    id,
    email,
    email_confirmed_at
FROM auth.users 
WHERE email = 'complicesconectasw@outlook.es';

-- 2. Actualizar perfil existente (sin insertar nuevo)
UPDATE profiles 
SET 
    email = 'complicesconectasw@outlook.es',
    first_name = 'Administrador',
    last_name = 'ComplicesConecta',
    role = 'admin'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'complicesconectasw@outlook.es'
);

-- 3. Verificar resultado
SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    au.email as auth_email
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'complicesconectasw@outlook.es';
