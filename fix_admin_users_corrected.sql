-- Script corregido para usuarios administradores en producción
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

-- 3. Actualizar perfil para complicesconectasw@outlook.es
DO $$
DECLARE
    complices_uuid UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Buscar UUID actual de complicesconectasw@outlook.es
    SELECT id INTO complices_uuid 
    FROM auth.users 
    WHERE email = 'complicesconectasw@outlook.es';
    
    -- Si existe el usuario, actualizar perfil
    IF complices_uuid IS NOT NULL THEN
        -- Verificar si ya existe el perfil
        SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = complices_uuid) INTO profile_exists;
        
        IF profile_exists THEN
            -- Actualizar perfil existente
            UPDATE profiles SET
                email = 'complicesconectasw@outlook.es',
                first_name = 'Administrador',
                last_name = 'ComplicesConecta',
                role = 'admin',
                updated_at = NOW()
            WHERE user_id = complices_uuid;
            
            RAISE NOTICE 'Perfil actualizado para complicesconectasw@outlook.es con UUID: %', complices_uuid;
        ELSE
            -- Insertar nuevo perfil
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
            );
            
            RAISE NOTICE 'Perfil creado para complicesconectasw@outlook.es con UUID: %', complices_uuid;
        END IF;
        
        -- Verificar si existe tabla user_roles y actualizar
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
            -- Verificar si ya existe el rol
            IF EXISTS(SELECT 1 FROM user_roles WHERE user_id = complices_uuid) THEN
                UPDATE user_roles SET
                    role = 'admin'
                WHERE user_id = complices_uuid;
            ELSE
                INSERT INTO user_roles (user_id, role, created_at)
                VALUES (complices_uuid, 'admin', NOW());
            END IF;
            RAISE NOTICE 'Rol actualizado en user_roles para: %', complices_uuid;
        ELSE
            RAISE NOTICE 'Tabla user_roles no existe, solo se actualizó profiles';
        END IF;
            
    ELSE
        RAISE NOTICE 'Usuario complicesconectasw@outlook.es no encontrado en auth.users';
    END IF;
END $$;

-- 4. Actualizar perfil para djwacko28@gmail.com (si existe)
DO $$
DECLARE
    djwacko_uuid UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Buscar UUID de djwacko28@gmail.com
    SELECT id INTO djwacko_uuid 
    FROM auth.users 
    WHERE email = 'djwacko28@gmail.com';
    
    -- Si existe el usuario, actualizar perfil
    IF djwacko_uuid IS NOT NULL THEN
        -- Verificar si ya existe el perfil
        SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = djwacko_uuid) INTO profile_exists;
        
        IF profile_exists THEN
            -- Actualizar perfil existente
            UPDATE profiles SET
                email = 'djwacko28@gmail.com',
                first_name = 'DJ',
                last_name = 'Wacko',
                role = 'admin',
                updated_at = NOW()
            WHERE user_id = djwacko_uuid;
            
            RAISE NOTICE 'Perfil actualizado para djwacko28@gmail.com con UUID: %', djwacko_uuid;
        ELSE
            -- Insertar nuevo perfil
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
            );
            
            RAISE NOTICE 'Perfil creado para djwacko28@gmail.com con UUID: %', djwacko_uuid;
        END IF;
        
        -- Verificar si existe tabla user_roles y actualizar
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
            -- Verificar si ya existe el rol
            IF EXISTS(SELECT 1 FROM user_roles WHERE user_id = djwacko_uuid) THEN
                UPDATE user_roles SET
                    role = 'admin'
                WHERE user_id = djwacko_uuid;
            ELSE
                INSERT INTO user_roles (user_id, role, created_at)
                VALUES (djwacko_uuid, 'admin', NOW());
            END IF;
            RAISE NOTICE 'Rol actualizado en user_roles para: %', djwacko_uuid;
        ELSE
            RAISE NOTICE 'Tabla user_roles no existe, solo se actualizó profiles';
        END IF;
            
    ELSE
        RAISE NOTICE 'Usuario djwacko28@gmail.com no encontrado en auth.users';
    END IF;
END $$;

-- 5. Verificar correcciones aplicadas
SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role as profile_role,
    au.email as auth_email,
    au.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.email IN ('complicesconectasw@outlook.es', 'djwacko28@gmail.com')
ORDER BY p.email;
