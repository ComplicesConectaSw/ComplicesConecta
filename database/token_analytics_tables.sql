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
-- 2. USER TOKEN BALANCES TABLE
-- =====================================================
-- Create the table if it doesn't exist, or add missing columns if it does

-- Create user_token_balances table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cmpx_balance BIGINT NOT NULL DEFAULT 0,
    gtk_balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add missing columns to existing user_token_balances table if they don't exist
DO $$ 
BEGIN
    -- Add monthly_earned column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'monthly_earned') THEN
        ALTER TABLE user_token_balances ADD COLUMN monthly_earned BIGINT DEFAULT 0;
    END IF;
    
    -- Add monthly_limit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'monthly_limit') THEN
        ALTER TABLE user_token_balances ADD COLUMN monthly_limit BIGINT DEFAULT 1000;
    END IF;
    
    -- Add referral_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'referral_code') THEN
        ALTER TABLE user_token_balances ADD COLUMN referral_code VARCHAR(20) UNIQUE;
    END IF;
    
    -- Add referred_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'referred_by') THEN
        ALTER TABLE user_token_balances ADD COLUMN referred_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add total_referrals column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'total_referrals') THEN
        ALTER TABLE user_token_balances ADD COLUMN total_referrals INTEGER DEFAULT 0;
    END IF;
    
    -- Add world_id_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'world_id_verified') THEN
        ALTER TABLE user_token_balances ADD COLUMN world_id_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add last_reset_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_token_balances' AND column_name = 'last_reset_date') THEN
        ALTER TABLE user_token_balances ADD COLUMN last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for the existing table
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_cmpx_balance ON user_token_balances(cmpx_balance);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_gtk_balance ON user_token_balances(gtk_balance);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_referral_code ON user_token_balances(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_referred_by ON user_token_balances(referred_by);

-- =====================================================
-- 3. STAKING RECORDS TABLE
-- =====================================================
-- Create the table if it doesn't exist, or add missing columns if it does

-- Create staking_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS staking_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL DEFAULT 0,
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('CMPX', 'GTK')),
    apy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing staking_records table if they don't exist
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'staking_records' AND column_name = 'is_active') THEN
        ALTER TABLE staking_records ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add rewards_earned column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'staking_records' AND column_name = 'rewards_earned') THEN
        ALTER TABLE staking_records ADD COLUMN rewards_earned BIGINT DEFAULT 0;
    END IF;
    
    -- Add last_claimed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'staking_records' AND column_name = 'last_claimed_at') THEN
        ALTER TABLE staking_records ADD COLUMN last_claimed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create indexes for the existing table
CREATE INDEX IF NOT EXISTS idx_staking_records_user_id ON staking_records(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_records_status ON staking_records(status);
CREATE INDEX IF NOT EXISTS idx_staking_records_token_type ON staking_records(token_type);
CREATE INDEX IF NOT EXISTS idx_staking_records_start_date ON staking_records(start_date);
CREATE INDEX IF NOT EXISTS idx_staking_records_end_date ON staking_records(end_date);
CREATE INDEX IF NOT EXISTS idx_staking_records_is_active ON staking_records(is_active);

-- =====================================================
-- 4. TOKEN TRANSACTIONS TABLE
-- =====================================================
-- Create the table if it doesn't exist, or add missing columns if it does

-- Create token_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'reward', 'penalty')),
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('CMPX', 'GTK')),
    amount BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing token_transactions table if they don't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'token_transactions' AND column_name = 'status') THEN
        ALTER TABLE token_transactions ADD COLUMN status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'));
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'token_transactions' AND column_name = 'metadata') THEN
        ALTER TABLE token_transactions ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for the existing table
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_transaction_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_token_type ON token_transactions(token_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_transactions_status ON token_transactions(status);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE token_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Token Analytics - Only admins can read/write
DROP POLICY IF EXISTS "token_analytics_admin_only" ON token_analytics;
CREATE POLICY "token_analytics_admin_only" ON token_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- User Token Balances - Users can only see their own tokens
DROP POLICY IF EXISTS "user_token_balances_own_data" ON user_token_balances;
CREATE POLICY "user_token_balances_own_data" ON user_token_balances
    FOR ALL USING (user_id = auth.uid());

-- Staking Records - Users can only see their own staking
DROP POLICY IF EXISTS "staking_records_own_data" ON staking_records;
CREATE POLICY "staking_records_own_data" ON staking_records
    FOR ALL USING (user_id = auth.uid());

-- Token Transactions - Users can only see their own transactions
DROP POLICY IF EXISTS "token_transactions_own_data" ON token_transactions;
CREATE POLICY "token_transactions_own_data" ON token_transactions
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
DROP TRIGGER IF EXISTS update_token_analytics_updated_at ON token_analytics;
CREATE TRIGGER update_token_analytics_updated_at 
    BEFORE UPDATE ON token_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_token_balances_updated_at ON user_token_balances;
CREATE TRIGGER update_user_token_balances_updated_at 
    BEFORE UPDATE ON user_token_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staking_records_updated_at ON staking_records;
CREATE TRIGGER update_staking_records_updated_at 
    BEFORE UPDATE ON staking_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update user token balance after transaction
CREATE OR REPLACE FUNCTION update_user_token_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_token_balances table based on transaction
    INSERT INTO user_token_balances (user_id, cmpx_balance, gtk_balance, updated_at)
    VALUES (
        NEW.user_id, 
        CASE WHEN NEW.token_type = 'CMPX' AND NEW.transaction_type = 'deposit' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.token_type = 'GTK' AND NEW.transaction_type = 'deposit' THEN NEW.amount ELSE 0 END,
        NEW.created_at
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        cmpx_balance = CASE 
            WHEN NEW.token_type = 'CMPX' AND NEW.transaction_type = 'deposit' THEN user_token_balances.cmpx_balance + NEW.amount
            WHEN NEW.token_type = 'CMPX' AND NEW.transaction_type = 'withdrawal' THEN user_token_balances.cmpx_balance - NEW.amount
            ELSE user_token_balances.cmpx_balance
        END,
        gtk_balance = CASE 
            WHEN NEW.token_type = 'GTK' AND NEW.transaction_type = 'deposit' THEN user_token_balances.gtk_balance + NEW.amount
            WHEN NEW.token_type = 'GTK' AND NEW.transaction_type = 'withdrawal' THEN user_token_balances.gtk_balance - NEW.amount
            ELSE user_token_balances.gtk_balance
        END,
        updated_at = NEW.created_at;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic balance updates
DROP TRIGGER IF EXISTS update_balance_after_transaction ON token_transactions;
CREATE TRIGGER update_balance_after_transaction
    AFTER INSERT ON token_transactions
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
    COUNT(DISTINCT CASE WHEN updated_at > NOW() - INTERVAL '24 hours' THEN user_id END) as active_users_24h
FROM user_token_balances;

-- View for staking metrics
CREATE OR REPLACE VIEW staking_metrics AS
SELECT 
    COUNT(*) as total_staking_positions,
    SUM(amount) as total_staked_amount,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_positions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_positions
FROM staking_records;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- All tables and functions have been created successfully!
-- The TokenAnalyticsService can now use real database tables instead of mock data.
-- 
-- Tables used:
-- - token_analytics: Main analytics data (new)
-- - user_token_balances: User token balances (existing, enhanced)
-- - staking_records: User staking information (existing, enhanced)
-- - token_transactions: Token transaction history (existing, enhanced)
--
-- Features included:
-- - Row Level Security (RLS) policies
-- - Automatic timestamp updates
-- - Automatic balance updates after transactions
-- - Performance indexes
-- - Sample data and views
-- =====================================================
