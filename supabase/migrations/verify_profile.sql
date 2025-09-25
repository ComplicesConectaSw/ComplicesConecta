-- Verificar que el perfil existe y está correctamente configurado
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    display_name,
    email,
    role,
    created_at
FROM profiles 
WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Verificar rol de admin
SELECT * FROM user_roles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
