-- Migración para corregir triggers en vistas
-- Fecha: 06/09/2025
-- Descripción: Eliminar triggers problemáticos en vistas y asegurar que solo se apliquen a tablas

-- Eliminar cualquier trigger que pueda estar mal aplicado a la vista user_token_balances
DO $$
BEGIN
    -- Intentar eliminar triggers que puedan existir en la vista
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'user_token_balances'
    ) THEN
        -- Eliminar todos los triggers de la vista user_token_balances
        EXECUTE 'DROP TRIGGER IF EXISTS validate_token_modifications ON public.user_token_balances';
        EXECUTE 'DROP TRIGGER IF EXISTS audit_large_transactions ON public.user_token_balances';
        EXECUTE 'DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON public.user_token_balances';
    END IF;
END $$;

-- Asegurar que la vista user_token_balances existe correctamente
DROP VIEW IF EXISTS public.user_token_balances;

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

-- Las vistas no necesitan RLS ni políticas directas
-- La seguridad se maneja a través de la condición WHERE en la vista

COMMENT ON VIEW public.user_token_balances IS 'Vista segura de balances de tokens CMPX/GTK por usuario';
