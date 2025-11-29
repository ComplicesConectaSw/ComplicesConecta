-- ComplicesConecta v3.7.0 - Migraciones de Base de Datos para Blockchain
-- Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
-- Descripción: Tablas necesarias para el sistema blockchain (wallets, NFTs, tokens)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: user_wallets
-- Descripción: Almacena las wallets internas de los usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address VARCHAR(42) NOT NULL UNIQUE, -- Dirección Ethereum
    encrypted_private_key TEXT NOT NULL, -- Clave privada encriptada con AES-256
    network VARCHAR(20) NOT NULL DEFAULT 'mumbai', -- Red blockchain (mumbai, polygon)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para optimización
    CONSTRAINT unique_user_wallet UNIQUE(user_id, network)
);

-- Índices para user_wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_network ON user_wallets(network);

-- =====================================================
-- TABLA: testnet_token_claims
-- Descripción: Registro de tokens gratuitos reclamados en testnet
-- =====================================================
CREATE TABLE IF NOT EXISTS testnet_token_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_claimed BIGINT NOT NULL DEFAULT 0, -- Cantidad reclamada en wei
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_hash VARCHAR(66), -- Hash de la transacción blockchain
    
    -- Constraint para evitar duplicados
    CONSTRAINT unique_user_testnet_claim UNIQUE(user_id)
);

-- Índices para testnet_token_claims
CREATE INDEX IF NOT EXISTS idx_testnet_claims_user_id ON testnet_token_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_testnet_claims_date ON testnet_token_claims(claimed_at);

-- =====================================================
-- TABLA: daily_token_claims
-- Descripción: Registro de tokens diarios reclamados (1% por día)
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_token_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_date DATE NOT NULL, -- Fecha del reclamo (YYYY-MM-DD)
    amount_claimed BIGINT NOT NULL DEFAULT 0, -- Cantidad reclamada en wei
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_hash VARCHAR(66), -- Hash de la transacción blockchain
    
    -- Constraint para evitar duplicados por día
    CONSTRAINT unique_user_daily_claim UNIQUE(user_id, claim_date)
);

-- Índices para daily_token_claims
CREATE INDEX IF NOT EXISTS idx_daily_claims_user_id ON daily_token_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_claims_date ON daily_token_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_daily_claims_user_date ON daily_token_claims(user_id, claim_date);

-- =====================================================
-- TABLA: user_nfts
-- Descripción: NFTs de usuarios (individuales y de pareja)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id BIGINT NOT NULL, -- ID del token en el contrato
    owner_address VARCHAR(42) NOT NULL, -- Dirección del propietario
    metadata_uri TEXT NOT NULL, -- URI del metadata IPFS
    rarity VARCHAR(20) NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
    is_couple BOOLEAN NOT NULL DEFAULT FALSE, -- Si es NFT de pareja
    partner_address VARCHAR(42), -- Dirección de la pareja (si aplica)
    contract_address VARCHAR(42), -- Dirección del contrato NFT
    network VARCHAR(20) NOT NULL DEFAULT 'mumbai', -- Red blockchain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    CHECK (network IN ('mumbai', 'polygon'))
);

-- Índices para user_nfts
CREATE INDEX IF NOT EXISTS idx_user_nfts_owner ON user_nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_user_nfts_token_id ON user_nfts(token_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_couple ON user_nfts(is_couple);
CREATE INDEX IF NOT EXISTS idx_user_nfts_rarity ON user_nfts(rarity);
CREATE INDEX IF NOT EXISTS idx_user_nfts_network ON user_nfts(network);

-- =====================================================
-- TABLA: couple_nft_requests
-- Descripción: Solicitudes de NFT de pareja con consentimiento doble
-- =====================================================
CREATE TABLE IF NOT EXISTS couple_nft_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id BIGINT NOT NULL, -- ID del token solicitado
    partner1_address VARCHAR(42) NOT NULL, -- Primera pareja
    partner2_address VARCHAR(42) NOT NULL, -- Segunda pareja
    initiator_address VARCHAR(42) NOT NULL, -- Quien inició la solicitud
    metadata_uri TEXT NOT NULL, -- URI del metadata IPFS
    consent1_timestamp TIMESTAMP WITH TIME ZONE, -- Consentimiento partner1
    consent2_timestamp TIMESTAMP WITH TIME ZONE, -- Consentimiento partner2
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, minted, cancelled, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Expira en 24 horas
    transaction_hash VARCHAR(66), -- Hash de la transacción de mint
    
    -- Constraints
    CHECK (status IN ('pending', 'approved', 'minted', 'cancelled', 'expired')),
    CHECK (partner1_address != partner2_address),
    CHECK (initiator_address IN (partner1_address, partner2_address))
);

