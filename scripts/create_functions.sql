-- =====================================================
-- 🔧 SISTEMA AUTOMÁTICO DE FUNCIONES CRÍTICAS
-- ComplicesConecta v2.1.2 - Funciones de Matching y Utilidades
-- Fecha: 06 de septiembre, 2025 - 05:32 hrs
-- =====================================================

-- 🤖 AUDITOR Y REPARADOR AUTOMÁTICO DE FUNCIONES
-- Crea funciones críticas para matching, roles y utilidades
-- Scripts idempotentes - seguros para ejecutar múltiples veces

DO $$
BEGIN
    RAISE NOTICE '🔧 INICIANDO SISTEMA AUTOMÁTICO DE FUNCIONES CRÍTICAS';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    RAISE NOTICE '🛠️ Creando funciones de matching y utilidades...';
END $$;

-- 🔐 FUNCIÓN: has_role - Verificar rol de usuario
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_uuid AND role = role_name
    );
END;
$$;

-- 💕 FUNCIÓN: detect_mutual_match - Detectar matches mutuos
-- =====================================================

CREATE OR REPLACE FUNCTION public.detect_mutual_match(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar si ambos usuarios se han dado like mutuamente
    RETURN EXISTS (
        SELECT 1 FROM public.user_likes 
        WHERE user_id = user1_uuid AND liked_user_id = user2_uuid AND liked = true
    ) AND EXISTS (
        SELECT 1 FROM public.user_likes 
        WHERE user_id = user2_uuid AND liked_user_id = user1_uuid AND liked = true
    );
END;
$$;

-- 🎯 FUNCIÓN: get_user_matches - Obtener matches de usuario
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_matches(user_uuid UUID)
RETURNS TABLE (
    match_id UUID,
    matched_user_id UUID,
    matched_user_name TEXT,
    matched_user_avatar TEXT,
    compatibility_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        CASE 
            WHEN m.user1_id = user_uuid THEN m.user2_id 
            ELSE m.user1_id 
        END as matched_user_id,
        CASE 
            WHEN m.user1_id = user_uuid THEN p2.first_name || ' ' || COALESCE(p2.last_name, '')
            ELSE p1.first_name || ' ' || COALESCE(p1.last_name, '')
        END as matched_user_name,
        CASE 
            WHEN m.user1_id = user_uuid THEN p2.avatar_url
            ELSE p1.avatar_url
        END as matched_user_avatar,
        m.compatibility_score,
        m.created_at
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON p1.id = m.user1_id
    LEFT JOIN public.profiles p2 ON p2.id = m.user2_id
    WHERE (m.user1_id = user_uuid OR m.user2_id = user_uuid)
    AND m.status = 'active'
    ORDER BY m.created_at DESC;
END;
$$;

-- 🔄 FUNCIÓN: create_match_if_mutual - Crear match si es mutuo
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_match_if_mutual(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    match_uuid UUID;
    mutual_match BOOLEAN;
BEGIN
    -- Verificar si es un match mutuo
    SELECT public.detect_mutual_match(user1_uuid, user2_uuid) INTO mutual_match;
    
    IF mutual_match THEN
        -- Verificar si ya existe un match
        SELECT id INTO match_uuid 
        FROM public.matches 
        WHERE (user1_id = user1_uuid AND user2_id = user2_uuid) 
           OR (user1_id = user2_uuid AND user2_id = user1_uuid);
        
        -- Si no existe, crear el match
        IF match_uuid IS NULL THEN
            INSERT INTO public.matches (user1_id, user2_id, status, compatibility_score)
            VALUES (user1_uuid, user2_uuid, 'active', 
                   (RANDOM() * 40 + 60)::INTEGER) -- Score entre 60-100
            RETURNING id INTO match_uuid;
        END IF;
    END IF;
    
    RETURN match_uuid;
END;
$$;

-- 📊 FUNCIÓN: calculate_compatibility_score - Calcular compatibilidad
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(user1_uuid UUID, user2_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user1_interests TEXT[];
    user2_interests TEXT[];
    user1_looking_for TEXT[];
    user2_looking_for TEXT[];
    common_interests INTEGER := 0;
    common_preferences INTEGER := 0;
    total_score INTEGER := 50; -- Base score
BEGIN
    -- Obtener intereses y preferencias de ambos usuarios
    SELECT interests, looking_for INTO user1_interests, user1_looking_for
    FROM public.profiles WHERE id = user1_uuid;
    
    SELECT interests, looking_for INTO user2_interests, user2_looking_for
    FROM public.profiles WHERE id = user2_uuid;
    
    -- Calcular intereses comunes
    IF user1_interests IS NOT NULL AND user2_interests IS NOT NULL THEN
        SELECT array_length(
            ARRAY(SELECT unnest(user1_interests) INTERSECT SELECT unnest(user2_interests)), 1
        ) INTO common_interests;
        
        -- Añadir puntos por intereses comunes (máximo 30 puntos)
        total_score := total_score + LEAST(common_interests * 5, 30);
    END IF;
    
    -- Calcular preferencias comunes
    IF user1_looking_for IS NOT NULL AND user2_looking_for IS NOT NULL THEN
        SELECT array_length(
            ARRAY(SELECT unnest(user1_looking_for) INTERSECT SELECT unnest(user2_looking_for)), 1
        ) INTO common_preferences;
        
        -- Añadir puntos por preferencias comunes (máximo 20 puntos)
        total_score := total_score + LEAST(common_preferences * 4, 20);
    END IF;
    
    -- Asegurar que el score esté entre 0 y 100
    RETURN LEAST(GREATEST(total_score, 0), 100);
END;
$$;

-- 🗑️ FUNCIÓN: cleanup_old_matches - Limpiar matches antiguos
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_matches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar matches inactivos de más de 30 días
    DELETE FROM public.matches 
    WHERE status = 'inactive' 
    AND updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- 🔍 FUNCIÓN: search_compatible_profiles - Buscar perfiles compatibles
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_compatible_profiles(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    profile_id UUID,
    first_name TEXT,
    last_name TEXT,
    age INTEGER,
    avatar_url TEXT,
    compatibility_score INTEGER,
    common_interests TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_interests TEXT[];
    user_age_min INTEGER;
    user_age_max INTEGER;
    user_max_distance INTEGER;
BEGIN
    -- Obtener preferencias del usuario
    SELECT interests, age_range_min, age_range_max, max_distance 
    INTO user_interests, user_age_min, user_age_max, user_max_distance
    FROM public.profiles WHERE id = user_uuid;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.age,
        p.avatar_url,
        public.calculate_compatibility_score(user_uuid, p.id) as compatibility_score,
        ARRAY(SELECT unnest(user_interests) INTERSECT SELECT unnest(p.interests)) as common_interests
    FROM public.profiles p
    WHERE p.id != user_uuid
    AND p.is_active = true
    AND p.is_demo = false
    AND p.age BETWEEN COALESCE(user_age_min, 18) AND COALESCE(user_age_max, 65)
    AND NOT EXISTS (
        SELECT 1 FROM public.user_likes ul 
        WHERE ul.user_id = user_uuid AND ul.liked_user_id = p.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = user_uuid AND m.user2_id = p.id) 
           OR (m.user1_id = p.id AND m.user2_id = user_uuid)
    )
    ORDER BY public.calculate_compatibility_score(user_uuid, p.id) DESC
    LIMIT limit_count;
END;
$$;

-- 📝 FUNCIÓN: get_user_profile_complete - Obtener perfil completo
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_profile_complete(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    age INTEGER,
    bio TEXT,
    avatar_url TEXT,
    interests TEXT[],
    looking_for TEXT[],
    profile_type TEXT,
    swinger_experience TEXT,
    is_demo BOOLEAN,
    is_active BOOLEAN,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.email,
        p.age,
        p.bio,
        p.avatar_url,
        p.interests,
        p.looking_for,
        p.profile_type,
        p.swinger_experience,
        p.is_demo,
        p.is_active,
        COALESCE(ur.role, 'user') as role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE p.id = user_uuid;
END;
$$;

DO $$
BEGIN
    RAISE NOTICE '✅ FUNCIONES CRÍTICAS CREADAS EXITOSAMENTE';
    RAISE NOTICE '🔧 Sistema de matching y utilidades implementado';
    RAISE NOTICE '💕 Funciones de compatibilidad y búsqueda activas';
END $$;
