// ComplicesConecta v3.7.0 - Tipos Blockchain
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Tipos TypeScript para las tablas blockchain

export interface UserWallet {
  id: string;
  user_id: string;
  address: string;
  encrypted_private_key: string;
  network: string;
  created_at: string;
  updated_at: string;
}

export interface TestnetTokenClaim {
  id: string;
  user_id: string;
  amount_claimed: number;
  claimed_at: string;
  transaction_hash?: string;
}

export interface DailyTokenClaim {
  id: string;
  user_id: string;
  amount_claimed: number;
  claim_date: string;
  transaction_hash?: string;
  created_at: string;
}

export interface UserNFT {
  id: string;
  user_id: string;
  token_id: number;
  contract_address: string;
  metadata_uri?: string;
  name?: string;
  description?: string;
  image_url?: string;
  is_couple: boolean;
  partner_user_id?: string;
  network: string;
  minted_at: string;
}

export interface CoupleNFTRequest {
  id: string;
  requester_user_id: string;
  partner_user_id: string;
  partner1_address: string;
  partner2_address?: string;
  name: string;
  description?: string;
  image_url?: string;
  metadata_uri?: string;
  status: string;
  consent1_timestamp?: string;
  consent2_timestamp?: string;
  expires_at: string;
  token_id?: number;
  contract_address?: string;
  network: string;
  created_at: string;
  updated_at: string;
}

export interface NFTStaking {
  id: string;
  user_id: string;
  nft_id: string;
  staked_at: string;
  unstaked_at?: string;
  rewards_claimed: number;
  is_active: boolean;
  apy_rate: number;
  network: string;
}

export interface TokenStaking {
  id: string;
  user_id: string;
  amount_staked: number;
  staked_at: string;
  unstaked_at?: string;
  rewards_claimed: number;
  is_active: boolean;
  apy_rate: number;
  lock_period_days: number;
  network: string;
}

export interface BlockchainTransaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: string;
  from_address?: string;
  to_address?: string;
  amount?: number;
  gas_used?: number;
  gas_price?: number;
  status: string;
  block_number?: number;
  network: string;
  created_at: string;
  confirmed_at?: string;
}

// Tipos para inserts (sin campos auto-generados)
export type UserWalletInsert = Omit<UserWallet, 'id' | 'created_at' | 'updated_at'>;
export type TestnetTokenClaimInsert = Omit<TestnetTokenClaim, 'id' | 'claimed_at'>;
export type DailyTokenClaimInsert = Omit<DailyTokenClaim, 'id' | 'created_at'>;
export type UserNFTInsert = Omit<UserNFT, 'id' | 'minted_at'>;
export type CoupleNFTRequestInsert = Omit<CoupleNFTRequest, 'id' | 'created_at' | 'updated_at'>;
export type NFTStakingInsert = Omit<NFTStaking, 'id' | 'staked_at'>;
export type TokenStakingInsert = Omit<TokenStaking, 'id' | 'staked_at'>;
export type BlockchainTransactionInsert = Omit<BlockchainTransaction, 'id' | 'created_at'>;

// Cliente Supabase extendido con tipos blockchain
export interface BlockchainSupabaseClient {
  from(table: 'user_wallets'): any;
  from(table: 'testnet_token_claims'): any;
  from(table: 'daily_token_claims'): any;
  from(table: 'user_nfts'): any;
  from(table: 'couple_nft_requests'): any;
  from(table: 'nft_staking'): any;
  from(table: 'token_staking'): any;
  from(table: 'blockchain_transactions'): any;
  from(table: string): any;
}

// Helper para casting seguro de tipos blockchain
export function safeBlockchainCast<T>(data: any): T {
  return data as T;
}

// Helper para acceso seguro a propiedades
export function safeGet<T>(obj: any, key: string, defaultValue?: T): T {
  return obj && obj[key] !== undefined ? obj[key] : defaultValue;
}
