-- Migración simple: Solo agregar columnas CMPX/GTK básicas
-- Fecha: 23/09/2025

-- Verificar y agregar columnas una por una
DO $$ 
BEGIN
    -- Agregar cmpx_balance si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'cmpx_balance') THEN
        ALTER TABLE public.user_tokens ADD COLUMN cmpx_balance INTEGER DEFAULT 0 NOT NULL;
    END IF;
    
    -- Agregar gtk_balance si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'gtk_balance') THEN
        ALTER TABLE public.user_tokens ADD COLUMN gtk_balance INTEGER DEFAULT 0 NOT NULL;
    END IF;
    
    -- Agregar cmpx_staked si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'cmpx_staked') THEN
        ALTER TABLE public.user_tokens ADD COLUMN cmpx_staked INTEGER DEFAULT 0 NOT NULL;
    END IF;
    
    -- Agregar monthly_earned si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'monthly_earned') THEN
        ALTER TABLE public.user_tokens ADD COLUMN monthly_earned INTEGER DEFAULT 0 NOT NULL;
    END IF;
    
    -- Agregar monthly_limit si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'monthly_limit') THEN
        ALTER TABLE public.user_tokens ADD COLUMN monthly_limit INTEGER DEFAULT 500 NOT NULL;
    END IF;
    
    -- Agregar total_referrals si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'total_referrals') THEN
        ALTER TABLE public.user_tokens ADD COLUMN total_referrals INTEGER DEFAULT 0 NOT NULL;
    END IF;
    
    -- Agregar world_id_verified si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'world_id_verified') THEN
        ALTER TABLE public.user_tokens ADD COLUMN world_id_verified BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
    
    -- Agregar world_id_claimed si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'world_id_claimed') THEN
        ALTER TABLE public.user_tokens ADD COLUMN world_id_claimed BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
    
    -- Agregar last_reset_date si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tokens' AND column_name = 'last_reset_date') THEN
        ALTER TABLE public.user_tokens ADD COLUMN last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    END IF;
END $$;

-- Eliminar tabla user_token_balances si existe y crear vista
DROP TABLE IF EXISTS public.user_token_balances;

-- Crear vista simple
CREATE OR REPLACE VIEW public.user_token_balances AS
SELECT 
    user_id,
    cmpx_balance,
    gtk_balance,
    cmpx_staked,
    total_referrals,
    world_id_verified,
    (monthly_limit - monthly_earned) as monthly_remaining,
    monthly_earned,
    monthly_limit,
    last_reset_date,
    world_id_claimed
FROM public.user_tokens
WHERE auth.uid() = user_id;

COMMENT ON VIEW public.user_token_balances IS 'Vista segura de balances de tokens CMPX/GTK por usuario';
