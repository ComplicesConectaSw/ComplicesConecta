-- Crear perfil de administrador faltante
-- Usuario: complicesconectasw@outlook.es
-- UUID: 10b2fa75-5a62-4299-921c-9a1cc99c765b

-- Verificar si ya existe el perfil
SELECT * FROM profiles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Insertar perfil de administrador (verificar primero que no existe)
INSERT INTO profiles (
    id,
    user_id,
    first_name,
    last_name,
    display_name,
    email,
    role,
    avatar_url,
    bio,
    created_at,
    updated_at
) 
SELECT 
    '10b2fa75-5a62-4299-921c-9a1cc99c765b',
    '10b2fa75-5a62-4299-921c-9a1cc99c765b',
    'Administrador',
    'ComplicesConecta',
    'Administrador ComplicesConecta',
    'complicesconectasw@outlook.es',
    'admin',
    null,
    'Administrador principal de la plataforma ComplicesConecta',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b'
);

-- Verificar que se creó correctamente
SELECT 
    user_id,
    first_name,
    last_name,
    display_name,
    email,
    role,
    created_at
FROM profiles 
WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- También verificar en la tabla user_roles si existe
SELECT * FROM user_roles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Insertar rol de admin si no existe
INSERT INTO user_roles (user_id, role, created_at)
SELECT '10b2fa75-5a62-4299-921c-9a1cc99c765b', 'admin', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b' AND role = 'admin'
);
