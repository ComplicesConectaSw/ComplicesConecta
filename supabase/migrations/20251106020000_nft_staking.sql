-- Migración: NFT Verifications con GTK Staking
-- Feature: Galerías NFT-Verificadas
-- Versión: 3.5.0
-- Fecha: 06 Nov 2025

-- Crear tabla nft_verifications si no existe
CREATE TABLE IF NOT EXISTS nft_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_contract_address TEXT NOT NULL,
  nft_token_id TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('polygon', 'ethereum')),
  minted_with_gtk INTEGER NOT NULL CHECK (minted_with_gtk >= 100),
  -- En entornos donde staking_records no existe, evitamos la FK directa
  staking_record_id UUID,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, nft_token_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_nft_verifications_user_id ON nft_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_verifications_is_active ON nft_verifications(is_active);
CREATE INDEX IF NOT EXISTS idx_nft_verifications_staking_record_id ON nft_verifications(staking_record_id);

-- RLS Policies
ALTER TABLE nft_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own NFT verifications" ON nft_verifications;
CREATE POLICY "Users can view own NFT verifications"
  ON nft_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own NFT verifications" ON nft_verifications;
CREATE POLICY "Users can create own NFT verifications"
  ON nft_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_nft_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_nft_verifications_updated_at ON nft_verifications;
CREATE TRIGGER trigger_update_nft_verifications_updated_at
  BEFORE UPDATE ON nft_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_nft_verifications_updated_at();

-- Comentarios
COMMENT ON TABLE nft_verifications IS 'Verificaciones NFT con GTK staking (mínimo 100 GTK)';
COMMENT ON COLUMN nft_verifications.minted_with_gtk IS 'Cantidad de GTK usada para mint (mínimo 100)';
COMMENT ON COLUMN nft_verifications.staking_record_id IS 'ID del staking record asociado';

