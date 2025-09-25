-- PASO 1: Crear perfil para complicesconectasw@outlook.es (columnas correctas)
-- Insertar perfil usando la columna correcta según el foreign key constraint
-- El constraint profiles_id_fkey indica que debemos usar 'id' no 'user_id'

-- Verificar constraint actual
SELECT 'Constraint actual:' as paso;
SELECT conname, confrelid::regclass, conkey, confkey
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Eliminar perfil existente si existe
DELETE FROM profiles WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Insertar perfil usando 'id' en lugar de 'user_id'
INSERT INTO profiles (
    id,
    user_id,
    first_name,
    last_name,
    display_name,
    role,
    email,
    is_active,
    is_public,
    is_demo
) VALUES (
    '10b2fa75-5a62-4299-921c-9a1cc99c765b',  -- Usar mismo UUID como id
    '10b2fa75-5a62-4299-921c-9a1cc99c765b',  -- Y como user_id
    'Administrador',
    'ComplicesConecta',
    'Administrador ComplicesConecta',
    'admin',
    'complicesconectasw@outlook.es',
    true,
    false,
    false
) ON CONFLICT (id) DO UPDATE SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name;

-- Verificar inserción
SELECT 'Perfil creado:' as paso;
SELECT id, user_id, first_name, last_name, display_name, role, email 
FROM profiles 
WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

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
