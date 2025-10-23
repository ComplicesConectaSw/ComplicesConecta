-- Crear tablas faltantes para AnalyticsPanel, UserManagementPanel, ChatWithLocation y EnhancedGallery
-- Ejecutar en Supabase via Docker

-- =====================================================
-- TABLA MEDIA (para EnhancedGallery)
-- =====================================================

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    caption TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_profile_photo BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para media
CREATE INDEX IF NOT EXISTS idx_media_owner_id ON media(owner_id);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON media(is_public);
CREATE INDEX IF NOT EXISTS idx_media_is_profile_photo ON media(is_profile_photo);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- RLS para media
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para media
DROP POLICY IF EXISTS media_own_data ON media;
CREATE POLICY media_own_data ON media
    FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS media_public_read ON media;
CREATE POLICY media_public_read ON media
    FOR SELECT USING (is_public = TRUE);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA CHAT_MESSAGES (para ChatWithLocation)
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_address TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_location ON chat_messages(location_latitude, location_longitude);

-- RLS para chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para chat_messages
DROP POLICY IF EXISTS chat_messages_own_conversations ON chat_messages;
CREATE POLICY chat_messages_own_conversations ON chat_messages
    FOR ALL USING (
        sender_id = auth.uid() OR 
        conversation_id IN (
            SELECT id FROM chat_rooms 
            WHERE created_by = auth.uid() OR 
            id IN (SELECT room_id FROM chat_members WHERE profile_id = auth.uid())
        )
    );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AGREGAR CAMPO IS_PREMIUM A PROFILES (para AnalyticsPanel y UserManagementPanel)
-- =====================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Índice para is_premium
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- =====================================================
-- TABLA SYSTEM_METRICS (para AnalyticsPanel)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) DEFAULT 'counter',
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);

-- RLS para system_metrics
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Política RLS para system_metrics (solo admins)
DROP POLICY IF EXISTS system_metrics_admin_only ON system_metrics;
CREATE POLICY system_metrics_admin_only ON system_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- TABLA USER_ACTIVITY (para AnalyticsPanel)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_activity
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- RLS para user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_activity
DROP POLICY IF EXISTS user_activity_own_data ON user_activity;
CREATE POLICY user_activity_own_data ON user_activity
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_activity_admin_read ON user_activity;
CREATE POLICY user_activity_admin_read ON user_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- TABLA USER_REPORTS (para UserManagementPanel)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    report_reason TEXT NOT NULL,
    report_details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_reports
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_type ON user_reports(report_type);

-- RLS para user_reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_reports
DROP POLICY IF EXISTS user_reports_own_reports ON user_reports;
CREATE POLICY user_reports_own_reports ON user_reports
    FOR ALL USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS user_reports_admin_access ON user_reports;
CREATE POLICY user_reports_admin_access ON user_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_reports_updated_at ON user_reports;
CREATE TRIGGER update_user_reports_updated_at
    BEFORE UPDATE ON user_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener métricas de usuarios
CREATE OR REPLACE FUNCTION get_user_metrics()
RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    premium_users BIGINT,
    verified_users BIGINT,
    new_users_today BIGINT,
    new_users_week BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM profiles) as total_users,
        (SELECT COUNT(*) FROM profiles WHERE last_active > NOW() - INTERVAL '24 hours') as active_users,
        (SELECT COUNT(*) FROM profiles WHERE is_premium = TRUE) as premium_users,
        (SELECT COUNT(*) FROM profiles WHERE is_verified = TRUE) as verified_users,
        (SELECT COUNT(*) FROM profiles WHERE created_at > CURRENT_DATE) as new_users_today,
        (SELECT COUNT(*) FROM profiles WHERE created_at > CURRENT_DATE - INTERVAL '7 days') as new_users_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener actividad de usuarios
