-- =====================================================
-- ALL SERVICES - CONSOLIDATED DATABASE TABLES
-- =====================================================
-- This file consolidates all service-related tables for easier deployment
-- Run these commands in your Supabase SQL editor to create all required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Fraud Analysis Table
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

-- User Sessions Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COUPLE PROFILES SERVICE TABLES
-- =====================================================

-- Couple Profiles Table
CREATE TABLE IF NOT EXISTS couple_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_name VARCHAR(255) NOT NULL,
    couple_bio TEXT,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('man-woman', 'man-man', 'woman-woman')),
    partner1_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    partner2_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    couple_images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    looking_for TEXT,
    experience_level VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (partner1_id != partner2_id),
    UNIQUE(partner1_id, partner2_id)
);

-- Couple Profile Views Table
CREATE TABLE IF NOT EXISTS couple_profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    viewer_profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(couple_profile_id, viewer_profile_id, viewed_date)
);

-- Couple Profile Likes Table
CREATE TABLE IF NOT EXISTS couple_profile_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    liker_profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(couple_profile_id, liker_profile_id)
);

-- Couple Profile Matches Table
CREATE TABLE IF NOT EXISTS couple_profile_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile1_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    couple_profile2_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_interaction TIMESTAMP WITH TIME ZONE,
    CHECK (couple_profile1_id != couple_profile2_id),
    UNIQUE(couple_profile1_id, couple_profile2_id)
);

-- Couple Profile Reports Table
CREATE TABLE IF NOT EXISTS couple_profile_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    reporter_profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('fake', 'inappropriate', 'harassment', 'spam', 'other')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(couple_profile_id, reporter_profile_id)
);

-- Add missing columns to existing couple_profile_reports table if they don't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'couple_profile_reports' AND column_name = 'status') THEN
        ALTER TABLE couple_profile_reports ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));
    END IF;
    
    -- Add reviewed_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'couple_profile_reports' AND column_name = 'reviewed_by') THEN
        ALTER TABLE couple_profile_reports ADD COLUMN reviewed_by UUID REFERENCES profiles(user_id);
    END IF;
    
    -- Add reviewed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'couple_profile_reports' AND column_name = 'reviewed_at') THEN
        ALTER TABLE couple_profile_reports ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add resolution_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'couple_profile_reports' AND column_name = 'resolution_notes') THEN
        ALTER TABLE couple_profile_reports ADD COLUMN resolution_notes TEXT;
    END IF;
END $$;

-- =====================================================
-- REFERRAL TOKENS SERVICE TABLES
-- =====================================================

-- User Referral Balances Table
CREATE TABLE IF NOT EXISTS user_referral_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE,
    total_referrals INTEGER DEFAULT 0,
    total_earned BIGINT DEFAULT 0,
    monthly_earned BIGINT DEFAULT 0,
    cmpx_balance BIGINT DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Referral Transactions Table
CREATE TABLE IF NOT EXISTS referral_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('referral_earn', 'referral_spend', 'bonus')),
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Statistics Table
CREATE TABLE IF NOT EXISTS referral_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    total_invites INTEGER NOT NULL DEFAULT 0,
    successful_invites INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    last_invite_date TIMESTAMP WITH TIME ZONE,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one stats record per user per period
    UNIQUE(user_id, period_start)
);

-- =====================================================
-- INVITATIONS SERVICE TABLES
-- =====================================================

-- Gallery Permissions Table
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    granted_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    granted_to UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'download', 'comment', 'share')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES profiles(user_id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (granted_by != granted_to),
    UNIQUE(granted_by, granted_to, permission_type)
);

-- Invitation Responses Table
CREATE TABLE IF NOT EXISTS invitation_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('accept', 'decline', 'counter_invite')),
    message TEXT,
    counter_invitation_id UUID REFERENCES invitations(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invitation_id)
);

