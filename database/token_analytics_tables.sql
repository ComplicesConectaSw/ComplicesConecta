-- =====================================================
-- TOKEN ANALYTICS SERVICE - DATABASE TABLES
-- =====================================================
-- This file contains the SQL schema for the TokenAnalyticsService
-- Run these commands in your Supabase SQL editor to create the required tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TOKEN ANALYTICS TABLE
-- =====================================================
-- Main table for storing token analytics data
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_analytics_period_type ON token_analytics(period_type);
CREATE INDEX IF NOT EXISTS idx_token_analytics_period_start ON token_analytics(period_start);
CREATE INDEX IF NOT EXISTS idx_token_analytics_created_at ON token_analytics(created_at);

-- =====================================================
-- 2. USER TOKENS TABLE
-- =====================================================
-- Table for storing user token balances
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_cmpx_balance ON user_tokens(cmpx_balance);
CREATE INDEX IF NOT EXISTS idx_user_tokens_gtk_balance ON user_tokens(gtk_balance);

-- =====================================================
-- 3. USER STAKING TABLE
-- =====================================================
-- Table for storing user staking information
CREATE TABLE IF NOT EXISTS user_staking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staked_cmpx BIGINT NOT NULL,
    staking_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staking_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    rewards_earned BIGINT DEFAULT 0,
    last_claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_staking_user_id ON user_staking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_staking_is_active ON user_staking(is_active);
CREATE INDEX IF NOT EXISTS idx_user_staking_staking_end_date ON user_staking(staking_end_date);

-- =====================================================
-- 4. TRANSACTIONS TABLE
-- =====================================================
-- Table for storing token transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'purchase', 'reward')),
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('cmpx', 'gtk')),
    amount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_token_type ON transactions(token_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE token_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Token Analytics - Only admins can read/write
CREATE POLICY "token_analytics_admin_only" ON token_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- User Tokens - Users can only see their own tokens
CREATE POLICY "user_tokens_own_data" ON user_tokens
    FOR ALL USING (user_id = auth.uid());

-- User Staking - Users can only see their own staking
CREATE POLICY "user_staking_own_data" ON user_staking
    FOR ALL USING (user_id = auth.uid());

-- Transactions - Users can only see their own transactions
CREATE POLICY "transactions_own_data" ON transactions
    FOR ALL USING (user_id = auth.uid());

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
CREATE TRIGGER update_token_analytics_updated_at 
    BEFORE UPDATE ON token_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tokens_updated_at 
    BEFORE UPDATE ON user_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_staking_updated_at 
    BEFORE UPDATE ON user_staking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update user token balance after transaction
CREATE OR REPLACE FUNCTION update_user_token_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_tokens table based on transaction
    INSERT INTO user_tokens (user_id, cmpx_balance, gtk_balance, last_updated_at)
    VALUES (
        NEW.user_id, 
        CASE WHEN NEW.token_type = 'cmpx' AND NEW.type = 'deposit' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.token_type = 'gtk' AND NEW.type = 'deposit' THEN NEW.amount ELSE 0 END,
        NEW.created_at
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        cmpx_balance = CASE 
            WHEN NEW.token_type = 'cmpx' AND NEW.type = 'deposit' THEN user_tokens.cmpx_balance + NEW.amount
            WHEN NEW.token_type = 'cmpx' AND NEW.type = 'withdrawal' THEN user_tokens.cmpx_balance - NEW.amount
            ELSE user_tokens.cmpx_balance
        END,
        gtk_balance = CASE 
            WHEN NEW.token_type = 'gtk' AND NEW.type = 'deposit' THEN user_tokens.gtk_balance + NEW.amount
            WHEN NEW.token_type = 'gtk' AND NEW.type = 'withdrawal' THEN user_tokens.gtk_balance - NEW.amount
            ELSE user_tokens.gtk_balance
        END,
        last_updated_at = NEW.created_at;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic balance updates
CREATE TRIGGER update_balance_after_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_token_balance();

-- =====================================================
-- 7. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample token analytics data
INSERT INTO token_analytics (
    period_type, period_start, period_end,
    total_cmpx_supply, total_gtk_supply,
    circulating_cmpx, circulating_gtk,
    transaction_count, transaction_volume_cmpx, transaction_volume_gtk,
    total_staked_cmpx, active_stakers,
    metadata
) VALUES (
    'daily',
    NOW() - INTERVAL '1 day',
    NOW(),
    1000000,
    500000,
    800000,
    450000,
    150,
    15000,
    7500,
    200000,
    50,
    '{"avgDuration": 30, "activeUsers": 500, "newUsers": 25}'::jsonb
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. VIEWS FOR ANALYTICS
-- =====================================================

-- View for current token metrics
CREATE OR REPLACE VIEW current_token_metrics AS
SELECT 
    SUM(cmpx_balance) as total_cmpx_balance,
    SUM(gtk_balance) as total_gtk_balance,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT CASE WHEN last_updated_at > NOW() - INTERVAL '24 hours' THEN user_id END) as active_users_24h
FROM user_tokens;

-- View for staking metrics
CREATE OR REPLACE VIEW staking_metrics AS
SELECT 
    COUNT(*) as total_staking_positions,
    SUM(staked_cmpx) as total_staked_amount,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_positions,
    COUNT(CASE WHEN is_active = false THEN 1 END) as completed_positions
FROM user_staking;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The TokenAnalyticsService can now use real database tables instead of mock data.
-- 
-- Tables created:
-- - token_analytics: Main analytics data
-- - user_tokens: User token balances
-- - user_staking: User staking information
-- - transactions: Token transaction history
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic balance updates after transactions
-- - Performance indexes
-- - Sample data and views
-- =====================================================
