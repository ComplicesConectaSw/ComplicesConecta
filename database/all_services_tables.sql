-- =====================================================
-- ALL SERVICES DATABASE TABLES - CONSOLIDATED
-- =====================================================
-- This file contains ALL SQL schemas for services that use mock data
-- Run these commands in your Supabase SQL editor to create all required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EXISTING TABLES (ALREADY CREATED)
-- =====================================================
-- The following tables are already created in separate files:
-- - posts_service_tables.sql: posts, post_likes, comments, comment_likes, post_shares, post_reports, follows
-- - token_analytics_tables.sql: token_analytics, user_tokens, user_staking, transactions
-- 
-- If you haven't run those files yet, please run them first:
-- 1. database/posts_service_tables.sql
-- 2. database/token_analytics_tables.sql
-- =====================================================

-- =====================================================
-- SECURITY SERVICE TABLES
-- =====================================================

-- Security Audit Logs Table
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

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_score ON security_audit_logs(risk_score);

-- Two Factor Authentication Table
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
    UNIQUE(user_id, method)
);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_method ON two_factor_auth(method);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_is_enabled ON two_factor_auth(is_enabled);

-- Security Flags Table
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

CREATE INDEX IF NOT EXISTS idx_security_flags_user_id ON security_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_security_flags_flag_type ON security_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_security_flags_severity ON security_flags(severity);
CREATE INDEX IF NOT EXISTS idx_security_flags_is_resolved ON security_flags(is_resolved);

-- =====================================================
-- COUPLE PROFILES SERVICE TABLES
-- =====================================================

-- Couple Profiles Table
CREATE TABLE IF NOT EXISTS couple_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_name VARCHAR(255) NOT NULL,
    couple_bio TEXT,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('man-woman', 'man-man', 'woman-woman')),
    partner1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    partner2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    couple_images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    location VARCHAR(255),
    interests TEXT[],
    looking_for TEXT,
    experience_level VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (partner1_id != partner2_id),
    UNIQUE(partner1_id, partner2_id)
);

CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner1_id ON couple_profiles(partner1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner2_id ON couple_profiles(partner2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_relationship_type ON couple_profiles(relationship_type);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_active ON couple_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_interests ON couple_profiles USING GIN(interests);

-- Couple Profile Likes Table
CREATE TABLE IF NOT EXISTS couple_profile_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    liker_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(couple_profile_id, liker_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_couple_profile_id ON couple_profile_likes(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liker_profile_id ON couple_profile_likes(liker_profile_id);

-- =====================================================
-- REFERRAL TOKENS SERVICE TABLES
-- =====================================================

-- User Referral Balances Table
CREATE TABLE IF NOT EXISTS user_referral_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    referred_by UUID REFERENCES auth.users(id),
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_referral_balances_user_id ON user_referral_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referral_code ON user_referral_balances(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referred_by ON user_referral_balances(referred_by);

-- Referral Rewards Table
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('referral_bonus', 'welcome_bonus')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    inviter_reward_amount BIGINT NOT NULL DEFAULT 0,
    invited_reward_amount BIGINT NOT NULL DEFAULT 0,
    referral_code VARCHAR(20) NOT NULL,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (inviter_id != invited_id),
    UNIQUE(inviter_id, invited_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_inviter_id ON referral_rewards(inviter_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_invited_id ON referral_rewards(invited_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

-- =====================================================
-- INVITATIONS SERVICE TABLES
-- =====================================================

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    invitation_type VARCHAR(20) NOT NULL CHECK (invitation_type IN ('profile', 'gallery', 'chat', 'event', 'meetup')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decided_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (from_profile != to_profile),
    UNIQUE(from_profile, to_profile, invitation_type)
);

CREATE INDEX IF NOT EXISTS idx_invitations_from_profile ON invitations(from_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_to_profile ON invitations(to_profile);
CREATE INDEX IF NOT EXISTS idx_invitations_invitation_type ON invitations(invitation_type);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Gallery Permissions Table
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    grantee_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'download', 'comment', 'share')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (owner_profile != grantee_profile),
    UNIQUE(owner_profile, grantee_profile, permission_type)
);

CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner_profile ON gallery_permissions(owner_profile);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_grantee_profile ON gallery_permissions(grantee_profile);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_permission_type ON gallery_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_status ON gallery_permissions(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referral_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;

-- Security tables policies
CREATE POLICY "security_audit_logs_own_data" ON security_audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "two_factor_auth_own_data" ON two_factor_auth
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "security_flags_own_data" ON security_flags
    FOR SELECT USING (user_id = auth.uid());

-- Couple profiles policies
CREATE POLICY "couple_profiles_public_read" ON couple_profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "couple_profiles_own_all" ON couple_profiles
    FOR ALL USING (
        partner1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        partner2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "couple_profile_likes_own_data" ON couple_profile_likes
    FOR ALL USING (liker_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Referral tables policies
CREATE POLICY "user_referral_balances_own_data" ON user_referral_balances
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "referral_rewards_own_data" ON referral_rewards
    FOR ALL USING (inviter_id = auth.uid() OR invited_id = auth.uid());

-- Invitations policies
CREATE POLICY "invitations_own_data" ON invitations
    FOR ALL USING (
        from_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        to_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "gallery_permissions_own_data" ON gallery_permissions
    FOR ALL USING (
        owner_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        grantee_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
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

CREATE TRIGGER update_couple_profiles_updated_at 
    BEFORE UPDATE ON couple_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referral_balances_updated_at 
    BEFORE UPDATE ON user_referral_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at 
    BEFORE UPDATE ON invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_permissions_updated_at 
    BEFORE UPDATE ON gallery_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample invitation templates
INSERT INTO invitation_templates (template_name, invitation_type, template_content, is_active) VALUES
('Gallery Access Request', 'gallery', 'Me gustaría solicitar acceso a tu galería privada. ¿Podrías considerarlo?', true),
('Chat Invitation', 'chat', 'Hola! Me gustaría iniciar una conversación contigo. ¿Te parece bien?', true),
('Profile Connection', 'profile', 'Me gustaría conectar contigo. ¿Podemos conocernos mejor?', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All additional tables have been created successfully!
-- 
-- New tables created:
-- - security_audit_logs: Security audit trail
-- - two_factor_auth: 2FA configurations  
-- - security_flags: Security alerts and flags
-- - couple_profiles: Couple profiles data
-- - couple_profile_likes: Couple profile likes
-- - user_referral_balances: User referral token balances
-- - referral_rewards: Referral reward tracking
-- - invitations: Main invitations data
-- - gallery_permissions: Gallery access permissions
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Performance indexes
-- - Sample data
--
-- Note: Make sure to run the other SQL files first:
-- 1. database/posts_service_tables.sql
-- 2. database/token_analytics_tables.sql
-- =====================================================
