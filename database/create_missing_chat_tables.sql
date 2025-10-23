-- Crear tablas faltantes para el sistema de chat y funcionalidades avanzadas
-- Ejecutar en Supabase via Docker

-- Tabla de matches
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    compatibility_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'moderator', 'user', 'premium')),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Tabla de logs de acceso a media
CREATE TABLE IF NOT EXISTS media_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    media_path TEXT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'download', 'denied')),
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de salas de chat
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'private' CHECK (type IN ('public', 'private', 'group')),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros de chat
CREATE TABLE IF NOT EXISTS chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, profile_id)
);

-- Tabla de invitaciones de chat
CREATE TABLE IF NOT EXISTS chat_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    from_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, to_profile)
);

-- Vista para perfiles de pareja con información de socios
CREATE OR REPLACE VIEW couple_profiles_with_partners AS
SELECT 
    cp.id,
    cp.couple_name,
    cp.couple_bio,
    cp.relationship_type,
    cp.partner1_id,
    cp.partner2_id,
    cp.couple_images,
    cp.is_verified,
    cp.is_premium,
    cp.preferences,
    cp.created_at,
    cp.updated_at,
    p1.first_name as partner1_first_name,
    p1.last_name as partner1_last_name,
    p1.age as partner1_age,
    p1.gender as partner1_gender,
    p2.first_name as partner2_first_name,
    p2.last_name as partner2_last_name,
    p2.age as partner2_age,
    p2.gender as partner2_gender
FROM couple_profiles cp
LEFT JOIN profiles p1 ON cp.partner1_id = p1.id
LEFT JOIN profiles p2 ON cp.partner2_id = p2.id;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_user_id ON media_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_members_room_id ON chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_profile_id ON chat_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_invitations_room_id ON chat_invitations(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_invitations_to_profile ON chat_invitations(to_profile);

-- Políticas RLS básicas
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para matches
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (user1_id = auth.uid());

CREATE POLICY "Users can update their matches" ON matches
    FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Políticas para mensajes
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin' 
            AND ur.is_active = true
        )
    );

-- Políticas para media_access_logs
CREATE POLICY "Users can view their own access logs" ON media_access_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can log access" ON media_access_logs
    FOR INSERT WITH CHECK (true);

-- Políticas para chat_rooms
CREATE POLICY "Users can view rooms they're members of" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.room_id = chat_rooms.id 
            AND cm.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rooms" ON chat_rooms
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can update rooms" ON chat_rooms
    FOR UPDATE USING (created_by = auth.uid());

-- Políticas para chat_members
CREATE POLICY "Users can view members of their rooms" ON chat_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.room_id = chat_members.room_id 
            AND cm.profile_id = auth.uid()
        )
    );

CREATE POLICY "Room admins can manage members" ON chat_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.room_id = chat_members.room_id 
            AND cm.profile_id = auth.uid() 
            AND cm.role IN ('admin', 'moderator')
        )
    );

-- Políticas para chat_invitations
CREATE POLICY "Users can view invitations sent to them" ON chat_invitations
    FOR SELECT USING (to_profile = auth.uid());

CREATE POLICY "Users can send invitations" ON chat_invitations
    FOR INSERT WITH CHECK (from_profile = auth.uid());

CREATE POLICY "Users can respond to their invitations" ON chat_invitations
    FOR UPDATE USING (to_profile = auth.uid());

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_invitations_updated_at BEFORE UPDATE ON chat_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
