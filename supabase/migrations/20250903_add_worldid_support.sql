-- Migration: Add World ID support to existing token system
-- Date: 2025-09-03
-- Purpose: Extend current CMPX token system with World ID verification

-- Extend user_token_balances table for World ID support
ALTER TABLE user_token_balances 
ADD COLUMN IF NOT EXISTS worldid_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS worldid_nullifier_hash text UNIQUE,
ADD COLUMN IF NOT EXISTS worldid_verified_at timestamptz;

-- Extend referral_rewards table for verification method tracking
ALTER TABLE referral_rewards 
ADD COLUMN IF NOT EXISTS verification_method text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS worldid_proof jsonb;

-- Create index for World ID lookups
CREATE INDEX IF NOT EXISTS idx_user_token_balances_worldid_verified 
ON user_token_balances(worldid_verified);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_nullifier_hash 
ON user_token_balances(worldid_nullifier_hash);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_verification_method 
ON referral_rewards(verification_method);

-- Function to process World ID verification reward
CREATE OR REPLACE FUNCTION process_worldid_verification_reward(
  p_user_id uuid,
  p_nullifier_hash text,
  p_proof jsonb,
  p_invited_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_verification boolean;
  v_current_month_start date;
  v_monthly_rewards integer;
  v_max_monthly_limit integer := 500;
  v_worldid_reward integer := 100;
  v_referral_reward integer := 50;
  v_result jsonb;
BEGIN
  -- Check if nullifier hash already exists (prevent double verification)
  SELECT worldid_verified INTO v_existing_verification
  FROM user_token_balances 
  WHERE worldid_nullifier_hash = p_nullifier_hash;
  
  IF v_existing_verification IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ALREADY_VERIFIED',
      'message', 'This World ID has already been used for verification'
    );
  END IF;

  -- Check monthly limits for user
  v_current_month_start := date_trunc('month', CURRENT_DATE);
  
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_monthly_rewards
  FROM referral_rewards 
  WHERE user_id = p_user_id 
    AND created_at >= v_current_month_start;

  IF v_monthly_rewards + v_worldid_reward > v_max_monthly_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'MONTHLY_LIMIT_EXCEEDED',
      'message', 'Monthly reward limit would be exceeded',
      'current_rewards', v_monthly_rewards,
      'limit', v_max_monthly_limit
    );
  END IF;

  -- Update user_token_balances with World ID verification
  UPDATE user_token_balances 
  SET 
    worldid_verified = true,
    worldid_nullifier_hash = p_nullifier_hash,
    worldid_verified_at = NOW(),
    cmpx_balance = cmpx_balance + v_worldid_reward,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Insert World ID verification reward
  INSERT INTO referral_rewards (
    user_id,
    reward_amount,
    reward_type,
    verification_method,
    worldid_proof,
    created_at
  ) VALUES (
    p_user_id,
    v_worldid_reward,
    'worldid_verification',
    'worldid',
    p_proof,
    NOW()
  );

  -- Process referral reward if invited_by is provided
  IF p_invited_by IS NOT NULL THEN
    -- Check monthly limits for referrer
    SELECT COALESCE(SUM(reward_amount), 0) INTO v_monthly_rewards
    FROM referral_rewards 
    WHERE user_id = p_invited_by 
      AND created_at >= v_current_month_start;

    IF v_monthly_rewards + v_referral_reward <= v_max_monthly_limit THEN
      -- Update referrer balance
      UPDATE user_token_balances 
      SET 
        cmpx_balance = cmpx_balance + v_referral_reward,
        updated_at = NOW()
      WHERE user_id = p_invited_by;

      -- Insert referral reward
      INSERT INTO referral_rewards (
        user_id,
        referred_user_id,
        reward_amount,
        reward_type,
        verification_method,
        created_at
      ) VALUES (
        p_invited_by,
        p_user_id,
        v_referral_reward,
        'worldid_referral',
        'worldid',
        NOW()
      );
    END IF;
  END IF;

  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'worldid_reward', v_worldid_reward,
    'referral_reward', CASE WHEN p_invited_by IS NOT NULL THEN v_referral_reward ELSE 0 END,
    'verification_method', 'worldid',
    'verified_at', NOW()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to get World ID verification stats
CREATE OR REPLACE FUNCTION get_worldid_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_verified integer;
  v_total_rewards integer;
  v_monthly_verified integer;
  v_monthly_rewards integer;
  v_current_month_start date;
BEGIN
  v_current_month_start := date_trunc('month', CURRENT_DATE);

  -- Get total World ID verifications
  SELECT COUNT(*) INTO v_total_verified
  FROM user_token_balances 
  WHERE worldid_verified = true;

  -- Get total World ID rewards distributed
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_total_rewards
  FROM referral_rewards 
  WHERE verification_method = 'worldid';

  -- Get monthly World ID verifications
  SELECT COUNT(*) INTO v_monthly_verified
  FROM user_token_balances 
  WHERE worldid_verified = true 
    AND worldid_verified_at >= v_current_month_start;

  -- Get monthly World ID rewards
  SELECT COALESCE(SUM(reward_amount), 0) INTO v_monthly_rewards
  FROM referral_rewards 
  WHERE verification_method = 'worldid'
    AND created_at >= v_current_month_start;

  RETURN jsonb_build_object(
    'total_verified', v_total_verified,
    'total_rewards', v_total_rewards,
    'monthly_verified', v_monthly_verified,
    'monthly_rewards', v_monthly_rewards,
    'current_month', v_current_month_start
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION process_worldid_verification_reward TO authenticated;
GRANT EXECUTE ON FUNCTION get_worldid_stats TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN user_token_balances.worldid_verified IS 'Whether user has verified with World ID';
COMMENT ON COLUMN user_token_balances.worldid_nullifier_hash IS 'Unique World ID nullifier hash to prevent double verification';
COMMENT ON COLUMN user_token_balances.worldid_verified_at IS 'Timestamp when World ID verification was completed';
COMMENT ON COLUMN referral_rewards.verification_method IS 'Method used for verification: standard, worldid';
COMMENT ON COLUMN referral_rewards.worldid_proof IS 'World ID proof data for verification tracking';
