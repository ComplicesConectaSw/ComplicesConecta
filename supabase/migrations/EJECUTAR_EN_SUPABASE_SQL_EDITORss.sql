-- =====================================================
-- EJECUTAR ESTE SQL DIRECTAMENTE EN SUPABASE SQL EDITOR
-- ComplicesConecta v3.7.0 - Solución Definitiva Blockchain
-- Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
-- =====================================================

-- PASO 1: ELIMINAR TODOS LOS TRIGGERS PROBLEMÁTICOS
DROP TRIGGER IF EXISTS trigger_update_club_ratings ON club_reviews;
DROP TRIGGER IF EXISTS trigger_couple_nft_requests_updated_at ON couple_nft_requests;
DROP TRIGGER IF EXISTS trigger_user_nfts_updated_at ON user_nfts;
DROP TRIGGER IF EXISTS trigger_user_wallets_updated_at ON user_wallets;

-- PASO 2: CREAR TABLAS BLOCKCHAIN SI NO EXISTEN

-- Tabla: couple_nft_requests
CREATE TABLE IF NOT EXISTS couple_nft_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id BIGINT NOT NULL,
    partner1_address TEXT NOT NULL,
    partner2_address TEXT NOT NULL,
    initiator_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    consent1_timestamp TIMESTAMPTZ,
    consent2_timestamp TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'minted', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabla: daily_token_claims (crear o actualizar)
CREATE TABLE IF NOT EXISTS daily_token_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_claimed DECIMAL(20,8) NOT NULL CHECK (amount_claimed > 0),
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_hash TEXT,
    network TEXT DEFAULT 'mumbai',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agregar columnas faltantes a daily_token_claims si no existen
DO $$ 
BEGIN
    -- Agregar network si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'daily_token_claims' AND column_name = 'network') THEN
        ALTER TABLE daily_token_claims ADD COLUMN network TEXT DEFAULT 'mumbai';
    END IF;
    
    -- Agregar token_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'daily_token_claims' AND column_name = 'token_type') THEN
        ALTER TABLE daily_token_claims ADD COLUMN token_type TEXT DEFAULT 'CMPX';
    END IF;
END $$;

-- Agregar constraints para daily_token_claims si no existen
DO $$
BEGIN
    -- Check constraint para token_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'daily_token_claims_token_type_check') THEN
        ALTER TABLE daily_token_claims ADD CONSTRAINT daily_token_claims_token_type_check 
            CHECK (token_type IN ('CMPX', 'GTK'));
    END IF;
    
    -- Unique constraint para user_id, claim_date, token_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'daily_token_claims_unique_user_date_type') THEN
        ALTER TABLE daily_token_claims ADD CONSTRAINT daily_token_claims_unique_user_date_type 
            UNIQUE(user_id, claim_date, token_type);
    END IF;
END $$;

-- Tabla: user_nfts
CREATE TABLE IF NOT EXISTS user_nfts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id BIGINT NOT NULL,
    owner_address TEXT NOT NULL,
    metadata_uri TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_couple BOOLEAN NOT NULL DEFAULT FALSE,
    partner_address TEXT,
    contract_address TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    network TEXT NOT NULL DEFAULT 'mumbai',
    name TEXT,
    description TEXT,
    image_url TEXT,
    attributes JSONB DEFAULT '[]'::jsonb,
    is_staked BOOLEAN DEFAULT FALSE,
    staked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_couple_nft_partner CHECK (NOT is_couple OR partner_address IS NOT NULL)
);

-- Tabla: user_wallets
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'mumbai',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PASO 3: ACTUALIZAR testnet_token_claims CON COLUMNAS FALTANTES
DO $$ 
BEGIN
    -- Agregar wallet_address si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testnet_token_claims' AND column_name = 'wallet_address') THEN
        ALTER TABLE testnet_token_claims ADD COLUMN wallet_address TEXT;
    END IF;
    
    -- Agregar network si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testnet_token_claims' AND column_name = 'network') THEN
        ALTER TABLE testnet_token_claims ADD COLUMN network TEXT DEFAULT 'mumbai';
    END IF;
    
    -- Agregar token_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testnet_token_claims' AND column_name = 'token_type') THEN
        ALTER TABLE testnet_token_claims ADD COLUMN token_type TEXT DEFAULT 'CMPX';
    END IF;
END $$;

