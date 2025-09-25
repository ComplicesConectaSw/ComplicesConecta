-- Insertar perfil de administrador en tabla profiles
-- UUID del usuario: 10b2fa75-5a62-4299-921c-9a1cc99c765b

-- Verificar si ya existe
SELECT 'Verificando existencia:' as paso;
SELECT * FROM profiles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Eliminar perfil existente si existe
DELETE FROM profiles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Insertar perfil de administrador
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
    gen_random_uuid(),
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
SELECT user_id, first_name, last_name, display_name, role, email 
FROM profiles 
WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