-- Índices para couple_nft_requests
CREATE INDEX IF NOT EXISTS idx_couple_requests_partner1 ON couple_nft_requests(partner1_address);
CREATE INDEX IF NOT EXISTS idx_couple_requests_partner2 ON couple_nft_requests(partner2_address);
CREATE INDEX IF NOT EXISTS idx_couple_requests_status ON couple_nft_requests(status);
CREATE INDEX IF NOT EXISTS idx_couple_requests_expires ON couple_nft_requests(expires_at);

-- =====================================================
-- TABLA: nft_staking
-- Descripción: Registro de NFTs en staking
-- =====================================================
CREATE TABLE IF NOT EXISTS nft_staking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(42) NOT NULL, -- Dirección del usuario
    nft_token_id BIGINT NOT NULL, -- ID del NFT stakeado
    staking_contract VARCHAR(42) NOT NULL, -- Dirección del contrato de staking
    staked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vesting_period_days INTEGER NOT NULL, -- Período de vesting en días
    rarity_multiplier INTEGER NOT NULL DEFAULT 100, -- Multiplicador por rareza (100-200)
    last_claim_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_rewards_claimed BIGINT DEFAULT 0, -- Total de rewards reclamados
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    unstaked_at TIMESTAMP WITH TIME ZONE,
    network VARCHAR(20) NOT NULL DEFAULT 'mumbai',
    
    -- Constraints
    CHECK (vesting_period_days >= 30 AND vesting_period_days <= 365),
    CHECK (rarity_multiplier >= 100 AND rarity_multiplier <= 300)
);

-- Índices para nft_staking
CREATE INDEX IF NOT EXISTS idx_nft_staking_user ON nft_staking(user_address);
CREATE INDEX IF NOT EXISTS idx_nft_staking_token ON nft_staking(nft_token_id);
CREATE INDEX IF NOT EXISTS idx_nft_staking_active ON nft_staking(is_active);
CREATE INDEX IF NOT EXISTS idx_nft_staking_network ON nft_staking(network);

-- =====================================================
-- TABLA: token_staking
-- Descripción: Registro de tokens GTK en staking
-- =====================================================
CREATE TABLE IF NOT EXISTS token_staking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(42) NOT NULL, -- Dirección del usuario
    amount_staked BIGINT NOT NULL, -- Cantidad de tokens stakeados en wei
    staking_contract VARCHAR(42) NOT NULL, -- Dirección del contrato de staking
    staked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vesting_period_days INTEGER NOT NULL, -- Período de vesting en días
    last_claim_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_rewards_claimed BIGINT DEFAULT 0, -- Total de rewards reclamados
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    unstaked_at TIMESTAMP WITH TIME ZONE,
    network VARCHAR(20) NOT NULL DEFAULT 'mumbai',
    
    -- Constraints
    CHECK (vesting_period_days >= 30 AND vesting_period_days <= 365),
    CHECK (amount_staked > 0)
);

-- Índices para token_staking
CREATE INDEX IF NOT EXISTS idx_token_staking_user ON token_staking(user_address);
CREATE INDEX IF NOT EXISTS idx_token_staking_active ON token_staking(is_active);
CREATE INDEX IF NOT EXISTS idx_token_staking_network ON token_staking(network);

-- =====================================================
-- TABLA: blockchain_transactions
-- Descripción: Registro de todas las transacciones blockchain
-- =====================================================
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    transaction_type VARCHAR(50) NOT NULL, -- mint_nft, stake_nft, claim_tokens, etc.
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    amount BIGINT, -- Cantidad involucrada (si aplica)
    gas_used BIGINT,
    gas_price BIGINT,
    block_number BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, failed
    network VARCHAR(20) NOT NULL DEFAULT 'mumbai',
    metadata JSONB, -- Datos adicionales específicos del tipo de transacción
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CHECK (status IN ('pending', 'confirmed', 'failed'))
);

