-- =====================================================
-- CREAR SOLO LA TABLA USER_LIKES
-- Script para resolver error: column "liker_id" does not exist
-- =====================================================

-- Verificar qué tablas existen actualmente
SELECT 'Verificando tablas existentes...' as step;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_likes', 'matches', 'match_interactions', 'profile_images')
ORDER BY table_name;

-- Crear tabla user_likes
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(liker_id, liked_id),
    CHECK (liker_id != liked_id)
);

-- Verificar que se creó correctamente
SELECT 'Tabla user_likes creada exitosamente' as status;

-- Mostrar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tablas finales
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_likes', 'matches', 'match_interactions', 'profile_images')
ORDER BY table_name;