CREATE OR REPLACE FUNCTION get_user_activity_stats(days INTEGER DEFAULT 7)
RETURNS TABLE (
    date DATE,
    total_activities BIGINT,
    unique_users BIGINT,
    activity_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ua.created_at) as date,
        COUNT(*) as total_activities,
        COUNT(DISTINCT ua.user_id) as unique_users,
        jsonb_object_agg(ua.activity_type, activity_count) as activity_types
    FROM user_activity ua
    LEFT JOIN (
        SELECT 
            DATE(created_at) as activity_date,
            activity_type,
            COUNT(*) as activity_count
        FROM user_activity
        WHERE created_at > CURRENT_DATE - INTERVAL '1 day' * days
        GROUP BY DATE(created_at), activity_type
    ) counts ON DATE(ua.created_at) = counts.activity_date AND ua.activity_type = counts.activity_type
    WHERE ua.created_at > CURRENT_DATE - INTERVAL '1 day' * days
    GROUP BY DATE(ua.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar métricas del sistema
INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags) VALUES
('total_users', 1250, 'gauge', '{"source": "profiles"}'),
('active_users', 375, 'gauge', '{"source": "profiles", "period": "24h"}'),
('premium_users', 89, 'gauge', '{"source": "profiles"}'),
('verified_users', 234, 'gauge', '{"source": "profiles"}'),
('new_users_today', 12, 'counter', '{"source": "profiles", "period": "1d"}'),
('new_users_week', 89, 'counter', '{"source": "profiles", "period": "7d"}')
ON CONFLICT DO NOTHING;

-- Insertar actividad de ejemplo
INSERT INTO user_activity (user_id, activity_type, activity_data, ip_address, user_agent) VALUES
('demo-single-1', 'profile_view', '{"viewed_profile": "demo-single-2"}', '192.168.1.1', 'Mozilla/5.0'),
('demo-single-2', 'message_sent', '{"conversation_id": "conv-1"}', '192.168.1.2', 'Mozilla/5.0'),
('demo-single-3', 'like_given', '{"liked_profile": "demo-single-1"}', '192.168.1.3', 'Mozilla/5.0'),
('demo-single-4', 'profile_updated', '{"updated_fields": ["bio", "interests"]}', '192.168.1.4', 'Mozilla/5.0'),
('demo-single-5', 'match_created', '{"matched_with": "demo-single-6"}', '192.168.1.5', 'Mozilla/5.0')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE media IS 'Tabla para almacenar metadatos de archivos multimedia (imágenes, videos)';
COMMENT ON TABLE chat_messages IS 'Tabla para mensajes de chat con soporte para ubicación';
COMMENT ON TABLE system_metrics IS 'Tabla para métricas del sistema y analytics';
COMMENT ON TABLE user_activity IS 'Tabla para registrar actividad de usuarios';
COMMENT ON TABLE user_reports IS 'Tabla para reportes de usuarios';

COMMENT ON COLUMN media.owner_id IS 'ID del usuario propietario del archivo';
COMMENT ON COLUMN media.storage_path IS 'Ruta del archivo en el storage';
COMMENT ON COLUMN media.is_public IS 'Si el archivo es público o privado';
COMMENT ON COLUMN media.is_profile_photo IS 'Si es la foto de perfil del usuario';

COMMENT ON COLUMN chat_messages.conversation_id IS 'ID de la conversación';
COMMENT ON COLUMN chat_messages.sender_id IS 'ID del usuario que envía el mensaje';
COMMENT ON COLUMN chat_messages.location_latitude IS 'Latitud de la ubicación compartida';
COMMENT ON COLUMN chat_messages.location_longitude IS 'Longitud de la ubicación compartida';

COMMENT ON COLUMN system_metrics.metric_name IS 'Nombre de la métrica';
COMMENT ON COLUMN system_metrics.metric_value IS 'Valor de la métrica';
COMMENT ON COLUMN system_metrics.metric_type IS 'Tipo de métrica (counter, gauge, histogram)';

COMMENT ON COLUMN user_activity.user_id IS 'ID del usuario que realizó la actividad';
COMMENT ON COLUMN user_activity.activity_type IS 'Tipo de actividad realizada';
COMMENT ON COLUMN user_activity.activity_data IS 'Datos adicionales de la actividad en JSON';

COMMENT ON COLUMN user_reports.reporter_id IS 'ID del usuario que reporta';
COMMENT ON COLUMN user_reports.reported_user_id IS 'ID del usuario reportado';
COMMENT ON COLUMN user_reports.report_type IS 'Tipo de reporte';
COMMENT ON COLUMN user_reports.status IS 'Estado del reporte (pending, reviewed, resolved)';
