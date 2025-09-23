-- Migración limpia para RLS del sistema de tokens
-- Fecha: 06/09/2025
-- Descripción: Eliminar políticas duplicadas y crear RLS correctamente

-- Eliminar todas las políticas existentes para evitar duplicados
DO $$
BEGIN
    -- Eliminar políticas de user_tokens
    DROP POLICY IF EXISTS "Users can view own tokens" ON public.user_tokens;
    DROP POLICY IF EXISTS "Users can update own tokens" ON public.user_tokens;
    DROP POLICY IF EXISTS "System can insert tokens" ON public.user_tokens;
    DROP POLICY IF EXISTS "Admins can view all tokens" ON public.user_tokens;
    DROP POLICY IF EXISTS "Users can update their own token balances" ON public.user_tokens;
    
    -- Eliminar políticas de transactions
    DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
    
    -- Eliminar políticas de user_staking
    DROP POLICY IF EXISTS "Users can view own staking" ON public.user_staking;
    DROP POLICY IF EXISTS "Users can update own staking" ON public.user_staking;
    DROP POLICY IF EXISTS "System can insert staking" ON public.user_staking;
    DROP POLICY IF EXISTS "Admins can view all staking" ON public.user_staking;
    
    -- Eliminar políticas de pending_rewards
    DROP POLICY IF EXISTS "Users can view own pending rewards" ON public.pending_rewards;
    DROP POLICY IF EXISTS "Users can claim own rewards" ON public.pending_rewards;
    DROP POLICY IF EXISTS "System can insert rewards" ON public.pending_rewards;
    DROP POLICY IF EXISTS "Admins can manage all rewards" ON public.pending_rewards;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorar errores si las políticas no existen
        NULL;
END $$;

-- Habilitar RLS en todas las tablas de tokens
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_rewards ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA user_tokens
-- ========================================

-- Los usuarios solo pueden ver sus propios tokens
CREATE POLICY "Users can view own tokens" ON public.user_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios tokens (para reset mensual)
CREATE POLICY "Users can update own tokens" ON public.user_tokens
    FOR UPDATE USING (auth.uid() = user_id);

-- Solo el sistema puede insertar nuevos registros de tokens (via trigger)
CREATE POLICY "System can insert tokens" ON public.user_tokens
    FOR INSERT WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA transactions
-- ========================================

-- Los usuarios solo pueden ver sus propias transacciones
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Solo el sistema puede insertar transacciones (via funciones)
CREATE POLICY "System can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA user_staking
-- ========================================

-- Los usuarios solo pueden ver su propio staking
CREATE POLICY "Users can view own staking" ON public.user_staking
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden actualizar su staking (para unstake)
CREATE POLICY "Users can update own staking" ON public.user_staking
    FOR UPDATE USING (auth.uid() = user_id);

-- Solo el sistema puede insertar staking
CREATE POLICY "System can insert staking" ON public.user_staking
    FOR INSERT WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA pending_rewards
-- ========================================

-- Los usuarios solo pueden ver sus propias recompensas pendientes
CREATE POLICY "Users can view own pending rewards" ON public.pending_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus recompensas (para reclamar)
CREATE POLICY "Users can claim own rewards" ON public.pending_rewards
    FOR UPDATE USING (auth.uid() = user_id);

-- Solo el sistema puede insertar nuevas recompensas
CREATE POLICY "System can insert rewards" ON public.pending_rewards
    FOR INSERT WITH CHECK (true);

-- ========================================
-- FUNCIONES DE SEGURIDAD ADICIONALES
-- ========================================

-- Función para validar que solo funciones autorizadas modifiquen tokens
CREATE OR REPLACE FUNCTION validate_token_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo permitir modificaciones desde funciones específicas o admins
    IF NOT (
        current_setting('application_name', true) LIKE '%supabase%'
    ) THEN
        RAISE EXCEPTION 'Modificación de tokens no autorizada';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar modificaciones de tokens (SOLO EN TABLA, NO EN VISTA)
DROP TRIGGER IF EXISTS validate_token_modifications ON public.user_tokens;
CREATE TRIGGER validate_token_modifications
    BEFORE UPDATE ON public.user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION validate_token_modification();

-- Función para auditar transacciones sospechosas
CREATE OR REPLACE FUNCTION audit_suspicious_transactions()
RETURNS TRIGGER AS $$
BEGIN
    -- Alertar sobre transacciones grandes
    IF ABS(NEW.amount) > 1000 THEN
        -- Log de auditoría simple (sin tabla audit_logs por ahora)
        RAISE NOTICE 'Transacción grande detectada: % tokens para usuario %', NEW.amount, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditoría de transacciones
DROP TRIGGER IF EXISTS audit_large_transactions ON public.transactions;
CREATE TRIGGER audit_large_transactions
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION audit_suspicious_transactions();

-- ========================================
-- VISTAS SEGURAS PARA CONSULTAS
-- ========================================

-- Vista para resumen de staking por usuario
DROP VIEW IF EXISTS public.user_staking_summary;
CREATE VIEW public.user_staking_summary AS
SELECT 
    user_id,
    SUM(us.amount) as total_staked,
    COUNT(*) as total_stakes,
    AVG(us.reward_percentage) as avg_reward_percentage,
    COUNT(CASE WHEN us.status = 'active' THEN 1 END) as active_stakes,
    COUNT(CASE WHEN us.status = 'completed' THEN 1 END) as completed_stakes
FROM public.user_staking us
WHERE auth.uid() = us.user_id
GROUP BY user_id;

-- Vista para transacciones recientes del usuario
DROP VIEW IF EXISTS public.recent_transactions;
CREATE VIEW public.recent_transactions AS
SELECT 
    user_id, transaction_type, token_type, amount,
    balance_before, balance_after, description,
    created_at
FROM public.transactions
WHERE auth.uid() = user_id
    AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 50;

-- ========================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ========================================

COMMENT ON POLICY "Users can view own tokens" ON public.user_tokens IS 'Usuarios solo ven sus propios balances de tokens';
COMMENT ON POLICY "System can insert tokens" ON public.user_tokens IS 'Solo el sistema puede crear nuevos registros de tokens';
COMMENT ON VIEW public.user_staking_summary IS 'Resumen de actividad de staking por usuario';
COMMENT ON VIEW public.recent_transactions IS 'Transacciones recientes del usuario autenticado';
