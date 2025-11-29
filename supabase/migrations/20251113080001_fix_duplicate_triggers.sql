-- ComplicesConecta v3.7.0 - Fix Duplicate Triggers
-- Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
-- Descripción: Corregir triggers duplicados y funciones faltantes

-- =====================================================
-- CORREGIR TRIGGER DUPLICADO: trigger_update_club_ratings
-- =====================================================

-- Verificar/crear función (disponible aunque no exista la tabla)
CREATE OR REPLACE FUNCTION update_club_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar rating promedio del club
    UPDATE clubs 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM club_reviews 
            WHERE club_id = COALESCE(NEW.club_id, OLD.club_id) 
              AND verified = true
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM club_reviews 
            WHERE club_id = COALESCE(NEW.club_id, OLD.club_id) 
              AND verified = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.club_id, OLD.club_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'club_reviews'
    ) THEN
        -- Eliminar trigger duplicado si existe
        DROP TRIGGER IF EXISTS trigger_update_club_ratings ON club_reviews;

        -- Recrear trigger
        CREATE TRIGGER trigger_update_club_ratings
            AFTER INSERT OR UPDATE OR DELETE ON club_reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_club_ratings();
    ELSE
        RAISE NOTICE 'Tabla club_reviews no existe en este entorno; se omite fix de trigger.';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR Y CORREGIR OTRAS FUNCIONES FALTANTES
-- =====================================================

-- Función para limpiar solicitudes expiradas (si no existe)
CREATE OR REPLACE FUNCTION cleanup_expired_couple_requests()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE couple_nft_requests 
    SET status = 'expired'
    WHERE status = 'pending' 
      AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener claims diarios de un usuario (si no existe)
CREATE OR REPLACE FUNCTION get_user_daily_claims(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    token_type TEXT,
    amount_claimed DECIMAL(20,8),
    remaining_limit DECIMAL(20,8)
) AS $$
DECLARE
    daily_limit CONSTANT DECIMAL(20,8) := 2500000.0; -- 2.5M tokens (1% del pool)
BEGIN
    RETURN QUERY
    SELECT 
        dtc.token_type,
        COALESCE(SUM(dtc.amount_claimed), 0) as amount_claimed,
        daily_limit - COALESCE(SUM(dtc.amount_claimed), 0) as remaining_limit
    FROM daily_token_claims dtc
    WHERE dtc.user_id = p_user_id 
      AND dtc.claim_date = p_date
    GROUP BY dtc.token_type
    
    UNION ALL
    
    -- Incluir tipos de token que no han sido reclamados
    SELECT 
        token_types.token_type,
        0::DECIMAL(20,8) as amount_claimed,
        daily_limit as remaining_limit
    FROM (VALUES ('CMPX'), ('GTK')) AS token_types(token_type)
    WHERE token_types.token_type NOT IN (
        SELECT DISTINCT dtc2.token_type 
        FROM daily_token_claims dtc2 
        WHERE dtc2.user_id = p_user_id 
          AND dtc2.claim_date = p_date
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAR COLUMNAS FALTANTES EN CLUBS
-- =====================================================

-- Agregar columnas de rating si no existen en la tabla clubs
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'clubs'
    ) THEN
        -- Agregar average_rating si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'clubs' AND column_name = 'average_rating') THEN
            ALTER TABLE clubs ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.0;
        END IF;
        
        -- Agregar total_reviews si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'clubs' AND column_name = 'total_reviews') THEN
            ALTER TABLE clubs ADD COLUMN total_reviews INTEGER DEFAULT 0;
        END IF;
    ELSE
        RAISE NOTICE 'Tabla clubs no existe en este entorno; se omite agregado de columnas.';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR TABLA USER_WALLETS EXISTE
-- =====================================================

-- Crear tabla user_wallets si no existe (requerida para RLS policies)
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'mumbai',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para user_wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_network ON user_wallets(network);

-- RLS para user_wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Política para user_wallets
DROP POLICY IF EXISTS "Users can manage their own wallets" ON user_wallets;
CREATE POLICY "Users can manage their own wallets" ON user_wallets
    USING (auth.uid() = user_id);

-- Trigger para updated_at en user_wallets
CREATE OR REPLACE FUNCTION update_user_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_wallets_updated_at ON user_wallets;
CREATE TRIGGER trigger_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_user_wallets_updated_at();

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las funciones se crearon correctamente
DO $$
BEGIN
    -- Verificar función update_club_ratings
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_club_ratings') THEN
        RAISE EXCEPTION 'Función update_club_ratings no se creó correctamente';
    END IF;
    
    -- Verificar función cleanup_expired_couple_requests
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_expired_couple_requests') THEN
        RAISE EXCEPTION 'Función cleanup_expired_couple_requests no se creó correctamente';
    END IF;
    
    -- Verificar función get_user_daily_claims
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_daily_claims') THEN
        RAISE EXCEPTION 'Función get_user_daily_claims no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Todas las funciones y triggers se crearon/corrigieron exitosamente';
END $$;
