-- Script de índices de rendimiento para ComplicesConecta
-- Fecha: 2025-09-25
-- Descripción: Configuración de índices optimizados para consultas frecuentes

-- Índices para tabla profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Índices para tabla messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- Índices para tabla invitations
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_receiver_id ON invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);

-- Índices para tabla profile_cache (ya existían)
CREATE INDEX IF NOT EXISTS idx_profile_cache_profile_id ON profile_cache(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_cache_expires_at ON profile_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_profile_cache_key ON profile_cache(cache_key);

-- Índices para tabla staking (ya existían)
CREATE INDEX IF NOT EXISTS idx_staking_user_id ON staking(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_status ON staking(status);
CREATE INDEX IF NOT EXISTS idx_staking_created_at ON staking(created_at);

-- Índices para tabla tokens (ya existían)
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_type ON tokens(token_type);
CREATE INDEX IF NOT EXISTS idx_tokens_earned_at ON tokens(earned_at);

-- Índices para tabla sessions (ya existían)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

-- Índices para tabla content_moderation (ya existían)
CREATE INDEX IF NOT EXISTS idx_content_moderation_content ON content_moderation(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON content_moderation(status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_reported_by ON content_moderation(reported_by);

-- Índices para tabla reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Índices para tabla audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices para tabla security (ya existían)
CREATE INDEX IF NOT EXISTS idx_security_user_id ON security(user_id);
CREATE INDEX IF NOT EXISTS idx_security_event_type ON security(event_type);
CREATE INDEX IF NOT EXISTS idx_security_risk_level ON security(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_created_at ON security(created_at);

-- Índices compuestos para consultas complejas
CREATE INDEX IF NOT EXISTS idx_messages_unread_by_receiver ON messages(receiver_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_invitations_pending_by_receiver ON invitations(receiver_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_active_by_role ON profiles(role, is_active, created_at);

-- Estadísticas para el optimizador
ANALYZE profiles;
ANALYZE messages;
ANALYZE invitations;
ANALYZE roles;
ANALYZE profile_cache;
ANALYZE staking;
ANALYZE tokens;
ANALYZE sessions;
ANALYZE content_moderation;
ANALYZE reports;
ANALYZE audit_logs;
ANALYZE security;
