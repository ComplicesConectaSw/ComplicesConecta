-- =====================================================
-- CORREGIR ESTRUCTURA DE TABLA USER_LIKES
-- Cambiar columnas a liker_id y liked_id para MatchingService
-- =====================================================

-- Renombrar columnas para que coincidan con MatchingService
ALTER TABLE public.user_likes 
RENAME COLUMN user_id TO liker_id;

ALTER TABLE public.user_likes 
RENAME COLUMN liked_user_id TO liked_id;

-- Eliminar columna 'liked' que no necesitamos
ALTER TABLE public.user_likes 
DROP COLUMN IF EXISTS liked;

-- Agregar columna is_active si no existe
ALTER TABLE public.user_likes 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Agregar constraints usando DO block para verificar existencia
DO $$
BEGIN
    -- Agregar constraint único si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_liker_liked' 
        AND table_name = 'user_likes'
    ) THEN
        ALTER TABLE public.user_likes 
        ADD CONSTRAINT unique_liker_liked UNIQUE(liker_id, liked_id);
    END IF;
    
    -- Agregar constraint de validación si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_no_self_like' 
        AND table_name = 'user_likes'
    ) THEN
        ALTER TABLE public.user_likes 
        ADD CONSTRAINT check_no_self_like CHECK (liker_id != liked_id);
    END IF;
END $$;

-- Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Tabla user_likes corregida exitosamente' as status;
