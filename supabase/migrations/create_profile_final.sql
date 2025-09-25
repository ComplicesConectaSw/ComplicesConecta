-- Script final corregido para crear perfil
-- El campo 'id' en profiles debe ser igual al user_id (referencia a auth.users)
-- Usuario: 7c189901-0939-4f28-8d17-4496e0b41492

-- 1. Verificar si ya existe perfil
SELECT id, user_id, first_name FROM profiles WHERE user_id = '7c189901-0939-4f28-8d17-4496e0b41492';

-- 2. Crear perfil usando user_id como id (sin generar UUID aleatorio)
INSERT INTO public.profiles (
    id,
    user_id,
    first_name,
    last_name,
    age,
    gender,
    bio,
    created_at,
    updated_at
) VALUES (
    '7c189901-0939-4f28-8d17-4496e0b41492',  -- id = user_id (referencia a auth.users)
    '7c189901-0939-4f28-8d17-4496e0b41492',  -- user_id del usuario creado
    'Apoyo',
    'Financiero',
    30,
    'other',
    'Perfil de apoyo financiero para la comunidad ComplicesConecta',
    NOW(),
    NOW()
);

-- 3. Crear rol de usuario
INSERT INTO public.user_roles (
    user_id,
    role,
    created_at
) VALUES (
    '7c189901-0939-4f28-8d17-4496e0b41492',
    'user',
    NOW()
);

-- 4. Verificar que todo se creó correctamente
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.age,
    ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.id = '7c189901-0939-4f28-8d17-4496e0b41492';
