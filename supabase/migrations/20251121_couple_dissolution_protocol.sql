-- =====================================================
-- MIGRACIÓN: Protocolo de Disolución de Parejas - Cuenta Regresiva
-- Versión: v3.7.2 - Legal Engineer Implementation
-- Fecha: 21 Noviembre 2025
-- Propósito: Sistema de congelamiento y disolución automática (72h)
-- =====================================================

-- 1. ACTUALIZAR TABLA DE PERFILES DE PAREJA
-- Agregar estado de cuenta para control de disputas
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' 
CHECK (status IN ('ACTIVE', 'FROZEN_DISPUTE', 'DISSOLVED'));

-- Índice para consultas de estado
CREATE INDEX IF NOT EXISTS idx_couple_profiles_status 
ON couple_profiles(status) 
WHERE status != 'ACTIVE';

-- 2. ACTUALIZAR TABLA DE WALLETS DE USUARIO
-- Agregar flag de congelamiento para bloquear transacciones
ALTER TABLE user_wallets 
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN NOT NULL DEFAULT false;

-- Índice para wallets congeladas
CREATE INDEX IF NOT EXISTS idx_user_wallets_frozen 
ON user_wallets(is_frozen) 
WHERE is_frozen = true;

-- 3. TABLA DE DISPUTAS DE PAREJA (CUENTA REGRESIVA)
CREATE TABLE IF NOT EXISTS couple_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    
    -- Quién inició la disolución
    initiated_by UUID NOT NULL REFERENCES profiles(id),
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Snapshot de activos congelados (evidencia)
    frozen_assets_snapshot JSONB NOT NULL DEFAULT '{}',
    
    -- Estados del proceso de disolución
    status TEXT NOT NULL DEFAULT 'PENDING_AGREEMENT' 
        CHECK (status IN ('PENDING_AGREEMENT', 'RESOLVED_TRANSFERRED', 'EXPIRED_FORFEITED')),
    
    -- Cronómetro de 72 horas
    deadline_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
    
    -- Propuestas de resolución
    proposed_winner_id UUID REFERENCES profiles(id),
    proposed_at TIMESTAMPTZ,
    winner_accepted_by UUID REFERENCES profiles(id),
    accepted_at TIMESTAMPTZ,
    
    -- Resolución final
    final_winner_id UUID REFERENCES profiles(id),
    assets_transferred_at TIMESTAMPTZ,
    forfeited_to_platform_at TIMESTAMPTZ,
    
    -- Metadatos
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE ACTIVOS CONGELADOS (DETALLE)
CREATE TABLE IF NOT EXISTS frozen_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES couple_disputes(id) ON DELETE CASCADE,
    
    -- Identificación del activo
    asset_type TEXT NOT NULL CHECK (asset_type IN ('CMPX_TOKEN', 'GTK_TOKEN', 'NFT')),
    asset_id TEXT, -- Para NFTs
    amount DECIMAL(18,8), -- Para tokens
    
    -- Estado del congelamiento
    is_frozen BOOLEAN NOT NULL DEFAULT true,
    frozen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unfrozen_at TIMESTAMPTZ,
    
    -- Propietario original
    original_owner_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Transferencia final
    transferred_to_id UUID REFERENCES profiles(id),
    transferred_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ÍNDICES PARA PERFORMANCE Y CONSULTAS CRÍTICAS

-- Disputas activas por deadline (solo si existe la columna status)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'couple_disputes'
          AND column_name = 'status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_couple_disputes_active_deadline 
        ON couple_disputes(deadline_at, status) 
        WHERE status = 'PENDING_AGREEMENT';
    ELSE
        RAISE NOTICE '⚠️ Columna status no existe en couple_disputes; se omite índice idx_couple_disputes_active_deadline.';
    END IF;
END $$;

