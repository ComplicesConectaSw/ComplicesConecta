-- Add Premium subscription fields to profiles table
-- Migration: 20250830_add_premium_fields.sql

-- Add Stripe-related columns for Premium subscriptions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_plan TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_failed BOOLEAN DEFAULT false;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expires_at ON profiles(premium_expires_at);

-- Add comments for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID for Premium plans';
COMMENT ON COLUMN profiles.is_premium IS 'Whether user has active Premium subscription';
COMMENT ON COLUMN profiles.premium_plan IS 'Type of Premium plan: monthly, quarterly, yearly';
COMMENT ON COLUMN profiles.premium_expires_at IS 'When Premium subscription expires';
COMMENT ON COLUMN profiles.payment_failed IS 'Whether last payment attempt failed';
