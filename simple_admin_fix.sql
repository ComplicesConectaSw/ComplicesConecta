    -- Script simple sin ON CONFLICT
    -- Eliminar perfil existente si existe
    DELETE FROM profiles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

    -- Insertar perfil nuevo
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
        '10b2fa75-5a62-4299-921c-9a1cc99c765b',
        '10b2fa75-5a62-4299-921c-9a1cc99c765b',
        'Administrador',
        'ComplicesConecta',
        'Administrador ComplicesConecta',
        'admin',
        'complicesconectasw@outlook.es',
        true,
        false,
        false
    );

    -- Verificar inserción
    SELECT 'Perfil creado:' as paso;
    SELECT id, user_id, first_name, last_name, display_name, role, email 
    FROM profiles 
    WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
    -- Fecha: 13 de septiembre 2025

    -- 1. Verificar usuario existente
    SELECT 
        id,
        email,
        email_confirmed_at
    FROM auth.users 
    WHERE email = 'complicesconectasw@outlook.es';

    -- 2. Actualizar perfil existente (sin insertar nuevo)
    UPDATE profiles 
    SET 
        email = 'complicesconectasw@outlook.es',
        first_name = 'Administrador',
        last_name = 'ComplicesConecta',
        role = 'admin'
    WHERE user_id = (
        SELECT id FROM auth.users WHERE email = 'complicesconectasw@outlook.es'
    );

    -- 3. Verificar resultado
    SELECT 
        p.user_id,
        p.email,
        p.first_name,
        p.last_name,
        p.role,
        au.email as auth_email
    FROM profiles p
    JOIN auth.users au ON p.user_id = au.id
    WHERE au.email = 'complicesconectasw@outlook.es';