-- Disputas por pareja (solo si existen las columnas couple_id/status)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'couple_disputes'
          AND column_name = 'couple_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'couple_disputes'
          AND column_name = 'status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_couple_disputes_couple 
        ON couple_disputes(couple_id, status);
    ELSE
        RAISE NOTICE '⚠️ Columnas couple_id/status no existen en couple_disputes; se omite índice idx_couple_disputes_couple.';
    END IF;
END $$;

-- Activos congelados por disputa
CREATE INDEX IF NOT EXISTS idx_frozen_assets_dispute 
ON frozen_assets(dispute_id, is_frozen);

-- Activos por propietario
CREATE INDEX IF NOT EXISTS idx_frozen_assets_owner 
ON frozen_assets(original_owner_id, asset_type);

-- 6. TRIGGERS PARA AUTOMATIZACIÓN DEL PROTOCOLO

-- Trigger: Auto-actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION update_couple_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_couple_disputes_updated_at
    BEFORE UPDATE ON couple_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_couple_disputes_updated_at();

-- Trigger: Congelar wallets automáticamente al crear disputa
CREATE OR REPLACE FUNCTION freeze_wallets_on_dispute()
RETURNS TRIGGER AS $$
DECLARE
    partner1_id UUID;
    partner2_id UUID;
BEGIN
    -- Obtener IDs de los partners
    SELECT partner_1_id, partner_2_id 
    INTO partner1_id, partner2_id
    FROM couple_profiles 
    WHERE id = NEW.couple_id;
    
    -- Congelar wallets de ambos partners
    UPDATE user_wallets 
    SET is_frozen = true 
    WHERE user_id IN (partner1_id, partner2_id);
    
    -- Cambiar estado de la pareja a FROZEN_DISPUTE
    UPDATE couple_profiles 
    SET status = 'FROZEN_DISPUTE' 
    WHERE id = NEW.couple_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_freeze_on_dispute_creation
    AFTER INSERT ON couple_disputes
    FOR EACH ROW
    EXECUTE FUNCTION freeze_wallets_on_dispute();

-- Trigger: Procesar acuerdo cuando ambos aceptan
CREATE OR REPLACE FUNCTION process_agreement_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- Si hay propuesta y aceptación, marcar como resuelto
    IF NEW.proposed_winner_id IS NOT NULL AND NEW.winner_accepted_by IS NOT NULL THEN
        NEW.status = 'RESOLVED_TRANSFERRED';
        NEW.final_winner_id = NEW.proposed_winner_id;
        NEW.assets_transferred_at = NOW();
        
        -- Nota: La transferencia real de activos se hace en el servicio
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_agreement
    BEFORE UPDATE ON couple_disputes
    FOR EACH ROW
    EXECUTE FUNCTION process_agreement_on_acceptance();

-- 7. FUNCIONES DE UTILIDAD PARA EL PROTOCOLO

