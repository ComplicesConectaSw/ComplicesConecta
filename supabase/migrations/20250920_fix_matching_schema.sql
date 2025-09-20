-- =====================================================
-- 🔧 CORRECCIÓN ESQUEMA MATCHING - MatchingService.ts
-- ComplicesConecta v2.9.3 - Fecha: 20 de septiembre, 2025 - 03:34 hrs
-- Propósito: Alinear esquema DB con código MatchingService.ts
-- =====================================================

-- 1. CORREGIR TABLA user_likes para coincidir con MatchingService.ts
-- Renombrar columnas para coincidir con el código
ALTER TABLE public.user_likes 
RENAME COLUMN user_id TO liker_id;

ALTER TABLE public.user_likes 
RENAME COLUMN liked_user_id TO liked_id;

ALTER TABLE public.user_likes 
RENAME COLUMN liked TO is_active;

-- 2. AGREGAR COLUMNA interests A profiles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'interests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 3. CREAR FUNCIONES RPC NECESARIAS PARA MatchingService.ts

-- Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS public.get_user_matches(UUID);
DROP FUNCTION IF EXISTS public.get_potential_matches(UUID, INTEGER, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.update_user_activity(UUID);

-- Función: get_user_matches
CREATE OR REPLACE FUNCTION public.get_user_matches(user_id UUID)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    compatibility_score INTEGER,
    shared_interests TEXT[],
    match_reasons TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    last_interaction TIMESTAMP WITH TIME ZONE,
    other_user_name TEXT,
    other_user_avatar TEXT,
    unread_messages INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = user_id THEN m.user2_id 
            ELSE m.user1_id 
        END as other_user_id,
        COALESCE(m.compatibility_score, 0) as compatibility_score,
        COALESCE(m.shared_interests, '{}') as shared_interests,
        COALESCE(m.match_reasons, '{}') as match_reasons,
        m.created_at,
        COALESCE(m.last_interaction, m.created_at) as last_interaction,
        COALESCE(p.first_name || ' ' || COALESCE(p.last_name, ''), 'Usuario') as other_user_name,
        COALESCE(p.avatar_url, '') as other_user_avatar,
        0 as unread_messages -- Placeholder, se puede calcular con subquery si es necesario
    FROM public.matches m
    LEFT JOIN public.profiles p ON (
        CASE 
            WHEN m.user1_id = user_id THEN p.id = m.user2_id 
            ELSE p.id = m.user1_id 
        END
    )
    WHERE (m.user1_id = user_id OR m.user2_id = user_id)
    AND m.is_active = true
    ORDER BY m.created_at DESC;
END;
$$;

-- Función: get_potential_matches
CREATE OR REPLACE FUNCTION public.get_potential_matches(
    user_id UUID,
    max_distance INTEGER DEFAULT 50,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 65,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    profile_id UUID,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    age INTEGER,
    interests TEXT[],
    avatar_url TEXT,
    is_online BOOLEAN,
    last_active TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as profile_id,
        p.first_name,
        p.last_name,
        p.display_name,
        p.age,
        COALESCE(p.interests, '{}') as interests,
        p.avatar_url,
        COALESCE(p.is_online, false) as is_online,
        p.last_active
    FROM public.profiles p
    WHERE p.id != user_id
    AND p.age >= min_age 
    AND p.age <= max_age
    -- Excluir usuarios ya con like o match
    AND NOT EXISTS (
        SELECT 1 FROM public.user_likes ul 
        WHERE ul.liker_id = user_id AND ul.liked_id = p.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = user_id AND m.user2_id = p.id)
        OR (m.user1_id = p.id AND m.user2_id = user_id)
    )
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Función: update_user_activity (placeholder)
CREATE OR REPLACE FUNCTION public.update_user_activity(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles 
    SET last_active = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 4. CREAR TRIGGER PARA DETECTAR MATCHES AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION public.detect_mutual_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar si existe un like mutuo
    IF EXISTS (
        SELECT 1 FROM public.user_likes 
        WHERE liker_id = NEW.liked_id 
        AND liked_id = NEW.liker_id 
        AND is_active = true
    ) THEN
        -- Crear match si no existe
        INSERT INTO public.matches (user1_id, user2_id, compatibility_score, is_active)
        VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id),
            50, -- Score por defecto
            true
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_detect_mutual_match ON public.user_likes;
CREATE TRIGGER trigger_detect_mutual_match
    AFTER INSERT ON public.user_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.detect_mutual_match();

-- 5. AGREGAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_user_likes_liker_id ON public.user_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_liked_id ON public.user_likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_active ON public.user_likes(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON public.matches(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);

-- 6. HABILITAR RLS EN TABLAS DE MATCHING
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_likes
CREATE POLICY "Users can view their own likes" ON public.user_likes
    FOR SELECT USING (auth.uid() = liker_id);

CREATE POLICY "Users can create their own likes" ON public.user_likes
    FOR INSERT WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can update their own likes" ON public.user_likes
    FOR UPDATE USING (auth.uid() = liker_id);

-- Políticas RLS para matches
CREATE POLICY "Users can view their matches" ON public.matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas RLS para match_interactions
CREATE POLICY "Users can view interactions in their matches" ON public.match_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.matches m 
            WHERE m.id = match_id 
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can create interactions in their matches" ON public.match_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.matches m 
            WHERE m.id = match_id 
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

-- =====================================================
-- ✅ MIGRACIÓN COMPLETADA
-- Esquema alineado con MatchingService.ts
-- =====================================================
