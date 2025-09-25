-- Script para corregir usuarios administradores en producción
-- Fecha: 13 de septiembre 2025

-- 1. Verificar usuarios existentes
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com');

-- 2. Verificar perfiles existentes
SELECT 
    id,
    user_id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com');

-- 3. Verificar roles de usuario
SELECT 
    ur.user_id,
    ur.role,
    p.email,
    p.first_name,
    p.last_name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE p.email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com');

-- 4. CORREGIR: Insertar/actualizar perfil para complicesconectasw@outlook.es
-- Usar UUID dinámico del usuario autenticado actual
DO $$
DECLARE
    complices_uuid UUID;
BEGIN
    -- Buscar UUID actual de complicesconectasw@outlook.es
    SELECT id INTO complices_uuid 
    FROM auth.users 
    WHERE email = 'complicesconectasw@outlook.es';
    
    -- Si existe el usuario, actualizar perfil y rol
    IF complices_uuid IS NOT NULL THEN
        -- Actualizar perfil
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
        
        -- Actualizar rol
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
            
        RAISE NOTICE 'Perfil y rol actualizados para complicesconectasw@outlook.es con UUID: %', complices_uuid;
    ELSE
        RAISE NOTICE 'Usuario complicesconectasw@outlook.es no encontrado en auth.users';
    END IF;
END $$;

-- 6. CORREGIR: Insertar/actualizar perfil para djwacko28@gmail.com (si existe el usuario)
-- Primero necesitamos obtener el UUID correcto
DO $$
DECLARE
    djwacko_uuid UUID;
BEGIN
    -- Buscar UUID de djwacko28@gmail.com
    SELECT id INTO djwacko_uuid 
    FROM auth.users 
    WHERE email = 'djwacko28@gmail.com';
    
    -- Si existe el usuario, actualizar perfil y rol
    IF djwacko_uuid IS NOT NULL THEN
        -- Actualizar perfil
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
        
        -- Actualizar rol
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
            
        RAISE NOTICE 'Perfil y rol actualizados para djwacko28@gmail.com con UUID: %', djwacko_uuid;
    ELSE
        RAISE NOTICE 'Usuario djwacko28@gmail.com no encontrado en auth.users';
    END IF;
END $$;

-- 7. Verificar correcciones aplicadas
SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role as profile_role,
    ur.role as user_role,
    au.email as auth_email,
    au.email_confirmed_at
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY p.email;
