-- Verificar estructura real de la tabla profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Verificar datos en la tabla profiles
SELECT * FROM profiles LIMIT 5;

-- Verificar específicamente nuestro usuario
SELECT * FROM profiles WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';

-- Verificar si existe con user_id
SELECT * FROM profiles WHERE user_id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
