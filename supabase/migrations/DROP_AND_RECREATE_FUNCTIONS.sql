-- =====================================================
-- ELIMINAR Y RECREAR FUNCIONES CON TIPOS CORRECTOS
-- Resolver error: cannot change return type of existing function
-- =====================================================

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS get_user_matches(uuid);
DROP FUNCTION IF EXISTS get_potential_matches(uuid, integer, integer, integer, integer);
DROP FUNCTION IF EXISTS update_user_activity(uuid, boolean);

-- Recrear función get_user_matches
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

-- Recrear función get_potential_matches
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

-- Recrear función update_user_activity
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

SELECT 'Funciones recreadas exitosamente' as status;
