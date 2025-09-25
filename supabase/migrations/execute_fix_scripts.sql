-- Script combinado para ejecutar en Supabase SQL Editor
-- Ejecutar TODO en una sola operación

-- PASO 1: Verificar usuarios existentes
SELECT 
    'USUARIOS EXISTENTES' as info,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY email;

-- PASO 2: Verificar perfiles existentes
SELECT 
    'PERFILES EXISTENTES' as info,
    user_id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY email;

-- PASO 3: Crear/actualizar perfil para complicesconectasw@outlook.es
DO $$
DECLARE
    complices_uuid UUID;
BEGIN
    -- Buscar UUID actual de complicesconectasw@outlook.es
    SELECT id INTO complices_uuid 
    FROM auth.users 
    WHERE email = 'complicesconectasw@outlook.es';
    
    IF complices_uuid IS NOT NULL THEN
        -- Crear/actualizar perfil
        INSERT INTO profiles (
            user_id,
            email,
            first_name,
            last_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            complices_uuid,
            'complicesconectasw@outlook.es',
            'Administrador',
            'ComplicesConecta',
            'admin',
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) 
        DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            updated_at = NOW();
        
        -- Crear/actualizar rol
        INSERT INTO user_roles (
            user_id,
            role,
            created_at
        ) VALUES (
            complices_uuid,
            'admin',
            NOW()
        ) ON CONFLICT (user_id)
        DO UPDATE SET
            role = EXCLUDED.role;
            
        RAISE NOTICE '✅ Perfil creado para complicesconectasw@outlook.es UUID: %', complices_uuid;
    ELSE
        RAISE NOTICE '❌ Usuario complicesconectasw@outlook.es no encontrado';
    END IF;
END $$;

-- PASO 4: Crear usuario djwacko28@gmail.com si no existe
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
    crypt('Magy_Wacko_nala28', gen_salt('bf')),
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

-- PASO 5: Crear/actualizar perfil para djwacko28@gmail.com
DO $$
DECLARE
    djwacko_uuid UUID;
BEGIN
    -- Buscar UUID de djwacko28@gmail.com
    SELECT id INTO djwacko_uuid 
    FROM auth.users 
    WHERE email = 'djwacko28@gmail.com';
    
    IF djwacko_uuid IS NOT NULL THEN
        -- Crear/actualizar perfil
        INSERT INTO profiles (
            user_id,
            email,
            first_name,
            last_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            djwacko_uuid,
            'djwacko28@gmail.com',
            'DJ',
            'Wacko',
            'admin',
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) 
        DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            updated_at = NOW();
        
        -- Crear/actualizar rol
        INSERT INTO user_roles (
            user_id,
            role,
            created_at
        ) VALUES (
            djwacko_uuid,
            'admin',
            NOW()
        ) ON CONFLICT (user_id)
        DO UPDATE SET
            role = EXCLUDED.role;
            
        RAISE NOTICE '✅ Perfil creado para djwacko28@gmail.com UUID: %', djwacko_uuid;
    ELSE
        RAISE NOTICE '❌ Usuario djwacko28@gmail.com no encontrado';
    END IF;
END $$;

-- PASO 6: Actualizar contraseñas
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'complicesconectasw@outlook.es';

UPDATE auth.users 
SET 
    encrypted_password = crypt('Magy_Wacko_nala28', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'djwacko28@gmail.com';

-- PASO 7: Verificar resultado final
SELECT 
    'RESULTADO FINAL' as info,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role as profile_role,
    ur.role as user_role,
    au.email as auth_email,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY p.email;
