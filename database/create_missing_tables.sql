-- =====================================================
-- CREACIÓN DE TABLAS FALTANTES EN SUPABASE
-- =====================================================
-- Este script crea todas las tablas que faltan en la base de datos
-- de manera segura usando IF NOT EXISTS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TOKEN ANALYTICS TABLES
-- =====================================================

-- Token Analytics Table
CREATE TABLE IF NOT EXISTS token_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_cmpx_supply BIGINT NOT NULL DEFAULT 0,
    total_gtk_supply BIGINT NOT NULL DEFAULT 0,
    circulating_cmpx BIGINT NOT NULL DEFAULT 0,
    circulating_gtk BIGINT NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    transaction_volume_cmpx BIGINT NOT NULL DEFAULT 0,
    transaction_volume_gtk BIGINT NOT NULL DEFAULT 0,
    total_staked_cmpx BIGINT NOT NULL DEFAULT 0,
    active_stakers INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staking Records Table
CREATE TABLE IF NOT EXISTS staking_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('cmpx', 'gtk')),
    staking_duration INTEGER NOT NULL, -- in days
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token Transactions Table
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('cmpx', 'gtk')),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('transfer', 'reward', 'purchase', 'refund')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. REFERRAL TOKENS TABLES
-- =====================================================

-- User Referral Balances Table
CREATE TABLE IF NOT EXISTS user_referral_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Rewards Table
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type VARCHAR(10) NOT NULL CHECK (reward_type IN ('cmpx', 'gtk')),
    amount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Referral Transactions Table
CREATE TABLE IF NOT EXISTS referral_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'transfer')),
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('cmpx', 'gtk')),
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Statistics Table
CREATE TABLE IF NOT EXISTS referral_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    active_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Leaderboard Table
CREATE TABLE IF NOT EXISTS referral_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned BIGINT NOT NULL DEFAULT 0,
    monthly_earned BIGINT NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. STORY INTERACTION TABLES
-- =====================================================

-- Story Likes Table
CREATE TABLE IF NOT EXISTS story_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Story Comments Table
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story Shares Table
CREATE TABLE IF NOT EXISTS story_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type VARCHAR(20) NOT NULL DEFAULT 'share' CHECK (share_type IN ('share', 'repost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Comment Likes Table
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES story_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =====================================================
-- 4. COUPLE PROFILES INTERACTION TABLES
-- =====================================================

-- Couple Profile Likes Table
CREATE TABLE IF NOT EXISTS couple_profile_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    liker_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(couple_profile_id, liker_profile_id)
);

-- Couple Profile Views Table
CREATE TABLE IF NOT EXISTS couple_profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    viewer_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Couple Profile Reports Table
CREATE TABLE IF NOT EXISTS couple_profile_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    reporter_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SECURITY TABLES
-- =====================================================

-- Two Factor Auth Table
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('2fa_app', 'sms', 'email')),
    secret VARCHAR(100),
    backup_codes TEXT[],
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    resource_type VARCHAR(50),
    request_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    fraud_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. INVITATION RELATED TABLES
-- =====================================================

-- Gallery Permissions Table
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'comment', 'share')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitation Templates Table
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitation Statistics Table
CREATE TABLE IF NOT EXISTS invitation_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_invitations INTEGER NOT NULL DEFAULT 0,
    pending_invitations INTEGER NOT NULL DEFAULT 0,
    accepted_invitations INTEGER NOT NULL DEFAULT 0,
    declined_invitations INTEGER NOT NULL DEFAULT 0,
    expired_invitations INTEGER NOT NULL DEFAULT 0,
    acceptance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Token Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_token_analytics_period_type ON token_analytics(period_type);
CREATE INDEX IF NOT EXISTS idx_token_analytics_period_start ON token_analytics(period_start);
CREATE INDEX IF NOT EXISTS idx_token_analytics_created_at ON token_analytics(created_at);

-- Staking Records Indexes
CREATE INDEX IF NOT EXISTS idx_staking_records_user_id ON staking_records(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_records_is_active ON staking_records(is_active);
CREATE INDEX IF NOT EXISTS idx_staking_records_created_at ON staking_records(created_at);

-- Token Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);

-- Referral Tables Indexes
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_user_id ON user_referral_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_code ON user_referral_balances(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referee ON referral_rewards(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_user_id ON referral_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_user_id ON referral_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_leaderboard_rank ON referral_leaderboard(rank);

-- Story Interaction Indexes
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_user_id ON story_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_story_shares_story_id ON story_shares(story_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Couple Profile Interaction Indexes
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_profile_id ON couple_profile_likes(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_likes_liker_id ON couple_profile_likes(liker_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_views_profile_id ON couple_profile_views(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_profile_reports_profile_id ON couple_profile_reports(couple_profile_id);

-- Security Indexes
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Invitation Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_owner_id ON gallery_permissions(gallery_owner_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_granted_to ON gallery_permissions(granted_to);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_type ON invitation_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_active ON invitation_templates(is_active);

-- =====================================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE token_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referral_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profile_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_statistics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE FUNCTIONS FOR AUTOMATIC UPDATES
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
CREATE TRIGGER update_token_analytics_updated_at BEFORE UPDATE ON token_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staking_records_updated_at BEFORE UPDATE ON staking_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_referral_balances_updated_at BEFORE UPDATE ON user_referral_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referral_statistics_updated_at BEFORE UPDATE ON referral_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referral_leaderboard_updated_at BEFORE UPDATE ON referral_leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_story_comments_updated_at BEFORE UPDATE ON story_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couple_profile_reports_updated_at BEFORE UPDATE ON couple_profile_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON two_factor_auth FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_permissions_updated_at BEFORE UPDATE ON gallery_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invitation_templates_updated_at BEFORE UPDATE ON invitation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invitation_statistics_updated_at BEFORE UPDATE ON invitation_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify all tables were created successfully
SELECT 
    table_name,
    'CREATED' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'token_analytics',
        'staking_records',
        'token_transactions',
        'user_referral_balances',
        'referral_rewards',
        'referral_transactions',
        'referral_statistics',
        'referral_leaderboard',
        'story_likes',
        'story_comments',
        'story_shares',
        'comment_likes',
        'couple_profile_likes',
        'couple_profile_views',
        'couple_profile_reports',
        'two_factor_auth',
        'audit_logs',
        'gallery_permissions',
        'invitation_templates',
        'invitation_statistics'
    )
ORDER BY table_name;
