-- PASO 1: Crear perfil para complicesconectasw@outlook.es (columnas correctas)
INSERT INTO profiles (id, first_name, last_name, display_name, avatar_url, bio) 
VALUES (
    '10b2fa75-5a62-4299-921c-9a1cc99c765b', 
    'Administrador', 
    'ComplicesConecta',
    'Admin ComplicesConecta',
    NULL,
    'Administrador principal del sistema'
) ON CONFLICT (id) DO UPDATE SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio;

-- PASO 2: Crear rol en user_roles (columnas correctas)
INSERT INTO user_roles (user_id, role, created_at) 
VALUES ('10b2fa75-5a62-4299-921c-9a1cc99c765b', 'admin', NOW()) 
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- PASO 3: Actualizar contraseña de PRODUCCIÓN
UPDATE auth.users 
SET 
    encrypted_password = crypt('Magy_Wacko_nala28', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'complicesconectasw@outlook.es';

-- PASO 4: Verificar resultado final
SELECT 
    p.id, 
    p.first_name, 
    p.last_name,
    p.display_name,
    ur.role as user_role,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id  
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'complicesconectasw@outlook.es';
