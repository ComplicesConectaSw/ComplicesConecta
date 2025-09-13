-- Script simple para ejecutar paso a paso en Supabase SQL Editor

-- PASO 1: Verificar usuarios existentes
SELECT id, email, email_confirmed_at FROM auth.users WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com');

-- PASO 2: Crear perfil para complicesconectasw@outlook.es (cambiar UUID por el real)
INSERT INTO profiles (user_id, email, first_name, last_name, role, created_at, updated_at) 
VALUES (
    '10b2fa75-5a62-4299-921c-9a1cc99c765b', 
    'complicesconectasw@outlook.es', 
    'Administrador', 
    'ComplicesConecta', 
    'admin', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

-- PASO 3: Crear rol para complicesconectasw@outlook.es
INSERT INTO user_roles (user_id, role, created_at) 
VALUES ('10b2fa75-5a62-4299-921c-9a1cc99c765b', 'admin', NOW()) 
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- PASO 4: Confirmar email y actualizar contraseña para complicesconectasw@outlook.es
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'complicesconectasw@outlook.es';

-- PASO 5: Verificar resultado
SELECT 
    p.user_id, 
    p.email, 
    p.first_name, 
    p.role,
    ur.role as user_role,
    au.email_confirmed_at IS NOT NULL as confirmed
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id  
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.email = 'complicesconectasw@outlook.es';