-- Función: Obtener disputas expiradas (para cron job)
CREATE OR REPLACE FUNCTION get_expired_disputes()
RETURNS TABLE (
    dispute_id UUID,
    couple_id UUID,
    deadline_at TIMESTAMPTZ,
    hours_expired NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.id as dispute_id,
        cd.couple_id,
        cd.deadline_at,
        EXTRACT(EPOCH FROM (NOW() - cd.deadline_at)) / 3600 as hours_expired
    FROM couple_disputes cd
    WHERE cd.status = 'PENDING_AGREEMENT'
      AND cd.deadline_at < NOW()
    ORDER BY cd.deadline_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener tiempo restante de una disputa
CREATE OR REPLACE FUNCTION get_dispute_time_remaining(p_dispute_id UUID)
RETURNS TABLE (
    hours_remaining INTEGER,
    minutes_remaining INTEGER,
    seconds_remaining INTEGER,
    is_expired BOOLEAN
) AS $$
DECLARE
    deadline TIMESTAMPTZ;
    remaining_seconds INTEGER;
BEGIN
    SELECT deadline_at INTO deadline
    FROM couple_disputes 
    WHERE id = p_dispute_id;
    
    IF deadline IS NULL THEN
        RETURN QUERY SELECT 0, 0, 0, true;
        RETURN;
    END IF;
    
    remaining_seconds := EXTRACT(EPOCH FROM (deadline - NOW()))::INTEGER;
    
    IF remaining_seconds <= 0 THEN
        RETURN QUERY SELECT 0, 0, 0, true;
    ELSE
        RETURN QUERY SELECT 
            remaining_seconds / 3600,
            (remaining_seconds % 3600) / 60,
            remaining_seconds % 60,
            false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función: Crear snapshot de activos para congelar
CREATE OR REPLACE FUNCTION create_assets_snapshot(p_couple_id UUID)
RETURNS JSONB AS $$
DECLARE
    partner1_id UUID;
    partner2_id UUID;
    snapshot JSONB := '{}';
    partner1_assets JSONB;
    partner2_assets JSONB;
BEGIN
    -- Obtener IDs de partners
    SELECT partner_1_id, partner_2_id 
    INTO partner1_id, partner2_id
    FROM couple_profiles 
    WHERE id = p_couple_id;
    
    -- Crear snapshot de activos de partner 1
    SELECT jsonb_build_object(
        'cmpx_balance', COALESCE(cmpx_balance, 0),
        'gtk_balance', COALESCE(gtk_balance, 0),
        'nfts_count', (
            SELECT COUNT(*) 
            FROM user_nfts 
            WHERE user_id = partner1_id AND is_active = true
        )
    ) INTO partner1_assets
    FROM user_wallets 
    WHERE user_id = partner1_id;
    
    -- Crear snapshot de activos de partner 2
    SELECT jsonb_build_object(
        'cmpx_balance', COALESCE(cmpx_balance, 0),
        'gtk_balance', COALESCE(gtk_balance, 0),
        'nfts_count', (
            SELECT COUNT(*) 
            FROM user_nfts 
            WHERE user_id = partner2_id AND is_active = true
        )
    ) INTO partner2_assets
    FROM user_wallets 
    WHERE user_id = partner2_id;
    
    -- Combinar snapshots
    snapshot := jsonb_build_object(
        'partner_1', jsonb_build_object(
            'user_id', partner1_id,
            'assets', COALESCE(partner1_assets, '{}'::jsonb)
        ),
        'partner_2', jsonb_build_object(
            'user_id', partner2_id,
            'assets', COALESCE(partner2_assets, '{}'::jsonb)
        ),
        'frozen_at', NOW(),
        'total_value_estimate', (
            COALESCE((partner1_assets->>'cmpx_balance')::numeric, 0) +
            COALESCE((partner2_assets->>'cmpx_balance')::numeric, 0) +
            COALESCE((partner1_assets->>'gtk_balance')::numeric, 0) +
            COALESCE((partner2_assets->>'gtk_balance')::numeric, 0)
        )
    );
    
    RETURN snapshot;
END;
$$ LANGUAGE plpgsql;

-- 8. POLÍTICAS RLS PARA SEGURIDAD

-- RLS para couple_disputes: Solo los partners pueden ver sus disputas
ALTER TABLE couple_disputes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Solo crear políticas si existen las columnas partner_1_id y partner_2_id en couple_profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'couple_profiles'
          AND column_name = 'partner_1_id'
    )
    AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'couple_profiles'
          AND column_name = 'partner_2_id'
    ) THEN

        -- Evitar duplicados de la política en re-ejecuciones
        DROP POLICY IF EXISTS "Partners can view own disputes" ON couple_disputes;

        CREATE POLICY "Partners can view own disputes" ON couple_disputes
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM couple_profiles cp 
                    WHERE cp.id = couple_id 
                      AND (cp.partner_1_id = auth.uid() OR cp.partner_2_id = auth.uid())
                )
            );

        CREATE POLICY "Partners can update own disputes" ON couple_disputes
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM couple_profiles cp 
                    WHERE cp.id = couple_id 
                      AND (cp.partner_1_id = auth.uid() OR cp.partner_2_id = auth.uid())
                )
            );

    ELSE
        RAISE NOTICE '⚠️ Columnas partner_1_id/partner_2_id no existen en couple_profiles; se omiten políticas de couple_disputes.';
    END IF;
