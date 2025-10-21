-- =====================================================
-- SECURITY SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the SecurityService
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SECURITY AUDIT LOGS TABLE
-- =====================================================
-- Table for storing security audit logs
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_score ON security_audit_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip_address ON security_audit_logs(ip_address);

-- =====================================================
-- 2. TWO FACTOR AUTHENTICATION TABLE
-- =====================================================
-- Table for storing 2FA configurations
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('2fa_app', 'sms', 'email')),
    secret VARCHAR(255),
    backup_codes TEXT[],
    is_enabled BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one 2FA record per user per method
    UNIQUE(user_id, method)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_method ON two_factor_auth(method);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_is_enabled ON two_factor_auth(is_enabled);

-- =====================================================
-- 3. SECURITY FLAGS TABLE
-- =====================================================
-- Table for storing security flags and alerts
CREATE TABLE IF NOT EXISTS security_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flag_type VARCHAR(50) NOT NULL CHECK (flag_type IN ('suspicious_login', 'multiple_devices', 'unusual_activity', 'fraud_pattern', 'account_compromise')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    metadata JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_flags_user_id ON security_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_security_flags_flag_type ON security_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_security_flags_severity ON security_flags(severity);
CREATE INDEX IF NOT EXISTS idx_security_flags_is_resolved ON security_flags(is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_flags_created_at ON security_flags(created_at DESC);

-- =====================================================
-- 4. FRAUD ANALYSIS TABLE
-- =====================================================
-- Table for storing fraud analysis results
CREATE TABLE IF NOT EXISTS fraud_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID,
    is_fraudulent BOOLEAN NOT NULL,
    confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    patterns TEXT[],
    risk_factors TEXT[],
    analysis_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_user_id ON fraud_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_is_fraudulent ON fraud_analysis(is_fraudulent);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_confidence ON fraud_analysis(confidence);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_created_at ON fraud_analysis(created_at DESC);

-- =====================================================
-- 5. USER SESSIONS TABLE
-- =====================================================
-- Table for tracking user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Security Audit Logs - Users can only see their own logs, admins can see all
CREATE POLICY "security_audit_logs_own_data" ON security_audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "security_audit_logs_admin_all" ON security_audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Two Factor Auth - Users can only manage their own 2FA
CREATE POLICY "two_factor_auth_own_data" ON two_factor_auth
    FOR ALL USING (user_id = auth.uid());

-- Security Flags - Users can only see their own flags, admins can see all
CREATE POLICY "security_flags_own_data" ON security_flags
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "security_flags_admin_all" ON security_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Fraud Analysis - Users can only see their own analysis, admins can see all
CREATE POLICY "fraud_analysis_own_data" ON fraud_analysis
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "fraud_analysis_admin_all" ON fraud_analysis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- User Sessions - Users can only see their own sessions
CREATE POLICY "user_sessions_own_data" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_two_factor_auth_updated_at 
    BEFORE UPDATE ON two_factor_auth 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire old sessions
CREATE OR REPLACE FUNCTION expire_old_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark sessions as inactive if they've expired
    UPDATE user_sessions 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for session expiration
CREATE TRIGGER expire_old_sessions_trigger
    AFTER INSERT ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION expire_old_sessions();

-- =====================================================
-- 8. VIEWS FOR ANALYTICS
-- =====================================================

-- View for security metrics
CREATE OR REPLACE VIEW security_metrics AS
SELECT 
    COUNT(*) as total_audit_logs,
    COUNT(CASE WHEN risk_score > 70 THEN 1 END) as high_risk_events,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as events_24h,
    COUNT(DISTINCT user_id) as affected_users,
    AVG(risk_score) as avg_risk_score
FROM security_audit_logs;

-- View for active security flags
CREATE OR REPLACE VIEW active_security_flags AS
SELECT 
    sf.id,
    sf.user_id,
    sf.flag_type,
    sf.severity,
    sf.description,
    sf.confidence,
    sf.created_at,
    p.first_name,
    p.last_name
FROM security_flags sf
JOIN profiles p ON sf.user_id = p.user_id
WHERE sf.is_resolved = FALSE
ORDER BY sf.severity DESC, sf.confidence DESC;

-- View for 2FA statistics
CREATE OR REPLACE VIEW two_factor_stats AS
SELECT 
    COUNT(*) as total_2fa_setups,
    COUNT(CASE WHEN is_enabled = TRUE THEN 1 END) as active_2fa_users,
    COUNT(CASE WHEN method = '2fa_app' THEN 1 END) as app_based_2fa,
    COUNT(CASE WHEN method = 'sms' THEN 1 END) as sms_based_2fa,
    COUNT(CASE WHEN method = 'email' THEN 1 END) as email_based_2fa
FROM two_factor_auth;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The SecurityService can now use real database tables instead of mock data.
-- 
-- Tables created:
-- - security_audit_logs: Security audit trail
-- - two_factor_auth: 2FA configurations
-- - security_flags: Security alerts and flags
-- - fraud_analysis: Fraud detection results
-- - user_sessions: User session tracking
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Session expiration handling
-- - Performance indexes
-- - Security analytics views
-- =====================================================
