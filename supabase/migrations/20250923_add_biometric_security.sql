/* Migración para funcionalidades de seguridad biométrica y multimedia
   Añade columnas necesarias para el sistema de seguridad avanzada */

-- Añadir columna biometric_enabled a la tabla profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'biometric_enabled') THEN
        ALTER TABLE profiles ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Añadir columnas de configuración de privacidad para media
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'privacy_settings') THEN
        ALTER TABLE profiles ADD COLUMN privacy_settings JSONB DEFAULT '{"media_public": true, "allow_downloads": false}'::jsonb;
    END IF;
END $$;

-- Crear tabla para logs de acceso a media
CREATE TABLE IF NOT EXISTS media_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_path TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'denied')),
    reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_media_access_logs_user_id ON media_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_created_at ON media_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_media_access_logs_action ON media_access_logs(action);

-- Habilitar RLS en la tabla de logs
ALTER TABLE media_access_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver sus propios logs
CREATE POLICY "media_access_logs_select_own" ON media_access_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Política RLS: Solo el sistema puede insertar logs
CREATE POLICY "media_access_logs_insert_system" ON media_access_logs
    FOR INSERT WITH CHECK (true);

-- Política RLS: Los administradores pueden ver todos los logs
CREATE POLICY "media_access_logs_select_admin" ON media_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

-- Crear tabla para configuración de seguridad biométrica
CREATE TABLE IF NOT EXISTS biometric_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    device_id TEXT,
    biometric_type TEXT CHECK (biometric_type IN ('fingerprint', 'face', 'voice')),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para sesiones biométricas
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_user_id ON biometric_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_session_id ON biometric_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_biometric_sessions_expires_at ON biometric_sessions(expires_at);

-- Habilitar RLS en sesiones biométricas
ALTER TABLE biometric_sessions ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "biometric_sessions_select_own" ON biometric_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Política RLS: Los usuarios pueden insertar sus propias sesiones
CREATE POLICY "biometric_sessions_insert_own" ON biometric_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política RLS: Los usuarios pueden actualizar sus propias sesiones
CREATE POLICY "biometric_sessions_update_own" ON biometric_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Política RLS: Los usuarios pueden eliminar sus propias sesiones
CREATE POLICY "biometric_sessions_delete_own" ON biometric_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Función para limpiar sesiones biométricas expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_biometric_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM biometric_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para validar configuración de privacidad
CREATE OR REPLACE FUNCTION validate_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que privacy_settings tenga estructura correcta
    IF NEW.privacy_settings IS NOT NULL THEN
        -- Asegurar que tenga las claves necesarias
        IF NOT (NEW.privacy_settings ? 'media_public') THEN
            NEW.privacy_settings = NEW.privacy_settings || '{"media_public": true}'::jsonb;
        END IF;
        
        IF NOT (NEW.privacy_settings ? 'allow_downloads') THEN
            NEW.privacy_settings = NEW.privacy_settings || '{"allow_downloads": false}'::jsonb;
        END IF;
    ELSE
        NEW.privacy_settings = '{"media_public": true, "allow_downloads": false}'::jsonb;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar privacy_settings
CREATE TRIGGER validate_privacy_settings_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_privacy_settings();

-- Función para obtener configuración de seguridad del usuario
CREATE OR REPLACE FUNCTION get_user_security_config(user_uuid UUID)
RETURNS TABLE (
    biometric_enabled BOOLEAN,
    privacy_settings JSONB,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.biometric_enabled,
        p.privacy_settings,
        COALESCE(ur.role, 'user') as role
    FROM profiles p
    LEFT JOIN user_roles ur ON ur.user_id = p.id
    WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar acceso a media
CREATE OR REPLACE FUNCTION log_media_access(
    p_user_id UUID,
    p_media_path TEXT,
    p_action TEXT,
    p_reason TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO media_access_logs (
        user_id, 
        media_path, 
        action, 
        reason, 
        ip_address, 
        user_agent
    ) VALUES (
        p_user_id, 
        p_media_path, 
        p_action, 
        p_reason, 
        p_ip_address, 
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE media_access_logs IS 'Registro de accesos a contenido multimedia para auditoría de seguridad';
COMMENT ON TABLE biometric_sessions IS 'Sesiones de autenticación biométrica activas';
COMMENT ON COLUMN profiles.biometric_enabled IS 'Indica si el usuario tiene habilitada la autenticación biométrica';
COMMENT ON COLUMN profiles.privacy_settings IS 'Configuración de privacidad del usuario en formato JSON';
COMMENT ON FUNCTION get_user_security_config IS 'Obtiene la configuración de seguridad completa de un usuario';
COMMENT ON FUNCTION log_media_access IS 'Registra un acceso a contenido multimedia para auditoría';
COMMENT ON FUNCTION cleanup_expired_biometric_sessions IS 'Limpia sesiones biométricas expiradas o inactivas';
