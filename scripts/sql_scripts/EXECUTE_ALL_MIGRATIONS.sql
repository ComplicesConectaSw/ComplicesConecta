-- =====================================================
-- EJECUTAR TODAS LAS MIGRACIONES EN ORDEN CORRECTO
-- Fecha: 14/09/2025 09:11hrs
-- Versión: v2.8.1 - Script único para ejecutar todo
-- =====================================================

-- PASO 1: CREAR TABLAS BÁSICAS
-- =====================================================

-- 1. Extender tabla profiles con campos de matching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'principiante';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range_min INTEGER DEFAULT 18;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range_max INTEGER DEFAULT 65;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Tabla de likes de usuarios
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(liker_id, liked_id),
    CHECK (liker_id != liked_id)
);

-- 3. Tabla de matches mutuos
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    compatibility_score INTEGER DEFAULT 0,
    shared_interests TEXT[] DEFAULT '{}',
    match_reasons TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id)
);

-- 4. Tabla de interacciones de matches
CREATE TABLE IF NOT EXISTS public.match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('message', 'like', 'view', 'block', 'report')),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de imágenes de perfil
CREATE TABLE IF NOT EXISTS public.profile_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size INTEGER,
    mime_type VARCHAR(100)
);

-- Constraint para email único en profiles (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_email_profiles' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT unique_email_profiles UNIQUE (email);
    END IF;
END $$;

-- PASO 2: CREAR ÍNDICES
-- =====================================================

-- Índices para user_likes
CREATE INDEX IF NOT EXISTS idx_user_likes_liker_id ON public.user_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_liked_id ON public.user_likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_active ON public.user_likes(liker_id, liked_id) WHERE is_active = true;

-- Índices para matches
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility ON public.matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_active ON public.matches(user1_id, user2_id) WHERE is_active = true;

-- Índices para match_interactions
CREATE INDEX IF NOT EXISTS idx_match_interactions_match_id ON public.match_interactions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_user_id ON public.match_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_type ON public.match_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_match_interactions_created_at ON public.match_interactions(created_at DESC);

-- Índices para profile_images
CREATE INDEX IF NOT EXISTS idx_profile_images_user_id ON public.profile_images(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_images_primary ON public.profile_images(user_id) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_profile_images_public ON public.profile_images(user_id) WHERE is_public = true;

-- Índices para profiles extendidos
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_online ON public.profiles(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active DESC);

-- PASO 3: ACTIVAR RLS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;

-- Políticas para user_likes
DROP POLICY IF EXISTS "Users can view their own likes" ON public.user_likes;
CREATE POLICY "Users can view their own likes" ON public.user_likes
    FOR SELECT USING (liker_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own likes" ON public.user_likes;
CREATE POLICY "Users can create their own likes" ON public.user_likes
    FOR INSERT WITH CHECK (liker_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own likes" ON public.user_likes;
CREATE POLICY "Users can update their own likes" ON public.user_likes
    FOR UPDATE USING (liker_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;
CREATE POLICY "Users can delete their own likes" ON public.user_likes
    FOR DELETE USING (liker_id = auth.uid());

-- Políticas para matches
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
CREATE POLICY "Users can view their matches" ON public.matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

DROP POLICY IF EXISTS "System can create matches" ON public.matches;
CREATE POLICY "System can create matches" ON public.matches
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;
CREATE POLICY "Users can update their matches" ON public.matches
    FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Políticas para match_interactions
DROP POLICY IF EXISTS "Users can view interactions in their matches" ON public.match_interactions;
CREATE POLICY "Users can view interactions in their matches" ON public.match_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_interactions.match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create interactions in their matches" ON public.match_interactions;
CREATE POLICY "Users can create interactions in their matches" ON public.match_interactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_interactions.match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- Políticas para profile_images
DROP POLICY IF EXISTS "Users can view public images" ON public.profile_images;
CREATE POLICY "Users can view public images" ON public.profile_images
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own images" ON public.profile_images;
CREATE POLICY "Users can view their own images" ON public.profile_images
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own images" ON public.profile_images;
CREATE POLICY "Users can manage their own images" ON public.profile_images
    FOR ALL USING (user_id = auth.uid());

-- PASO 4: CREAR FUNCIONES
-- =====================================================

-- Función para crear match mutuo cuando hay like recíproco
CREATE OR REPLACE FUNCTION create_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
    mutual_like_exists BOOLEAN;
    new_match_id UUID;
BEGIN
    -- Verificar si existe like recíproco
    SELECT EXISTS(
        SELECT 1 FROM public.user_likes 
        WHERE liker_id = NEW.liked_id 
        AND liked_id = NEW.liker_id 
        AND is_active = true
    ) INTO mutual_like_exists;
    
    -- Si existe like mutuo, crear match
    IF mutual_like_exists THEN
        INSERT INTO public.matches (user1_id, user2_id, created_at)
        VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id),
            NOW()
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING
        RETURNING id INTO new_match_id;
        
        -- Log del match creado
        IF new_match_id IS NOT NULL THEN
            RAISE NOTICE 'Nuevo match creado: % entre % y %', new_match_id, NEW.liker_id, NEW.liked_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear matches automáticamente
DROP TRIGGER IF EXISTS create_match_on_mutual_like ON public.user_likes;
CREATE TRIGGER create_match_on_mutual_like
    AFTER INSERT ON public.user_likes
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION create_mutual_match();

-- Función para actualizar last_interaction en matches
CREATE OR REPLACE FUNCTION update_match_interaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.matches 
    SET last_interaction = NEW.created_at 
    WHERE id = NEW.match_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_interaction
DROP TRIGGER IF EXISTS update_match_last_interaction ON public.match_interactions;
CREATE TRIGGER update_match_last_interaction
    AFTER INSERT ON public.match_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_match_interaction();

-- Función para actualizar is_online y last_active
CREATE OR REPLACE FUNCTION update_user_activity(user_id UUID, is_online BOOLEAN DEFAULT true)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        is_online = update_user_activity.is_online,
        last_active = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener matches de un usuario
CREATE OR REPLACE FUNCTION get_user_matches(user_id UUID)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_avatar TEXT,
    compatibility_score INTEGER,
    shared_interests TEXT[],
    match_reasons TEXT[],
    last_interaction TIMESTAMP WITH TIME ZONE,
    unread_messages INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = get_user_matches.user_id THEN m.user2_id 
            ELSE m.user1_id 
        END as other_user_id,
        COALESCE(p.first_name || ' ' || p.last_name, p.display_name, 'Usuario') as other_user_name,
        p.avatar_url as other_user_avatar,
        m.compatibility_score,
        m.shared_interests,
        m.match_reasons,
        m.last_interaction,
        COALESCE(
            (SELECT COUNT(*)::INTEGER 
             FROM public.match_interactions mi 
             WHERE mi.match_id = m.id 
             AND mi.user_id != get_user_matches.user_id 
             AND mi.interaction_type = 'message'
             AND mi.created_at > COALESCE(
                 (SELECT MAX(created_at) 
                  FROM public.match_interactions mi2 
                  WHERE mi2.match_id = m.id 
                  AND mi2.user_id = get_user_matches.user_id 
                  AND mi2.interaction_type = 'view'), 
                 m.created_at
             )), 
            0
        ) as unread_messages
    FROM public.matches m
    JOIN public.profiles p ON p.id = CASE 
        WHEN m.user1_id = get_user_matches.user_id THEN m.user2_id 
        ELSE m.user1_id 
    END
    WHERE (m.user1_id = get_user_matches.user_id OR m.user2_id = get_user_matches.user_id)
    AND m.is_active = true
    ORDER BY m.last_interaction DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener perfiles potenciales para matching
CREATE OR REPLACE FUNCTION get_potential_matches(
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
    distance_km NUMERIC,
    is_online BOOLEAN,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as profile_id,
        p.first_name,
        p.last_name,
        p.display_name,
        p.age,
        p.interests,
        p.avatar_url,
        0::NUMERIC as distance_km,
        p.is_online,
        p.last_active
    FROM public.profiles p
    WHERE p.id != get_potential_matches.user_id
    AND p.age BETWEEN get_potential_matches.min_age AND get_potential_matches.max_age
    AND NOT EXISTS (
        SELECT 1 FROM public.user_likes ul 
        WHERE ul.liker_id = get_potential_matches.user_id 
        AND ul.liked_id = p.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = get_potential_matches.user_id AND m.user2_id = p.id)
        OR (m.user1_id = p.id AND m.user2_id = get_potential_matches.user_id)
    )
    ORDER BY p.is_online DESC, p.last_active DESC
    LIMIT get_potential_matches.limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5: DATOS DE PRUEBA
-- =====================================================

-- Insertar intereses de ejemplo
DO $$
BEGIN
    UPDATE public.profiles 
    SET interests = ARRAY['Lifestyle Swinger', 'Comunicación Abierta', 'Respeto Mutuo']
    WHERE interests IS NULL OR array_length(interests, 1) IS NULL;
    
    RAISE NOTICE 'Datos de prueba insertados para desarrollo';
END $$;

-- Comentarios
COMMENT ON TABLE public.user_likes IS 'Tabla de likes entre usuarios para sistema de matching';
COMMENT ON TABLE public.matches IS 'Tabla de matches mutuos con scores de compatibilidad';
COMMENT ON TABLE public.match_interactions IS 'Tabla de interacciones dentro de matches (mensajes, views, etc.)';
COMMENT ON TABLE public.profile_images IS 'Tabla de imágenes de perfil con soporte para múltiples imágenes';

-- CONFIRMACIÓN FINAL
SELECT 'Sistema de matching completamente configurado y listo para usar' as status;
