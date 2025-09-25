-- Script para crear usuario manualmente en Supabase
-- Para apoyofinancieromexicano@gmail.com

-- 1. Insertar usuario directamente en auth.users (SOLO PARA DESARROLLO)
-- NOTA: En producción real, esto se hace a través del panel de Supabase

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'apoyofinancieromexicano@gmail.com',
    crypt('123456', gen_salt('bf')), -- Contraseña: 123456
    NOW(), -- Email confirmado inmediatamente
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO UPDATE SET
    email_confirmed_at = NOW(),
    updated_at = NOW();

-- 2. Crear perfil en la tabla profiles usando el UUID del usuario creado
INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    age,
    gender,
    bio,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'apoyofinancieromexicano@gmail.com'),
    'Apoyo',
    'Financiero',
    30,
    'other',
    'Perfil de apoyo financiero para la comunidad ComplicesConecta',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    age = EXCLUDED.age,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- 3. Asignar rol de usuario
INSERT INTO public.user_roles (
    user_id,
    role,
    created_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'apoyofinancieromexicano@gmail.com'),
    'user',
    NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verificar que todo se creó correctamente
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.first_name,
    p.last_name,
    ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'apoyofinancieromexicano@gmail.com';
