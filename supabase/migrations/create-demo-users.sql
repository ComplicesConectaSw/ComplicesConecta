-- Script SQL para crear usuarios demo con integridad de datos
-- Ejecutar en el editor SQL de Supabase

-- 1. Crear usuarios en auth.users usando la función admin
DO $$
DECLARE
    user_single_id UUID;
    user_pareja_id UUID;
    user_admin_id UUID;
    user_moderador_id UUID;
BEGIN
    -- Verificar si los usuarios ya existen
    SELECT id INTO user_single_id FROM auth.users WHERE email = 'single@outlook.es';
    SELECT id INTO user_pareja_id FROM auth.users WHERE email = 'pareja@outlook.es';
    SELECT id INTO user_admin_id FROM auth.users WHERE email = 'admin@outlook.es';
    SELECT id INTO user_moderador_id FROM auth.users WHERE email = 'moderador@outlook.es';

    -- Crear usuario single si no existe
    IF user_single_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'single@outlook.es',
            crypt('Demo1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Usuario Demo Single"}',
            FALSE,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_single_id;
        
        RAISE NOTICE 'Usuario single creado con ID: %', user_single_id;
    ELSE
        RAISE NOTICE 'Usuario single ya existe con ID: %', user_single_id;
    END IF;

    -- Crear usuario pareja si no existe
    IF user_pareja_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'pareja@outlook.es',
            crypt('Demo1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Usuario Demo Pareja"}',
            FALSE,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_pareja_id;
        
        RAISE NOTICE 'Usuario pareja creado con ID: %', user_pareja_id;
    ELSE
        RAISE NOTICE 'Usuario pareja ya existe con ID: %', user_pareja_id;
    END IF;

    -- Crear usuario admin si no existe
    IF user_admin_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@outlook.es',
            crypt('Demo1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador Demo"}',
            FALSE,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_admin_id;
        
        RAISE NOTICE 'Usuario admin creado con ID: %', user_admin_id;
    ELSE
        RAISE NOTICE 'Usuario admin ya existe con ID: %', user_admin_id;
    END IF;

    -- Crear usuario moderador si no existe
    IF user_moderador_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'moderador@outlook.es',
            crypt('Demo1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Moderador Demo"}',
            FALSE,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_moderador_id;
        
        RAISE NOTICE 'Usuario moderador creado con ID: %', user_moderador_id;
    ELSE
        RAISE NOTICE 'Usuario moderador ya existe con ID: %', user_moderador_id;
    END IF;

    -- 2. Crear perfiles usando los UUIDs reales
    -- Eliminar perfiles existentes para estos usuarios (si existen)
    DELETE FROM profiles WHERE user_id IN (user_single_id, user_pareja_id, user_admin_id, user_moderador_id);

    -- Insertar perfiles con UUIDs reales
    INSERT INTO profiles (
        user_id, 
        name, 
        bio, 
        age, 
        gender, 
        interested_in, 
        account_type, 
        is_verified, 
        personality_traits, 
        lifestyle_preferences, 
        location_preferences
    ) VALUES 
    (
        user_single_id,
        'Usuario Demo Single',
        'Perfil de demostración Single',
        28,
        'Mujer',
        'Hombre',
        'single',
        true,
        '{"openness": 75}',
        '{"activity_level": "moderate"}',
        '{"max_distance": 50}'
    ),
    (
        user_pareja_id,
        'Usuario Demo Pareja',
        'Perfil de demostración Pareja',
        30,
        'Hombre',
        'Mujer',
        'couple',
        true,
        '{"conscientiousness": 85}',
        '{"social_preference": "balanced"}',
        '{"max_distance": 100}'
    ),
    (
        user_admin_id,
        'Administrador Demo',
        'Perfil administrador para testing',
        35,
        'Hombre',
        'Mujer',
        'single',
        true,
        '{"openness": 85}',
        '{"activity_level": "high"}',
        '{"max_distance": 200}'
    ),
    (
        user_moderador_id,
        'Moderador Demo',
        'Perfil moderador para testing',
        33,
        'No binario',
        'Todos',
        'single',
        true,
        '{"extraversion": 70}',
        '{"activity_level": "moderate"}',
        '{"max_distance": 150}'
    );

    RAISE NOTICE 'Perfiles creados exitosamente';

    -- 3. Mostrar UUIDs para referencia
    RAISE NOTICE 'UUIDs generados:';
    RAISE NOTICE 'single@outlook.es: %', user_single_id;
    RAISE NOTICE 'pareja@outlook.es: %', user_pareja_id;
    RAISE NOTICE 'admin@outlook.es: %', user_admin_id;
    RAISE NOTICE 'moderador@outlook.es: %', user_moderador_id;

END $$;

-- 4. Validar integridad final
SELECT 
    p.user_id,
    u.email,
    p.name,
    p.account_type
FROM profiles p 
JOIN auth.users u ON p.user_id = u.id
WHERE u.email IN ('single@outlook.es', 'pareja@outlook.es', 'admin@outlook.es', 'moderador@outlook.es')
ORDER BY u.email;