END $$;

-- RLS para frozen_assets: Solo propietarios pueden ver
ALTER TABLE frozen_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own frozen assets" ON frozen_assets
    FOR SELECT USING (original_owner_id = auth.uid());

-- 9. COMENTARIOS PARA DOCUMENTACIÓN LEGAL

DO $$
BEGIN
    -- Comentarios sobre couple_disputes: solo si existen las columnas esperadas
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'couple_disputes'
    ) THEN
        COMMENT ON TABLE couple_disputes IS 'Protocolo de disolución de parejas con cuenta regresiva de 72 horas';

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'couple_disputes'
              AND column_name = 'deadline_at'
        ) THEN
            COMMENT ON COLUMN couple_disputes.deadline_at IS 'Timestamp límite para acuerdo (72h desde inicio)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'couple_disputes'
              AND column_name = 'frozen_assets_snapshot'
        ) THEN
            COMMENT ON COLUMN couple_disputes.frozen_assets_snapshot IS 'Snapshot JSONB de activos congelados como evidencia';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'couple_disputes'
              AND column_name = 'status'
        ) THEN
            COMMENT ON COLUMN couple_disputes.status IS 'PENDING_AGREEMENT: esperando acuerdo, RESOLVED_TRANSFERRED: resuelto, EXPIRED_FORFEITED: confiscado';
        END IF;
    END IF;

    -- Comentarios sobre frozen_assets: solo si existe la tabla
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'frozen_assets'
    ) THEN
        COMMENT ON TABLE frozen_assets IS 'Detalle de activos individuales congelados durante disputa';

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'frozen_assets'
              AND column_name = 'asset_type'
        ) THEN
            COMMENT ON COLUMN frozen_assets.asset_type IS 'Tipo: CMPX_TOKEN, GTK_TOKEN, NFT';
        END IF;
    END IF;
END $$;

COMMENT ON FUNCTION get_expired_disputes() IS 'Obtiene disputas vencidas para procesamiento automático (cron job)';
COMMENT ON FUNCTION get_dispute_time_remaining(UUID) IS 'Calcula tiempo restante en formato HH:MM:SS para UI';
COMMENT ON FUNCTION create_assets_snapshot(UUID) IS 'Crea snapshot JSONB de activos de pareja para congelar';

-- 10. DATOS DE CONFIGURACIÓN

DO $$
BEGIN
    -- Insertar configuración del sistema para el protocolo solo si existe app_config
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'app_config'
    ) THEN
        INSERT INTO app_config (key, value, description) VALUES 
        ('DISSOLUTION_GRACE_PERIOD_HOURS', '72', 'Horas de gracia para resolver disputas de pareja')
        ON CONFLICT (key) DO UPDATE SET 
            value = EXCLUDED.value,
            updated_at = NOW();

        INSERT INTO app_config (key, value, description) VALUES 
        ('DISSOLUTION_CRON_ENABLED', 'true', 'Habilitar procesamiento automático de disputas expiradas')
        ON CONFLICT (key) DO UPDATE SET 
            value = EXCLUDED.value,
            updated_at = NOW();
    ELSE
        RAISE NOTICE '⚠️ Tabla app_config no existe; se omite configuración del protocolo de disolución.';
    END IF;
END $$;

-- =====================================================
-- FIN DE MIGRACIÓN - PROTOCOLO DE DISOLUCIÓN IMPLEMENTADO
-- =====================================================
