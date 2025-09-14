-- =====================================================
-- REALTIME CHAT SYSTEM - SUPABASE TABLES
-- Fecha: 14/09/2025 08:32hrs
-- Versión: v2.7.1 - Sistema de Chat en Tiempo Real
-- =====================================================

-- 1. Tabla de salas de chat
DROP TABLE IF EXISTS chat_rooms CASCADE;
CREATE TABLE chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50) DEFAULT 'private' CHECK (type IN ('private', 'group', 'public')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Tabla de mensajes de chat
DROP TABLE IF EXISTS chat_messages CASCADE;
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Tabla de participantes de chat
DROP TABLE IF EXISTS chat_participants CASCADE;
CREATE TABLE chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    is_active BOOLEAN DEFAULT true,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- 4. Tabla de typing indicators
DROP TABLE IF EXISTS chat_typing CASCADE;
CREATE TABLE chat_typing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 seconds'),
    UNIQUE(room_id, user_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para chat_rooms
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated_at ON chat_rooms(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_active ON chat_messages(room_id) WHERE is_deleted = false;

-- Índices para chat_participants
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(room_id, user_id) WHERE is_active = true;

-- Índices para chat_typing
CREATE INDEX IF NOT EXISTS idx_chat_typing_room_id ON chat_typing(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_expires_at ON chat_typing(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_rooms
CREATE POLICY "Users can view rooms they participate in" ON chat_rooms
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_rooms.id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can create rooms" ON chat_rooms
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators and admins can update rooms" ON chat_rooms
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_rooms.id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
            AND is_active = true
        )
    );

-- Políticas para chat_messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_messages.room_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can send messages to their rooms" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_messages.room_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can edit their own messages" ON chat_messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON chat_messages
    FOR DELETE USING (sender_id = auth.uid());

-- Políticas para chat_participants
CREATE POLICY "Users can view participants in their rooms" ON chat_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_participants cp2 
            WHERE cp2.room_id = chat_participants.room_id 
            AND cp2.user_id = auth.uid() 
            AND cp2.is_active = true
        )
    );

CREATE POLICY "Room admins can manage participants" ON chat_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_participants.room_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
            AND is_active = true
        )
    );

-- Políticas para chat_typing
CREATE POLICY "Users can manage their own typing indicators" ON chat_typing
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view typing in their rooms" ON chat_typing
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_typing.room_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_chat_rooms_updated_at 
    BEFORE UPDATE ON chat_rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar typing indicators expirados
CREATE OR REPLACE FUNCTION cleanup_expired_typing()
RETURNS void AS $$
BEGIN
    DELETE FROM chat_typing WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar last_message_at en chat_rooms
CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_message_at
CREATE TRIGGER update_room_last_message_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_room_last_message();

-- =====================================================
-- FUNCIONES HELPER PARA LA APLICACIÓN
-- =====================================================

-- Función para crear una sala de chat privada entre dos usuarios
CREATE OR REPLACE FUNCTION create_private_chat_room(
    user1_id UUID,
    user2_id UUID
)
RETURNS UUID AS $$
DECLARE
    room_id UUID;
    existing_room_id UUID;
BEGIN
    -- Verificar si ya existe una sala entre estos usuarios
    SELECT cr.id INTO existing_room_id
    FROM chat_rooms cr
    JOIN chat_participants cp1 ON cp1.room_id = cr.id AND cp1.user_id = user1_id
    JOIN chat_participants cp2 ON cp2.room_id = cr.id AND cp2.user_id = user2_id
    WHERE cr.type = 'private'
    AND cr.is_active = true
    AND cp1.is_active = true
    AND cp2.is_active = true
    AND (SELECT COUNT(*) FROM chat_participants WHERE room_id = cr.id AND is_active = true) = 2;
    
    IF existing_room_id IS NOT NULL THEN
        RETURN existing_room_id;
    END IF;
    
    -- Crear nueva sala
    INSERT INTO chat_rooms (type, created_by)
    VALUES ('private', user1_id)
    RETURNING id INTO room_id;
    
    -- Agregar participantes
    INSERT INTO chat_participants (room_id, user_id, role)
    VALUES 
        (room_id, user1_id, 'admin'),
        (room_id, user2_id, 'member');
    
    RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener salas de un usuario
CREATE OR REPLACE FUNCTION get_user_chat_rooms(user_id UUID)
RETURNS TABLE (
    room_id UUID,
    room_name VARCHAR,
    room_type VARCHAR,
    participant_count BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.name,
        cr.type,
        (SELECT COUNT(*) FROM chat_participants WHERE room_id = cr.id AND is_active = true) as participant_count,
        cr.last_message_at,
        COALESCE(
            (SELECT COUNT(*) 
             FROM chat_messages cm 
             WHERE cm.room_id = cr.id 
             AND cm.created_at > cp.last_read_at
             AND cm.sender_id != user_id
             AND cm.is_deleted = false), 
            0
        ) as unread_count
    FROM chat_rooms cr
    JOIN chat_participants cp ON cp.room_id = cr.id
    WHERE cp.user_id = get_user_chat_rooms.user_id
    AND cp.is_active = true
    AND cr.is_active = true
    ORDER BY cr.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE chat_rooms IS 'Salas de chat para mensajería en tiempo real';
COMMENT ON TABLE chat_messages IS 'Mensajes de chat con soporte para diferentes tipos';
COMMENT ON TABLE chat_participants IS 'Participantes de salas de chat con roles y estado';
COMMENT ON TABLE chat_typing IS 'Indicadores de escritura en tiempo real';

COMMENT ON FUNCTION create_private_chat_room IS 'Crea o retorna sala de chat privada entre dos usuarios';
COMMENT ON FUNCTION get_user_chat_rooms IS 'Obtiene todas las salas de chat de un usuario con conteo de no leídos';
COMMENT ON FUNCTION cleanup_expired_typing IS 'Limpia indicadores de escritura expirados';

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL - SOLO PARA DESARROLLO)
-- =====================================================

-- Insertar datos de prueba solo si estamos en desarrollo
DO $$
BEGIN
    IF current_setting('app.environment', true) = 'development' THEN
        -- Crear sala de prueba
        INSERT INTO chat_rooms (id, name, type, created_by)
        VALUES (
            '550e8400-e29b-41d4-a716-446655440000',
            'Chat de Prueba',
            'private',
            '550e8400-e29b-41d4-a716-446655440001'
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Agregar participantes de prueba
        INSERT INTO chat_participants (room_id, user_id, role)
        VALUES 
            ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
            ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'member')
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Datos de prueba insertados para desarrollo';
    END IF;
END $$;
