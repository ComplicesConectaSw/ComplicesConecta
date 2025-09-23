-- ============================================================================
-- SCRIPT PARA CREAR TABLAS FALTANTES EN SUPABASE
-- Fecha: 23 de Septiembre 2025
-- Propósito: Resolver errores de tipos TypeScript en el código
-- =============================================
-- SCRIPT COMPLETO PARA CREAR TABLAS FALTANTES
-- ComplicesConecta - Supabase Database
-- Actualizado con todas las tablas necesarias
-- =============================================

-- 1. TABLA: chat_messages
-- Mensajes de chat en tiempo real
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA MEDIA_ACCESS_LOGS
-- Para registrar accesos a contenido multimedia seguro
CREATE TABLE IF NOT EXISTS media_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    media_id UUID, -- referencia genérica a imágenes/videos
    access_type TEXT NOT NULL, -- view, download, share
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA NOTIFICATION_PREFERENCES
-- Para preferencias de notificaciones de usuarios
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- match, message, like, system
    enabled BOOLEAN DEFAULT true,
    delivery_method TEXT DEFAULT 'push', -- push, email, sms
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- 4. TABLA REFERRAL_REWARDS
-- Para sistema de recompensas por referidos
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    reward_type TEXT NOT NULL, -- signup_bonus, referral_bonus, world_id_bonus
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO
-- ============================================================================

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Índices para media_access_logs
CREATE INDEX IF NOT EXISTS idx_media_access_logs_user_id ON media_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_media_id ON media_access_logs(media_id);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_accessed_at ON media_access_logs(accessed_at DESC);

-- Índices para notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Índices para referral_rewards
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_code ON referral_rewards(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_claimed ON referral_rewards(claimed);

-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD RLS
-- ============================================================================

-- Políticas para chat_messages (usando DROP IF EXISTS para evitar duplicados)
DROP POLICY IF EXISTS "Los usuarios pueden ver mensajes de sus salas" ON chat_messages;
CREATE POLICY "Los usuarios pueden ver mensajes de sus salas" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members 
            WHERE chat_members.room_id = chat_messages.room_id 
            AND chat_members.profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Los usuarios pueden enviar mensajes a sus salas" ON chat_messages;
CREATE POLICY "Los usuarios pueden enviar mensajes a sus salas" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_members 
            WHERE chat_members.room_id = chat_messages.room_id 
            AND chat_members.profile_id = auth.uid()
        )
    );

-- Políticas para media_access_logs
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios logs de acceso" ON media_access_logs;
CREATE POLICY "Los usuarios pueden ver sus propios logs de acceso" ON media_access_logs
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Los usuarios pueden crear logs de acceso" ON media_access_logs;
CREATE POLICY "Los usuarios pueden crear logs de acceso" ON media_access_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para notification_preferences
DROP POLICY IF EXISTS "Los usuarios pueden gestionar sus preferencias" ON notification_preferences;
CREATE POLICY "Los usuarios pueden gestionar sus preferencias" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Políticas para referral_rewards
DROP POLICY IF EXISTS "Los usuarios pueden ver sus recompensas" ON referral_rewards;
CREATE POLICY "Los usuarios pueden ver sus recompensas" ON referral_rewards
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Sistema puede crear recompensas" ON referral_rewards;
CREATE POLICY "Sistema puede crear recompensas" ON referral_rewards
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Los usuarios pueden reclamar sus recompensas" ON referral_rewards;
CREATE POLICY "Los usuarios pueden reclamar sus recompensas" ON referral_rewards
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente (usando DROP IF EXISTS para evitar duplicados)
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCIONES PARA NOTIFICACIONES Y MATCHING
-- ============================================================================

-- Función para crear notificaciones
CREATE OR REPLACE FUNCTION create_notification(
    notification_type TEXT,
    title TEXT,
    body TEXT,
    user_id UUID,
    data JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    INSERT INTO notification_history (
        notification_type,
        title,
        body,
        user_id,
        data,
        delivery_method,
        status
    ) VALUES (
        notification_type,
        title,
        body,
        user_id,
        data,
        'push',
        'pending'
    );
    
    result := jsonb_build_object(
        'success', true,
        'message', 'Notificación creada exitosamente'
    );
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener matches del usuario
CREATE OR REPLACE FUNCTION get_user_matches(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'user1_id', m.user1_id,
            'user2_id', m.user2_id,
            'compatibility_score', m.compatibility_score,
            'status', m.status,
            'created_at', m.created_at
        )
    ) INTO result
    FROM matches m
    WHERE (m.user1_id = user_id_param OR m.user2_id = user_id_param)
    AND m.status = 'active';
    
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener matches potenciales
CREATE OR REPLACE FUNCTION get_potential_matches(
    user_id_param UUID,
    limit_param INTEGER DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'age', p.age,
            'bio', p.bio,
            'avatar_url', p.avatar_url,
            'interests', p.interests,
            'compatibility_score', RANDOM() * 100 -- Simulado por ahora
        )
    ) INTO result
    FROM profiles p
    WHERE p.id != user_id_param
    AND p.is_active = true
    AND p.is_blocked = false
    AND NOT EXISTS (
        SELECT 1 FROM matches m 
        WHERE (m.user1_id = user_id_param AND m.user2_id = p.id)
        OR (m.user1_id = p.id AND m.user2_id = user_id_param)
    )
    LIMIT limit_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATOS INICIALES PARA TESTING
-- ============================================================================

-- Insertar preferencias de notificación por defecto para usuarios existentes
INSERT INTO notification_preferences (user_id, notification_type, enabled, delivery_method)
SELECT DISTINCT p.id, 'match', true, 'push'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = p.id AND np.notification_type = 'match'
);

INSERT INTO notification_preferences (user_id, notification_type, enabled, delivery_method)
SELECT DISTINCT p.id, 'message', true, 'push'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = p.id AND np.notification_type = 'message'
);

-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================

-- Este script crea todas las tablas faltantes identificadas en los errores TypeScript:
-- 1. chat_messages - Para mensajes de chat con ubicación
-- 2. media_access_logs - Para logs de acceso a multimedia
-- 3. notification_preferences - Para preferencias de notificaciones
-- 4. referral_rewards - Para sistema de recompensas por referidos
--
-- También incluye:
-- - Índices optimizados para rendimiento
-- - Políticas RLS para seguridad
-- - Funciones auxiliares para notificaciones y matching
-- - Datos iniciales para testing
--
-- INSTRUCCIONES:
-- 1. Copia este script completo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el script y ejecuta
-- 4. Verifica que todas las tablas se crearon correctamente
-- 5. Ejecuta los tests para confirmar que los errores se resolvieron