-- Índices para blockchain_transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_user ON blockchain_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_type ON blockchain_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_network ON blockchain_transactions(network);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testnet_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_nft_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_wallets
CREATE POLICY "Users can view their own wallets" ON user_wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON user_wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON user_wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para testnet_token_claims
CREATE POLICY "Users can view their own testnet claims" ON testnet_token_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own testnet claims" ON testnet_token_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testnet claims" ON testnet_token_claims
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para daily_token_claims
CREATE POLICY "Users can view their own daily claims" ON daily_token_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily claims" ON daily_token_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily claims" ON daily_token_claims
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_nfts (pueden ver NFTs por dirección de wallet)
CREATE POLICY "Users can view NFTs by wallet address" ON user_nfts
    FOR SELECT USING (
        owner_address IN (
            SELECT address FROM user_wallets WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert NFTs for their wallets" ON user_nfts
    FOR INSERT WITH CHECK (
        owner_address IN (
            SELECT address FROM user_wallets WHERE user_id = auth.uid()
        )
    );

-- Políticas para couple_nft_requests
CREATE POLICY "Users can view couple requests involving their wallets" ON couple_nft_requests
    FOR SELECT USING (
        partner1_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid()) OR
        partner2_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert couple requests for their wallets" ON couple_nft_requests
    FOR INSERT WITH CHECK (
        initiator_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update couple requests involving their wallets" ON couple_nft_requests
    FOR UPDATE USING (
        partner1_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid()) OR
        partner2_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

-- Políticas para staking tables
CREATE POLICY "Users can view their own NFT staking" ON nft_staking
    FOR SELECT USING (
        user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own NFT staking" ON nft_staking
    FOR INSERT WITH CHECK (
        user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own NFT staking" ON nft_staking
    FOR UPDATE USING (
        user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view their own token staking" ON token_staking
    FOR SELECT USING (
        user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own token staking" ON token_staking
    FOR INSERT WITH CHECK (
        user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own token staking" ON token_staking
    FOR UPDATE USING (
        user_address IN (SELECT address FROM user_wallets WHERE user_id = auth.uid())
    );

-- Políticas para blockchain_transactions
CREATE POLICY "Users can view their own transactions" ON blockchain_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON blockchain_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para limpiar solicitudes expiradas de NFT de pareja
CREATE OR REPLACE FUNCTION cleanup_expired_couple_requests()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE couple_nft_requests 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de testnet
CREATE OR REPLACE FUNCTION get_testnet_stats()
RETURNS TABLE(
    total_users_claimed INTEGER,
    total_amount_claimed BIGINT,
    total_daily_claims INTEGER,
    avg_daily_claim NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT user_id) FROM testnet_token_claims)::INTEGER,
        (SELECT COALESCE(SUM(amount_claimed), 0) FROM testnet_token_claims),
        (SELECT COUNT(*) FROM daily_token_claims)::INTEGER,
        (SELECT COALESCE(AVG(amount_claimed), 0) FROM daily_token_claims);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_nfts_updated_at
    BEFORE UPDATE ON user_nfts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_token_claims_updated_at
    BEFORE UPDATE ON daily_token_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE user_wallets IS 'Wallets internas de usuarios con claves privadas encriptadas';
COMMENT ON TABLE testnet_token_claims IS 'Registro de tokens gratuitos reclamados en testnet (límite 1000 por usuario)';
COMMENT ON TABLE daily_token_claims IS 'Registro de tokens diarios reclamados (límite 1% del pool por día)';
COMMENT ON TABLE user_nfts IS 'NFTs de usuarios, tanto individuales como de pareja';
COMMENT ON TABLE couple_nft_requests IS 'Solicitudes de NFT de pareja con sistema de consentimiento doble';
COMMENT ON TABLE nft_staking IS 'Registro de NFTs en staking con rewards en CMPX';
COMMENT ON TABLE token_staking IS 'Registro de tokens GTK en staking con rewards en CMPX';
COMMENT ON TABLE blockchain_transactions IS 'Registro completo de transacciones blockchain del sistema';

-- =====================================================
-- DATOS INICIALES (OPCIONAL)
-- =====================================================

-- Insertar configuración inicial si es necesario
-- INSERT INTO system_config (key, value, description) VALUES 
-- ('testnet_mode', 'true', 'Indica si el sistema está en modo testnet'),
-- ('daily_claim_limit', '2500000000000000000000000', 'Límite diario de tokens en wei (2.5M CMPX)'),
-- ('testnet_free_limit', '1000000000000000000000', 'Límite de tokens gratuitos por usuario en wei (1000 CMPX)')
-- ON CONFLICT (key) DO NOTHING;
