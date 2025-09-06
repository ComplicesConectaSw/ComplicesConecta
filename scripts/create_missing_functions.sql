-- ==========================================
-- CREAR FUNCIONES DE BD FALTANTES
-- Fecha: 2025-09-06 04:50 UTC-6
-- Propósito: Implementar funciones críticas pendientes
-- ==========================================

-- 1. FUNCIÓN: detect_mutual_match
CREATE OR REPLACE FUNCTION detect_mutual_match(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que ambos usuarios se hayan dado like mutuamente
    RETURN EXISTS (
        SELECT 1 FROM user_likes 
        WHERE liker_id = user1_id AND liked_id = user2_id
    ) AND EXISTS (
        SELECT 1 FROM user_likes 
        WHERE liker_id = user2_id AND liked_id = user1_id
    );
END;
$$;

-- 2. FUNCIÓN: get_user_matches
CREATE OR REPLACE FUNCTION get_user_matches(
    p_user_id uuid,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    match_id uuid,
    matched_user_id uuid,
    matched_at timestamp with time zone,
    last_message_at timestamp with time zone,
    unread_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN m.user2_id
            ELSE m.user1_id
        END as matched_user_id,
        m.created_at as matched_at,
        m.last_message_at,
        COALESCE(
            (SELECT COUNT(*)::integer 
             FROM messages msg 
             WHERE msg.chat_room_id = m.chat_room_id 
             AND msg.sender_id != p_user_id 
             AND msg.created_at > COALESCE(m.last_read_at, m.created_at)
            ), 0
        ) as unread_count
    FROM matches m
    WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND m.is_active = true
    ORDER BY COALESCE(m.last_message_at, m.created_at) DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 3. FUNCIÓN: get_potential_matches
CREATE OR REPLACE FUNCTION get_potential_matches(
    p_user_id uuid,
    p_max_distance integer DEFAULT 50,
    p_limit integer DEFAULT 20
)
RETURNS TABLE (
    user_id uuid,
    compatibility_score integer,
    shared_interests text[],
    distance_km integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile RECORD;
    user_interests text[];
    user_looking_for text[];
    user_lat decimal;
    user_lng decimal;
BEGIN
    -- Obtener perfil del usuario actual
    SELECT p.interests, p.looking_for, p.latitude, p.longitude
    INTO user_interests, user_looking_for, user_lat, user_lng
    FROM profiles p
    WHERE p.id = p_user_id;
    
    -- Si no tiene perfil completo, retornar vacío
    IF user_interests IS NULL OR user_looking_for IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id as user_id,
        -- Calcular compatibilidad basada en intereses compartidos
        CASE 
            WHEN array_length(user_interests & p.interests, 1) IS NULL THEN 0
            ELSE ROUND(
                (array_length(user_interests & p.interests, 1)::decimal / 
                 GREATEST(array_length(user_interests, 1), array_length(p.interests, 1))) * 100
            )::integer
        END as compatibility_score,
        -- Intereses compartidos
        COALESCE(user_interests & p.interests, ARRAY[]::text[]) as shared_interests,
        -- Distancia aproximada (si tienen coordenadas)
        CASE 
            WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
                 AND user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
                ROUND(
                    6371 * acos(
                        cos(radians(user_lat)) * cos(radians(p.latitude)) * 
                        cos(radians(p.longitude) - radians(user_lng)) + 
                        sin(radians(user_lat)) * sin(radians(p.latitude))
                    )
                )::integer
            ELSE NULL
        END as distance_km
    FROM profiles p
    WHERE p.id != p_user_id
    -- No mostrar usuarios ya likeados
    AND NOT EXISTS (
        SELECT 1 FROM user_likes ul 
        WHERE ul.liker_id = p_user_id AND ul.liked_id = p.id
    )
    -- No mostrar usuarios que ya son matches
    AND NOT EXISTS (
        SELECT 1 FROM matches m 
        WHERE (m.user1_id = p_user_id AND m.user2_id = p.id)
           OR (m.user1_id = p.id AND m.user2_id = p_user_id)
    )
    -- Filtros básicos de compatibilidad
    AND (
        -- Verificar que el usuario actual esté en lo que busca el otro
        user_looking_for && p.interests
        OR
        -- Verificar que lo que busca el usuario actual coincida con el otro
        p.looking_for && user_interests
    )
    -- Filtro de distancia si está disponible
    AND (
        p_max_distance IS NULL 
        OR user_lat IS NULL 
        OR p.latitude IS NULL
        OR (
            6371 * acos(
                cos(radians(user_lat)) * cos(radians(p.latitude)) * 
                cos(radians(p.longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * sin(radians(p.latitude))
            ) <= p_max_distance
        )
    )
    -- Filtros de edad si están configurados
    AND (
        p.age_range_min IS NULL 
        OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) >= p.age_range_min
    )
    AND (
        p.age_range_max IS NULL 
        OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) <= p.age_range_max
    )
    ORDER BY compatibility_score DESC, distance_km ASC NULLS LAST
    LIMIT p_limit;
END;
$$;

-- 4. FUNCIÓN: create_match_if_mutual
CREATE OR REPLACE FUNCTION create_match_if_mutual(
    p_liker_id uuid,
    p_liked_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_mutual boolean;
    match_exists boolean;
    new_match_id uuid;
    chat_room_id uuid;
BEGIN
    -- Verificar si es match mutuo
    SELECT detect_mutual_match(p_liker_id, p_liked_id) INTO is_mutual;
    
    IF NOT is_mutual THEN
        RETURN false;
    END IF;
    
    -- Verificar si ya existe el match
    SELECT EXISTS (
        SELECT 1 FROM matches 
        WHERE (user1_id = p_liker_id AND user2_id = p_liked_id)
           OR (user1_id = p_liked_id AND user2_id = p_liker_id)
    ) INTO match_exists;
    
    IF match_exists THEN
        RETURN true;
    END IF;
    
    -- Crear sala de chat privada para el match
    INSERT INTO chat_rooms (name, type, created_by, is_active)
    VALUES (
        'Match Chat',
        'private',
        p_liker_id,
        true
    )
    RETURNING id INTO chat_room_id;
    
    -- Agregar ambos usuarios a la sala
    INSERT INTO chat_members (chat_room_id, user_id, role, joined_at)
    VALUES 
        (chat_room_id, p_liker_id, 'member', NOW()),
        (chat_room_id, p_liked_id, 'member', NOW());
    
    -- Crear el match
    INSERT INTO matches (user1_id, user2_id, chat_room_id, is_active)
    VALUES (
        LEAST(p_liker_id, p_liked_id),
        GREATEST(p_liker_id, p_liked_id),
        chat_room_id,
        true
    )
    RETURNING id INTO new_match_id;
    
    RETURN true;
END;
$$;

-- Comentarios sobre las funciones
COMMENT ON FUNCTION detect_mutual_match IS 'Detecta si dos usuarios tienen match mutuo';
COMMENT ON FUNCTION get_user_matches IS 'Obtiene los matches de un usuario con paginación';
COMMENT ON FUNCTION get_potential_matches IS 'Obtiene matches potenciales basados en compatibilidad';
COMMENT ON FUNCTION create_match_if_mutual IS 'Crea un match automáticamente si es mutuo';

-- Verificar que las funciones se crearon correctamente
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('detect_mutual_match', 'get_user_matches', 'get_potential_matches', 'create_match_if_mutual');
    
    RAISE NOTICE '✅ FUNCIONES CREADAS: %/4', func_count;
END $$;
