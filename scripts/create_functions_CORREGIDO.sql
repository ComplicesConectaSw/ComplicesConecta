-- =====================================================
-- 🔧 SISTEMA DE FUNCIONES CRÍTICAS CORREGIDO
-- ComplicesConecta v2.1.2 - Funciones de Matching y Utilidades
-- Fecha: 06 de septiembre, 2025 - 06:23 hrs
-- =====================================================

-- 🤖 FUNCIONES CRÍTICAS SIN CONFLICTOS
-- Scripts idempotentes - seguros para ejecutar múltiples veces

DO $$
BEGIN
    RAISE NOTICE '🔧 INICIANDO SISTEMA DE FUNCIONES CRÍTICAS CORREGIDO';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    RAISE NOTICE '🛠️ Creando funciones de matching y utilidades...';
END $$;

-- 🔐 FUNCIÓN: has_role - Verificar rol de usuario
-- =====================================================

DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.has_role(p_user_uuid UUID, p_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = p_user_uuid AND role = p_role_name
    );
END;
$$;

-- 💕 FUNCIÓN: detect_mutual_match - Detectar matches mutuos
-- =====================================================

DROP FUNCTION IF EXISTS public.detect_mutual_match(UUID, UUID);
CREATE OR REPLACE FUNCTION public.detect_mutual_match(p_user1_uuid UUID, p_user2_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar si ambos usuarios se han dado like mutuamente
    RETURN EXISTS (
        SELECT 1 FROM public.user_likes 
        WHERE user_id = p_user1_uuid AND liked_user_id = p_user2_uuid AND liked = true
    ) AND EXISTS (
        SELECT 1 FROM public.user_likes 
        WHERE user_id = p_user2_uuid AND liked_user_id = p_user1_uuid AND liked = true
    );
END;
$$;

-- 🎯 FUNCIÓN: get_user_matches - Obtener matches de usuario
-- =====================================================

DROP FUNCTION IF EXISTS public.get_user_matches(UUID);
CREATE OR REPLACE FUNCTION public.get_user_matches(p_user_uuid UUID)
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
            WHEN m.user1_id = p_user_uuid THEN m.user2_id 
            ELSE m.user1_id 
        END as matched_user_id,
        CASE 
            WHEN m.user1_id = p_user_uuid THEN COALESCE(p2.first_name, '') || ' ' || COALESCE(p2.last_name, '')
            ELSE COALESCE(p1.first_name, '') || ' ' || COALESCE(p1.last_name, '')
        END as matched_user_name,
        CASE 
            WHEN m.user1_id = p_user_uuid THEN p2.avatar_url
            ELSE p1.avatar_url
        END as matched_user_avatar,
        m.compatibility_score,
        m.created_at
    FROM public.matches m
    LEFT JOIN public.profiles p1 ON p1.id = m.user1_id
    LEFT JOIN public.profiles p2 ON p2.id = m.user2_id
    WHERE (m.user1_id = p_user_uuid OR m.user2_id = p_user_uuid)
    AND m.status = 'active'
    ORDER BY m.created_at DESC;
END;
$$;

-- 🔄 FUNCIÓN: create_match_if_mutual - Crear match si es mutuo
-- =====================================================

DROP FUNCTION IF EXISTS public.create_match_if_mutual(UUID, UUID);
CREATE OR REPLACE FUNCTION public.create_match_if_mutual(p_user1_uuid UUID, p_user2_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match_uuid UUID;
    v_mutual_match BOOLEAN;
BEGIN
    -- Verificar si es un match mutuo
    SELECT public.detect_mutual_match(p_user1_uuid, p_user2_uuid) INTO v_mutual_match;
    
    IF v_mutual_match THEN
        -- Verificar si ya existe un match
        SELECT id INTO v_match_uuid 
        FROM public.matches 
        WHERE (user1_id = p_user1_uuid AND user2_id = p_user2_uuid) 
           OR (user1_id = p_user2_uuid AND user2_id = p_user1_uuid);
        
        -- Si no existe, crear el match
        IF v_match_uuid IS NULL THEN
            INSERT INTO public.matches (user1_id, user2_id, status, compatibility_score)
            VALUES (p_user1_uuid, p_user2_uuid, 'active', 
                   (RANDOM() * 40 + 60)::INTEGER) -- Score entre 60-100
            RETURNING id INTO v_match_uuid;
        END IF;
    END IF;
    
    RETURN v_match_uuid;
END;
$$;

-- 📊 FUNCIÓN: calculate_compatibility_score - Calcular compatibilidad
-- =====================================================

DROP FUNCTION IF EXISTS public.calculate_compatibility_score(UUID, UUID);
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(p_user1_uuid UUID, p_user2_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user1_interests TEXT[];
    v_user2_interests TEXT[];
    v_user1_looking_for TEXT[];
    v_user2_looking_for TEXT[];
    v_common_interests INTEGER := 0;
    v_common_preferences INTEGER := 0;
    v_total_score INTEGER := 50; -- Base score
BEGIN
    -- Obtener intereses y preferencias de ambos usuarios
    SELECT interests, looking_for INTO v_user1_interests, v_user1_looking_for
    FROM public.profiles WHERE id = p_user1_uuid;
    
    SELECT interests, looking_for INTO v_user2_interests, v_user2_looking_for
    FROM public.profiles WHERE id = p_user2_uuid;
    
    -- Calcular intereses comunes
    IF v_user1_interests IS NOT NULL AND v_user2_interests IS NOT NULL THEN
        SELECT array_length(
            ARRAY(SELECT unnest(v_user1_interests) INTERSECT SELECT unnest(v_user2_interests)), 1
        ) INTO v_common_interests;
        
        -- Añadir puntos por intereses comunes (máximo 30 puntos)
        v_total_score := v_total_score + LEAST(COALESCE(v_common_interests, 0) * 5, 30);
    END IF;
    
    -- Calcular preferencias comunes
    IF v_user1_looking_for IS NOT NULL AND v_user2_looking_for IS NOT NULL THEN
        SELECT array_length(
            ARRAY(SELECT unnest(v_user1_looking_for) INTERSECT SELECT unnest(v_user2_looking_for)), 1
        ) INTO v_common_preferences;
        
        -- Añadir puntos por preferencias comunes (máximo 20 puntos)
        v_total_score := v_total_score + LEAST(COALESCE(v_common_preferences, 0) * 4, 20);
    END IF;
    
    -- Asegurar que el score esté entre 0 y 100
    RETURN LEAST(GREATEST(v_total_score, 0), 100);
END;
$$;

-- 🗑️ FUNCIÓN: cleanup_old_matches - Limpiar matches antiguos
-- =====================================================

DROP FUNCTION IF EXISTS public.cleanup_old_matches();
CREATE OR REPLACE FUNCTION public.cleanup_old_matches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Eliminar matches inactivos de más de 30 días
    DELETE FROM public.matches 
    WHERE status = 'inactive' 
    AND updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$;

-- 🔍 FUNCIÓN: search_compatible_profiles - Buscar perfiles compatibles
-- =====================================================

DROP FUNCTION IF EXISTS public.search_compatible_profiles(UUID, INTEGER);
CREATE OR REPLACE FUNCTION public.search_compatible_profiles(
    p_user_uuid UUID,
    p_limit_count INTEGER DEFAULT 10
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
    v_user_interests TEXT[];
    v_user_age_min INTEGER;
    v_user_age_max INTEGER;
    v_user_max_distance INTEGER;
BEGIN
    -- Obtener preferencias del usuario
    SELECT interests, age_range_min, age_range_max, max_distance 
    INTO v_user_interests, v_user_age_min, v_user_age_max, v_user_max_distance
    FROM public.profiles WHERE id = p_user_uuid;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.age,
        p.avatar_url,
        public.calculate_compatibility_score(p_user_uuid, p.id) as compatibility_score,
        CASE 
            WHEN v_user_interests IS NOT NULL AND p.interests IS NOT NULL THEN
                ARRAY(SELECT unnest(v_user_interests) INTERSECT SELECT unnest(p.interests))
            ELSE ARRAY[]::TEXT[]
        END as common_interests
    FROM public.profiles p
    WHERE p.id != p_user_uuid
    AND COALESCE(p.is_active, true) = true
    AND COALESCE(p.is_demo, false) = false
    AND p.age BETWEEN COALESCE(v_user_age_min, 18) AND COALESCE(v_user_age_max, 65)
    AND NOT EXISTS (
        SELECT 1 FROM public.user_likes ul 
        WHERE ul.user_id = p_user_uuid AND ul.liked_user_id = p.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = p_user_uuid AND m.user2_id = p.id) 
           OR (m.user1_id = p.id AND m.user2_id = p_user_uuid)
    )
    ORDER BY public.calculate_compatibility_score(p_user_uuid, p.id) DESC
    LIMIT p_limit_count;
END;
$$;

-- 📝 FUNCIÓN: get_user_profile_complete - Obtener perfil completo
-- =====================================================

DROP FUNCTION IF EXISTS public.get_user_profile_complete(UUID);
CREATE OR REPLACE FUNCTION public.get_user_profile_complete(p_user_uuid UUID)
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
        COALESCE(p.is_demo, false) as is_demo,
        COALESCE(p.is_active, true) as is_active,
        COALESCE(ur.role, 'user') as role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE p.id = p_user_uuid;
END;
$$;

-- 🔄 FUNCIÓN: process_like_action - Procesar acción de like
-- =====================================================

DROP FUNCTION IF EXISTS public.process_like_action(UUID, UUID, BOOLEAN);
CREATE OR REPLACE FUNCTION public.process_like_action(
    p_liker_id UUID,
    p_liked_id UUID,
    p_is_like BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match_id UUID;
    v_is_mutual BOOLEAN := false;
    v_result JSON;
BEGIN
    -- Insertar o actualizar el like
    INSERT INTO public.user_likes (user_id, liked_user_id, liked)
    VALUES (p_liker_id, p_liked_id, p_is_like)
    ON CONFLICT (user_id, liked_user_id)
    DO UPDATE SET liked = p_is_like, created_at = NOW();
    
    -- Si es un like, verificar si hay match mutuo
    IF p_is_like THEN
        SELECT public.create_match_if_mutual(p_liker_id, p_liked_id) INTO v_match_id;
        v_is_mutual := (v_match_id IS NOT NULL);
    END IF;
    
    -- Construir respuesta JSON
    v_result := json_build_object(
        'success', true,
        'is_mutual', v_is_mutual,
        'match_id', v_match_id,
        'message', CASE 
            WHEN v_is_mutual THEN 'Match creado exitosamente'
            WHEN p_is_like THEN 'Like registrado'
            ELSE 'Dislike registrado'
        END
    );
    
    RETURN v_result;
END;
$$;

DO $$
BEGIN
    RAISE NOTICE '✅ FUNCIONES CRÍTICAS CORREGIDAS CREADAS EXITOSAMENTE';
    RAISE NOTICE '🔧 Sistema de matching y utilidades implementado sin conflictos';
    RAISE NOTICE '💕 Funciones de compatibilidad y búsqueda activas';
    RAISE NOTICE '🚀 Todas las funciones usan prefijos p_ para evitar conflictos';
END $$;
