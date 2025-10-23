-- Crear tablas faltantes para el sistema de matching
-- Ejecutar en Supabase via Docker

-- Tabla para likes de usuarios
CREATE TABLE IF NOT EXISTS user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(liker_id, liked_id)
);

-- Tabla para matches
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    compatibility_score INTEGER DEFAULT 0,
    shared_interests TEXT[],
    match_reasons TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user1_id, user2_id)
);

-- Tabla para interacciones de matches
CREATE TABLE IF NOT EXISTS match_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('message', 'like', 'view', 'block', 'report')),
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_likes_liker_id ON user_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_liked_id ON user_likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_active ON user_likes(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON matches(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility ON matches(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_match_interactions_match_id ON match_interactions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_user_id ON match_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_type ON match_interactions(interaction_type);

-- Políticas RLS
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_likes
CREATE POLICY "Users can view their own likes" ON user_likes
    FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can create their own likes" ON user_likes
    FOR INSERT WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can update their own likes" ON user_likes
    FOR UPDATE USING (auth.uid() = liker_id);

CREATE POLICY "Users can delete their own likes" ON user_likes
    FOR DELETE USING (auth.uid() = liker_id);

-- Políticas para matches
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" ON matches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own matches" ON matches
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para match_interactions
CREATE POLICY "Users can view interactions in their matches" ON match_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = match_interactions.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can create interactions in their matches" ON match_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = match_interactions.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own interactions" ON match_interactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Función para crear match automáticamente cuando hay like mutuo
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si existe un like mutuo
    IF EXISTS (
        SELECT 1 FROM user_likes 
        WHERE liker_id = NEW.liked_id 
        AND liked_id = NEW.liker_id 
        AND is_active = TRUE
    ) THEN
        -- Crear el match
        INSERT INTO matches (user1_id, user2_id, compatibility_score, shared_interests, match_reasons)
        VALUES (
            NEW.liker_id, 
            NEW.liked_id, 
            85, -- Score por defecto
            ARRAY[]::TEXT[], -- Intereses compartidos vacíos por ahora
            ARRAY['Like mutuo']::TEXT[] -- Razón por defecto
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear matches automáticamente
DROP TRIGGER IF EXISTS trigger_create_match_on_mutual_like ON user_likes;
CREATE TRIGGER trigger_create_match_on_mutual_like
    AFTER INSERT ON user_likes
    FOR EACH ROW
    EXECUTE FUNCTION create_match_on_mutual_like();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_user_likes_updated_at ON user_likes;
CREATE TRIGGER update_user_likes_updated_at
    BEFORE UPDATE ON user_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_interactions_updated_at ON match_interactions;
CREATE TRIGGER update_match_interactions_updated_at
    BEFORE UPDATE ON match_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función RPC para obtener matches del usuario
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
            WHEN m.user1_id = user_id THEN m.user2_id
            ELSE m.user1_id
        END as other_user_id,
        CASE 
            WHEN m.user1_id = user_id THEN COALESCE(p2.first_name || ' ' || p2.last_name, 'Usuario')
            ELSE COALESCE(p1.first_name || ' ' || p1.last_name, 'Usuario')
        END as other_user_name,
        CASE 
            WHEN m.user1_id = user_id THEN p2.avatar_url
            ELSE p1.avatar_url
        END as other_user_avatar,
        m.compatibility_score,
        m.shared_interests,
        m.match_reasons,
        m.last_interaction,
        COALESCE(
            (SELECT COUNT(*)::INTEGER 
             FROM match_interactions mi 
             WHERE mi.match_id = m.id 
             AND mi.user_id != user_id 
             AND mi.interaction_type = 'message'
             AND mi.created_at > COALESCE(
                 (SELECT MAX(created_at) 
                  FROM match_interactions mi2 
                  WHERE mi2.match_id = m.id 
                  AND mi2.user_id = user_id 
                  AND mi2.interaction_type = 'view'), 
                 m.created_at
             )), 
            0
        ) as unread_messages
    FROM matches m
    LEFT JOIN profiles p1 ON m.user1_id = p1.id
    LEFT JOIN profiles p2 ON m.user2_id = p2.id
    WHERE (m.user1_id = user_id OR m.user2_id = user_id)
    AND m.is_active = TRUE
    ORDER BY m.last_interaction DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función RPC para obtener perfiles potenciales
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
    is_online BOOLEAN,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as profile_id,
        p.first_name,
        p.last_name,
        COALESCE(p.display_name, p.first_name || ' ' || p.last_name) as display_name,
        p.age,
        p.interests,
        p.avatar_url,
        COALESCE(p.is_online, FALSE) as is_online,
        COALESCE(p.last_active, p.created_at) as last_active
    FROM profiles p
    WHERE p.id != user_id
    AND p.age BETWEEN min_age AND max_age
    AND NOT EXISTS (
        SELECT 1 FROM user_likes ul 
        WHERE ul.liker_id = user_id 
        AND ul.liked_id = p.id 
        AND ul.is_active = TRUE
    )
    AND NOT EXISTS (
        SELECT 1 FROM matches m 
        WHERE (m.user1_id = user_id AND m.user2_id = p.id)
        OR (m.user1_id = p.id AND m.user2_id = user_id)
    )
    ORDER BY RANDOM()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función RPC para actualizar actividad del usuario
CREATE OR REPLACE FUNCTION update_user_activity(
    user_id UUID,
    is_online BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET 
        is_online = is_online,
        last_active = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar datos de ejemplo
INSERT INTO user_likes (liker_id, liked_id, is_active) VALUES
    ('demo-single-1', 'demo-single-2', TRUE),
    ('demo-single-2', 'demo-single-1', TRUE)
ON CONFLICT (liker_id, liked_id) DO NOTHING;

-- Comentarios para documentar las tablas
COMMENT ON TABLE user_likes IS 'Tabla para gestionar likes entre usuarios';
COMMENT ON TABLE matches IS 'Tabla para gestionar matches entre usuarios';
COMMENT ON TABLE match_interactions IS 'Tabla para gestionar interacciones dentro de matches (mensajes, vistas, etc.)';
COMMENT ON COLUMN user_likes.liker_id IS 'ID del usuario que da el like';
COMMENT ON COLUMN user_likes.liked_id IS 'ID del usuario que recibe el like';
COMMENT ON COLUMN matches.compatibility_score IS 'Puntuación de compatibilidad entre usuarios (0-100)';
COMMENT ON COLUMN matches.shared_interests IS 'Array de intereses compartidos entre usuarios';
COMMENT ON COLUMN matches.match_reasons IS 'Array de razones por las que se hizo match';
COMMENT ON COLUMN match_interactions.interaction_type IS 'Tipo de interacción: message, like, view, block, report';
COMMENT ON COLUMN match_interactions.content IS 'Contenido del mensaje (si aplica)';
COMMENT ON COLUMN match_interactions.metadata IS 'Metadatos adicionales en formato JSON';
