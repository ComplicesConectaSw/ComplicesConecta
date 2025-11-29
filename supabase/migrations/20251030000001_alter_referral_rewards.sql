-- =====================================================
-- MIGRACIÓN: Agregar campos faltantes a referral_rewards
-- Descripción: Agregar campos WorldID a tabla existente
-- Fecha: 2025-01-30
-- Versión: v3.4.1
-- =====================================================

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Agregar campos faltantes si no existen
DO $$ 
BEGIN
    -- verification_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_rewards' AND column_name='verification_method') THEN
        ALTER TABLE public.referral_rewards ADD COLUMN verification_method TEXT;
    END IF;
    
    -- worldid_proof
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_rewards' AND column_name='worldid_proof') THEN
        ALTER TABLE public.referral_rewards ADD COLUMN worldid_proof JSONB;
    END IF;
END $$;

-- Crear índice si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_referral_rewards_verification_method') THEN
        CREATE INDEX idx_referral_rewards_verification_method ON public.referral_rewards(verification_method);
    END IF;
    
    RAISE NOTICE '✅ Campos WorldID agregados a referral_rewards';
END $$;

