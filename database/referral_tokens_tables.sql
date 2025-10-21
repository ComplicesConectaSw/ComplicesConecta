-- =====================================================
-- REFERRAL TOKENS SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the Referral Tokens service
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER REFERRAL BALANCES TABLE
-- =====================================================
-- Table for storing user referral token balances
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
    
    -- Ensure one balance record per user
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_user_id ON user_referral_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referral_code ON user_referral_balances(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_referred_by ON user_referral_balances(referred_by);
CREATE INDEX IF NOT EXISTS idx_user_referral_balances_last_reset_date ON user_referral_balances(last_reset_date);

-- =====================================================
-- 2. REFERRAL REWARDS TABLE
-- =====================================================
-- Table for storing referral rewards
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
    
    -- Ensure inviter and invited are different
    CHECK (inviter_id != invited_id),
    -- Ensure one reward per inviter-invited pair
    UNIQUE(inviter_id, invited_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_rewards_inviter_id ON referral_rewards(inviter_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_invited_id ON referral_rewards(invited_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_reward_type ON referral_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_code ON referral_rewards(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_created_at ON referral_rewards(created_at DESC);

-- =====================================================
-- 3. REFERRAL TRANSACTIONS TABLE
-- =====================================================
-- Table for storing referral-related transactions
CREATE TABLE IF NOT EXISTS referral_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('referral_earn', 'referral_spend', 'monthly_reset', 'bonus_grant')),
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    referral_code VARCHAR(20),
    related_reward_id UUID REFERENCES referral_rewards(id),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_transactions_user_id ON referral_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_transaction_type ON referral_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referral_code ON referral_transactions(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_related_reward_id ON referral_transactions(related_reward_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_created_at ON referral_transactions(created_at DESC);

-- =====================================================
-- 4. REFERRAL STATISTICS TABLE
-- =====================================================
-- Table for storing referral statistics
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_statistics_user_id ON referral_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_referral_code ON referral_statistics(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_period_start ON referral_statistics(period_start);
CREATE INDEX IF NOT EXISTS idx_referral_statistics_period_end ON referral_statistics(period_end);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_referral_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_statistics ENABLE ROW LEVEL SECURITY;

-- User Referral Balances policies
CREATE POLICY "user_referral_balances_own_data" ON user_referral_balances
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_referral_balances_admin_read" ON user_referral_balances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Referral Rewards policies
CREATE POLICY "referral_rewards_own_data" ON referral_rewards
    FOR ALL USING (inviter_id = auth.uid() OR invited_id = auth.uid());

CREATE POLICY "referral_rewards_admin_all" ON referral_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Referral Transactions policies
CREATE POLICY "referral_transactions_own_data" ON referral_transactions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "referral_transactions_admin_read" ON referral_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Referral Statistics policies
CREATE POLICY "referral_statistics_own_data" ON referral_statistics
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "referral_statistics_admin_read" ON referral_statistics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
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
CREATE TRIGGER update_user_referral_balances_updated_at 
    BEFORE UPDATE ON user_referral_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_statistics_updated_at 
    BEFORE UPDATE ON referral_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update user balance after referral transaction
CREATE OR REPLACE FUNCTION update_referral_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_referral_balances table based on transaction
    INSERT INTO user_referral_balances (user_id, cmpx_balance, monthly_earned, total_earned, last_reset_date)
    VALUES (
        NEW.user_id, 
        NEW.balance_after,
        CASE WHEN NEW.transaction_type = 'referral_earn' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.transaction_type = 'referral_earn' THEN NEW.amount ELSE 0 END,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        cmpx_balance = NEW.balance_after,
        monthly_earned = CASE 
            WHEN NEW.transaction_type = 'referral_earn' THEN user_referral_balances.monthly_earned + NEW.amount
            WHEN NEW.transaction_type = 'monthly_reset' THEN 0
            ELSE user_referral_balances.monthly_earned
        END,
        total_earned = CASE 
            WHEN NEW.transaction_type = 'referral_earn' THEN user_referral_balances.total_earned + NEW.amount
            ELSE user_referral_balances.total_earned
        END,
        last_reset_date = CASE 
            WHEN NEW.transaction_type = 'monthly_reset' THEN CURRENT_DATE
            ELSE user_referral_balances.last_reset_date
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic balance updates
CREATE TRIGGER update_referral_balance_trigger
    AFTER INSERT ON referral_transactions
    FOR EACH ROW EXECUTE FUNCTION update_referral_balance();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate code with prefix and user ID hash
        code := 'CMPX' || UPPER(SUBSTRING(user_id::TEXT, -6));
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_count 
        FROM user_referral_balances 
        WHERE referral_code = code;
        
        -- If code doesn't exist, break the loop
        IF exists_count = 0 THEN
            EXIT;
        END IF;
        
        -- If code exists, modify it slightly
        code := code || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END LOOP;
    
    RETURN code;
END;
$$ language 'plpgsql';

-- =====================================================
-- 7. VIEWS FOR ANALYTICS
-- =====================================================

-- View for referral leaderboard
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT 
    urb.user_id,
    urb.referral_code,
    urb.total_referrals,
    urb.total_earned,
    urb.monthly_earned,
    p.first_name,
    p.last_name,
    p.avatar_url,
    RANK() OVER (ORDER BY urb.total_referrals DESC, urb.total_earned DESC) as rank
FROM user_referral_balances urb
JOIN profiles p ON urb.user_id = p.user_id
WHERE urb.total_referrals > 0
ORDER BY urb.total_referrals DESC, urb.total_earned DESC;

-- View for referral performance metrics
CREATE OR REPLACE VIEW referral_performance AS
SELECT 
    DATE_TRUNC('month', rr.created_at) as month,
    COUNT(*) as total_rewards,
    COUNT(CASE WHEN rr.status = 'completed' THEN 1 END) as completed_rewards,
    COUNT(CASE WHEN rr.status = 'failed' THEN 1 END) as failed_rewards,
    SUM(rr.amount) as total_amount,
    SUM(CASE WHEN rr.status = 'completed' THEN rr.amount ELSE 0 END) as completed_amount,
    AVG(CASE WHEN rr.status = 'completed' THEN rr.amount ELSE NULL END) as avg_reward_amount,
    COUNT(DISTINCT rr.inviter_id) as unique_inviters,
    COUNT(DISTINCT rr.invited_id) as unique_invited
FROM referral_rewards rr
GROUP BY DATE_TRUNC('month', rr.created_at)
ORDER BY month DESC;

-- View for user referral summary
CREATE OR REPLACE VIEW user_referral_summary AS
SELECT 
    urb.user_id,
    urb.referral_code,
    urb.total_referrals,
    urb.total_earned,
    urb.monthly_earned,
    urb.cmpx_balance,
    COUNT(rr.id) as total_rewards,
    COUNT(CASE WHEN rr.status = 'completed' THEN 1 END) as completed_rewards,
    MAX(rr.created_at) as last_reward_date,
    p.first_name,
    p.last_name
FROM user_referral_balances urb
LEFT JOIN referral_rewards rr ON urb.user_id = rr.inviter_id
LEFT JOIN profiles p ON urb.user_id = p.user_id
GROUP BY urb.user_id, urb.referral_code, urb.total_referrals, urb.total_earned, 
         urb.monthly_earned, urb.cmpx_balance, p.first_name, p.last_name;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The Referral Tokens service can now use real database tables instead of mock data.
-- 
-- Tables created:
-- - user_referral_balances: User referral token balances
-- - referral_rewards: Referral reward tracking
-- - referral_transactions: Referral transaction history
-- - referral_statistics: Referral performance statistics
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic balance updates
-- - Unique referral code generation
-- - Performance indexes
-- - Analytics views
-- =====================================================
