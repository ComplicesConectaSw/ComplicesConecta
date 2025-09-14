-- Script para crear perfil real en Supabase para apoyofinancieromexicano@gmail.com
-- Este usuario debe tener datos reales en la base de datos, no demo

-- 1. Primero obtener el UUID del usuario real de auth.users
SELECT id, email FROM auth.users WHERE email = 'apoyofinancieromexicano@gmail.com';

-- 2. Crear perfil real en la tabla profiles (usando columnas que existen)
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
    -- Reemplazar con UUID real del usuario de auth.users
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

-- 3. Asignar rol de usuario en user_roles
INSERT INTO public.user_roles (
    user_id,
    role,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', -- Mismo UUID
    'user',
    NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar que el perfil se creó correctamente
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.age,
    p.bio,
    ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.first_name = 'Apoyo';
