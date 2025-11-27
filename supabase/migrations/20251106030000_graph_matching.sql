-- Migración: Graph Matching Predictivo
-- Feature: Matching Predictivo con Neo4j + IA Emocional
-- Versión: 3.5.0
-- Fecha: 06 Nov 2025

-- Crear tabla para cachear scores predictivos
CREATE TABLE IF NOT EXISTS predictive_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2) NOT NULL,
  compatibility_score NUMERIC(5,2) NOT NULL,
  emotional_score NUMERIC(5,2) NOT NULL,
  social_score NUMERIC(5,2) NOT NULL,
  graph_score NUMERIC(5,2) NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  reasons TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_predictive_match_scores_user_id ON predictive_match_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_predictive_match_scores_total_score ON predictive_match_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_predictive_match_scores_created_at ON predictive_match_scores(created_at DESC);

-- RLS Policies
ALTER TABLE predictive_match_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own predictive match scores" ON predictive_match_scores;
CREATE POLICY "Users can view own predictive match scores"
  ON predictive_match_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_predictive_match_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_predictive_match_scores_updated_at ON predictive_match_scores;
CREATE TRIGGER trigger_update_predictive_match_scores_updated_at
  BEFORE UPDATE ON predictive_match_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_predictive_match_scores_updated_at();

-- Comentarios
COMMENT ON TABLE predictive_match_scores IS 'Scores de matching predictivo con Neo4j + IA Emocional';