-- PASO 4: CREAR ÍNDICES OPTIMIZADOS
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_partner1 ON couple_nft_requests(partner1_address);
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_partner2 ON couple_nft_requests(partner2_address);
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_status ON couple_nft_requests(status);
CREATE INDEX IF NOT EXISTS idx_couple_nft_requests_expires ON couple_nft_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_daily_token_claims_user_date ON daily_token_claims(user_id, claim_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_token_claims_date ON daily_token_claims(claim_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_token_claims_token_type ON daily_token_claims(token_type);

CREATE INDEX IF NOT EXISTS idx_user_nfts_owner ON user_nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_user_nfts_token_id ON user_nfts(token_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_couple ON user_nfts(is_couple);
CREATE INDEX IF NOT EXISTS idx_user_nfts_rarity ON user_nfts(rarity);
CREATE INDEX IF NOT EXISTS idx_user_nfts_staked ON user_nfts(is_staked);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_network ON user_wallets(network);

CREATE INDEX IF NOT EXISTS idx_testnet_token_claims_user ON testnet_token_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_testnet_token_claims_wallet ON testnet_token_claims(wallet_address) 
    WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_testnet_token_claims_claimed ON testnet_token_claims(claimed_at DESC);

-- PASO 5: CREAR FUNCIONES AUXILIARES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_club_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si la tabla clubs tiene las columnas necesarias
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'average_rating') THEN
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
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

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

-- PASO 6: CREAR TRIGGERS SIN CONFLICTOS
CREATE TRIGGER trigger_couple_nft_requests_updated_at
    BEFORE UPDATE ON couple_nft_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_nfts_updated_at
    BEFORE UPDATE ON user_nfts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para club ratings (solo si la tabla existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'club_reviews') THEN
        CREATE TRIGGER trigger_update_club_ratings
            AFTER INSERT OR UPDATE OR DELETE ON club_reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_club_ratings();
    END IF;
END $$;

-- PASO 7: HABILITAR RLS Y CREAR POLÍTICAS
ALTER TABLE couple_nft_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testnet_token_claims ENABLE ROW LEVEL SECURITY;

-- Políticas para couple_nft_requests
DROP POLICY IF EXISTS "Users can view their couple NFT requests" ON couple_nft_requests;
CREATE POLICY "Users can view their couple NFT requests" ON couple_nft_requests
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT user_id::text FROM user_wallets 
            WHERE address IN (partner1_address, partner2_address)
        )
    );

DROP POLICY IF EXISTS "Users can create couple NFT requests" ON couple_nft_requests;
CREATE POLICY "Users can create couple NFT requests" ON couple_nft_requests
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT user_id::text FROM user_wallets 
            WHERE address = initiator_address
        )
    );

-- Políticas para daily_token_claims
DROP POLICY IF EXISTS "Users can view their daily claims" ON daily_token_claims;
CREATE POLICY "Users can view their daily claims" ON daily_token_claims
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their daily claims" ON daily_token_claims;
CREATE POLICY "Users can create their daily claims" ON daily_token_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_nfts
DROP POLICY IF EXISTS "Users can view their NFTs" ON user_nfts;
CREATE POLICY "Users can view their NFTs" ON user_nfts
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT user_id::text FROM user_wallets 
            WHERE address IN (owner_address, partner_address)
        )
    );

-- Políticas para user_wallets
DROP POLICY IF EXISTS "Users can manage their own wallets" ON user_wallets;
CREATE POLICY "Users can manage their own wallets" ON user_wallets
    USING (auth.uid() = user_id);

-- Políticas para testnet_token_claims
DROP POLICY IF EXISTS "Users can view their testnet claims" ON testnet_token_claims;
CREATE POLICY "Users can view their testnet claims" ON testnet_token_claims
    FOR SELECT USING (auth.uid() = user_id);

-- PASO 8: VERIFICACIÓN FINAL
DO $$
BEGIN
    RAISE NOTICE '✅ MIGRACIÓN BLOCKCHAIN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '📊 Tablas creadas: couple_nft_requests, daily_token_claims, user_nfts, user_wallets';
    RAISE NOTICE '🔒 RLS habilitado con políticas de seguridad';
    RAISE NOTICE '⚡ Índices optimizados para performance';
    RAISE NOTICE '🛠️ Funciones auxiliares disponibles';
    RAISE NOTICE '🎯 Sistema blockchain listo para deploy de contratos';
END $$;