-- Invitation Templates Table
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    invitation_type VARCHAR(20) NOT NULL CHECK (invitation_type IN ('profile', 'gallery', 'chat', 'event', 'meetup')),
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitation Analytics Table
CREATE TABLE IF NOT EXISTS invitation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('sent', 'viewed', 'responded', 'expired', 'reminder_sent')),
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR ALL TABLES
-- =====================================================

-- Security Service Indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_score ON security_audit_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip_address ON security_audit_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_method ON two_factor_auth(method);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_is_enabled ON two_factor_auth(is_enabled);

CREATE INDEX IF NOT EXISTS idx_security_flags_user_id ON security_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_security_flags_flag_type ON security_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_security_flags_severity ON security_flags(severity);
CREATE INDEX IF NOT EXISTS idx_security_flags_is_resolved ON security_flags(is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_flags_created_at ON security_flags(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fraud_analysis_user_id ON fraud_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_is_fraudulent ON fraud_analysis(is_fraudulent);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_confidence ON fraud_analysis(confidence);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_created_at ON fraud_analysis(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Couple Profiles Service Indexes
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner1_id ON couple_profiles(partner1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner2_id ON couple_profiles(partner2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_relationship_type ON couple_profiles(relationship_type);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_verified ON couple_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_is_premium ON couple_profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_created_at ON couple_profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_couple_profile_views_couple_profile_id ON couple_profile_views(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_viewer_profile_id ON couple_profile_views(viewer_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_viewed_at ON couple_profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_viewed_date ON couple_profile_views(viewed_date);

CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_couple_profile_id ON couple_profile_likes(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liker_profile_id ON couple_profile_likes(liker_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liked_at ON couple_profile_likes(liked_at);

CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_couple_profile1_id ON couple_profile_matches(couple_profile1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_couple_profile2_id ON couple_profile_matches(couple_profile2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_is_active ON couple_profile_matches(is_active);
CREATE INDEX IF NOT EXISTS idx_couple_profile_matches_matched_at ON couple_profile_matches(matched_at);

CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_couple_profile_id ON couple_profile_reports(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_reporter_profile_id ON couple_profile_reports(reporter_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_reason ON couple_profile_reports(reason);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_created_at ON couple_profile_reports(created_at);

-- Referral Tokens Service Indexes
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_user_id ON user_referral_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referral_code ON user_referral_balances(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_total_referrals ON user_referral_balances(total_referrals);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_cmpx_balance ON user_referral_balances(cmpx_balance);

CREATE INDEX IF NOT EXISTS idx_referral_transactions_user_id ON referral_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_transaction_type ON referral_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_created_at ON referral_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_referral_statistics_user_id ON referral_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_referral_code ON referral_statistics(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_period_start ON referral_statistics(period_start);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_period_end ON referral_statistics(period_end);

-- Invitations Service Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_by ON gallery_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_to ON gallery_permissions(granted_to);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_permission_type ON gallery_permissions(permission_type);

CREATE INDEX IF NOT EXISTS idx_invitation_responses_invitation_id ON invitation_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_responses_response_type ON invitation_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_invitation_responses_created_at ON invitation_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_invitation_templates_invitation_type ON invitation_templates(invitation_type);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_is_active ON invitation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_created_by ON invitation_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_invitation_analytics_invitation_id ON invitation_analytics(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_event_type ON invitation_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_created_at ON invitation_analytics(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_referral_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_statistics ENABLE ROW LEVEL SECURITY;

ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_analytics ENABLE ROW LEVEL SECURITY;

-- Security Service Policies
DROP POLICY IF EXISTS "security_audit_logs_own_data" ON security_audit_logs;
CREATE POLICY "security_audit_logs_own_data" ON security_audit_logs
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "security_audit_logs_admin_all" ON security_audit_logs;
CREATE POLICY "security_audit_logs_admin_all" ON security_audit_logs
    FOR ALL USING (false); -- Disabled for now, no profiles dependency

DROP POLICY IF EXISTS "two_factor_auth_own_data" ON two_factor_auth;
CREATE POLICY "two_factor_auth_own_data" ON two_factor_auth
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "security_flags_own_data" ON security_flags;
CREATE POLICY "security_flags_own_data" ON security_flags
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "security_flags_admin_all" ON security_flags;
CREATE POLICY "security_flags_admin_all" ON security_flags
    FOR ALL USING (false); -- Disabled for now, no profiles dependency

DROP POLICY IF EXISTS "fraud_analysis_own_data" ON fraud_analysis;
CREATE POLICY "fraud_analysis_own_data" ON fraud_analysis
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "fraud_analysis_admin_all" ON fraud_analysis;
CREATE POLICY "fraud_analysis_admin_all" ON fraud_analysis
    FOR ALL USING (false); -- Disabled for now, no profiles dependency

DROP POLICY IF EXISTS "user_sessions_own_data" ON user_sessions;
CREATE POLICY "user_sessions_own_data" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- Couple Profiles Policies
DROP POLICY IF EXISTS "couple_profiles_public_read" ON couple_profiles;
CREATE POLICY "couple_profiles_public_read" ON couple_profiles
    FOR SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "couple_profiles_own_all" ON couple_profiles;
CREATE POLICY "couple_profiles_own_all" ON couple_profiles
    FOR ALL USING (
        partner1_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
        partner2_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "couple_profile_views_own_data" ON couple_profile_views;
CREATE POLICY "couple_profile_views_own_data" ON couple_profile_views
    FOR ALL USING (viewer_profile_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "couple_profile_likes_own_data" ON couple_profile_likes;
CREATE POLICY "couple_profile_likes_own_data" ON couple_profile_likes
    FOR ALL USING (liker_profile_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "couple_profile_matches_own_data" ON couple_profile_matches;
CREATE POLICY "couple_profile_matches_own_data" ON couple_profile_matches
    FOR ALL USING (
        couple_profile1_id IN (
            SELECT id FROM couple_profiles 
            WHERE partner1_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  partner2_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        ) OR
        couple_profile2_id IN (
            SELECT id FROM couple_profiles 
            WHERE partner1_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  partner2_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "couple_profile_reports_own_data" ON couple_profile_reports;
CREATE POLICY "couple_profile_reports_own_data" ON couple_profile_reports
    FOR ALL USING (reporter_profile_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "couple_profile_reports_admin_read" ON couple_profile_reports;
CREATE POLICY "couple_profile_reports_admin_read" ON couple_profile_reports
    FOR SELECT USING (false); -- Disabled for now, no profiles dependency

-- Referral Tokens Policies
DROP POLICY IF EXISTS "user_referral_balances_own_data" ON user_referral_balances;
CREATE POLICY "user_referral_balances_own_data" ON user_referral_balances
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "referral_transactions_own_data" ON referral_transactions;
CREATE POLICY "referral_transactions_own_data" ON referral_transactions
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "referral_statistics_admin_read" ON referral_statistics;
CREATE POLICY "referral_statistics_admin_read" ON referral_statistics
    FOR SELECT USING (false); -- Disabled for now, no profiles dependency

-- Invitations Service Policies
DROP POLICY IF EXISTS "gallery_permissions_own_data" ON gallery_permissions;
CREATE POLICY "gallery_permissions_own_data" ON gallery_permissions
    FOR ALL USING (
        granted_by IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
        granted_to IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "invitation_responses_own_data" ON invitation_responses;
CREATE POLICY "invitation_responses_own_data" ON invitation_responses
    FOR ALL USING (
        invitation_id IN (
            SELECT id FROM invitations 
            WHERE from_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  to_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "invitation_templates_public_read" ON invitation_templates;
CREATE POLICY "invitation_templates_public_read" ON invitation_templates
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "invitation_templates_admin_all" ON invitation_templates;
CREATE POLICY "invitation_templates_admin_all" ON invitation_templates
    FOR ALL USING (false); -- Disabled for now, no profiles dependency

DROP POLICY IF EXISTS "invitation_analytics_own_data" ON invitation_analytics;
CREATE POLICY "invitation_analytics_own_data" ON invitation_analytics
    FOR ALL USING (
        invitation_id IN (
            SELECT id FROM invitations 
            WHERE from_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()) OR
                  to_profile IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
        )
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
DROP TRIGGER IF EXISTS update_two_factor_auth_updated_at ON two_factor_auth;
CREATE TRIGGER update_two_factor_auth_updated_at 
    BEFORE UPDATE ON two_factor_auth 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_couple_profiles_updated_at ON couple_profiles;
CREATE TRIGGER update_couple_profiles_updated_at 
    BEFORE UPDATE ON couple_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_couple_profile_reports_updated_at ON couple_profile_reports;
CREATE TRIGGER update_couple_profile_reports_updated_at 
    BEFORE UPDATE ON couple_profile_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_referral_balances_updated_at ON user_referral_balances;
CREATE TRIGGER update_user_referral_balances_updated_at 
    BEFORE UPDATE ON user_referral_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referral_statistics_updated_at ON referral_statistics;
CREATE TRIGGER update_referral_statistics_updated_at 
    BEFORE UPDATE ON referral_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_permissions_updated_at ON gallery_permissions;
CREATE TRIGGER update_gallery_permissions_updated_at 
    BEFORE UPDATE ON gallery_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invitation_templates_updated_at ON invitation_templates;
CREATE TRIGGER update_invitation_templates_updated_at 
    BEFORE UPDATE ON invitation_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update viewed_date when viewed_at changes
CREATE OR REPLACE FUNCTION update_viewed_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.viewed_date = DATE(NEW.viewed_at);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic viewed_date updates
DROP TRIGGER IF EXISTS update_couple_profile_views_viewed_date ON couple_profile_views;
CREATE TRIGGER update_couple_profile_views_viewed_date
    BEFORE INSERT OR UPDATE ON couple_profile_views
    FOR EACH ROW EXECUTE FUNCTION update_viewed_date();

-- Function to automatically create mutual match when both couples like each other
CREATE OR REPLACE FUNCTION create_couple_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's a mutual like
    IF EXISTS (
        SELECT 1 FROM couple_profile_likes cpl1
        JOIN couple_profile_likes cpl2 ON cpl1.couple_profile_id = cpl2.liker_profile_id
        WHERE cpl1.liker_profile_id = NEW.couple_profile_id
        AND cpl2.couple_profile_id = NEW.liker_profile_id
    ) THEN
        -- Create match if it doesn't exist
        INSERT INTO couple_profile_matches (couple_profile1_id, couple_profile2_id)
        VALUES (NEW.couple_profile_id, NEW.liker_profile_id)
        ON CONFLICT (couple_profile1_id, couple_profile2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic matching
DROP TRIGGER IF EXISTS create_couple_match_trigger ON couple_profile_likes;
CREATE TRIGGER create_couple_match_trigger
    AFTER INSERT ON couple_profile_likes
    FOR EACH ROW EXECUTE FUNCTION create_couple_match();

-- Function to automatically expire old sessions
CREATE OR REPLACE FUNCTION expire_old_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark sessions as inactive if they've expired
    -- Only if expires_at column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_sessions' AND column_name = 'expires_at') THEN
        UPDATE user_sessions 
        SET is_active = FALSE 
        WHERE expires_at < NOW() AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for session expiration
DROP TRIGGER IF EXISTS expire_old_sessions_trigger ON user_sessions;
CREATE TRIGGER expire_old_sessions_trigger
    AFTER INSERT ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION expire_old_sessions();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All consolidated service tables have been created successfully!
-- This file includes tables for:
-- - Security Service (audit logs, 2FA, flags, fraud analysis, sessions)
-- - Couple Profiles Service (profiles, views, likes, matches, reports)
-- - Referral Tokens Service (balances, transactions, statistics)
-- - Invitations Service (gallery permissions, responses, templates, analytics)
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic matching system
-- - Session expiration handling
-- - Performance indexes
-- - Comprehensive analytics support
-- =====================================================