-- Migración: Enhancements para Consent Verification Service
-- Feature: Verificador IA de Consentimiento en Chats (Real-time)
-- Versión: 3.5.0
-- Fecha: 06 Nov 2025

-- Agregar columnas necesarias para monitoreo real-time (solo si existe la tabla consent_verifications)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'consent_verifications'
  ) THEN
    -- Agregar chat_id si no existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'chat_id'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN chat_id TEXT;
      
      CREATE INDEX IF NOT EXISTS idx_consent_verifications_chat_id 
      ON consent_verifications(chat_id);
    END IF;

    -- Agregar user_id1 y user_id2 si no existen
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'user_id1'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN user_id1 UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      
      CREATE INDEX IF NOT EXISTS idx_consent_verifications_user_id1 
      ON consent_verifications(user_id1);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'user_id2'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN user_id2 UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      
      CREATE INDEX IF NOT EXISTS idx_consent_verifications_user_id2 
      ON consent_verifications(user_id2);
    END IF;

    -- Agregar consent_score si no existe (0-100)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'consent_score'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN consent_score INTEGER CHECK (consent_score >= 0 AND consent_score <= 100);
    END IF;

    -- Agregar status si no existe (consent, uncertain, non_consent, insufficient_data)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'status'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN status TEXT CHECK (status IN ('consent', 'uncertain', 'non_consent', 'insufficient_data'));
    END IF;

    -- Agregar reasoning si no existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'reasoning'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN reasoning TEXT;
    END IF;

    -- Agregar message_count si no existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'message_count'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN message_count INTEGER DEFAULT 0;
    END IF;

    -- Agregar is_paused si no existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'is_paused'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN is_paused BOOLEAN DEFAULT false;
      
      CREATE INDEX IF NOT EXISTS idx_consent_verifications_is_paused 
      ON consent_verifications(is_paused);
    END IF;

    -- Agregar pause_reason si no existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'consent_verifications' 
      AND column_name = 'pause_reason'
    ) THEN
      ALTER TABLE consent_verifications 
      ADD COLUMN pause_reason TEXT;
    END IF;

    -- Actualizar constraint único para chat_id
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'consent_verifications_chat_id_unique'
    ) THEN
      CREATE UNIQUE INDEX IF NOT EXISTS consent_verifications_chat_id_unique 
      ON consent_verifications(chat_id) 
      WHERE chat_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Actualizar políticas RLS para incluir chat_id (solo si existe consent_verifications)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'consent_verifications'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own consent verifications by chat" ON consent_verifications;
    CREATE POLICY "Users can view own consent verifications by chat"
      ON consent_verifications
      FOR SELECT
      USING (
        auth.uid() = user_id1 OR 
        auth.uid() = user_id2 OR
        auth.uid() = user_id OR
        auth.uid() = recipient_id
      );

    -- Política para insertar con chat_id
    DROP POLICY IF EXISTS "Users can create consent verifications for their chats" ON consent_verifications;
    CREATE POLICY "Users can create consent verifications for their chats"
      ON consent_verifications
      FOR INSERT
      WITH CHECK (
        auth.uid() = user_id1 OR 
        auth.uid() = user_id2 OR
        auth.uid() = user_id
      );

    -- Política para actualizar
    DROP POLICY IF EXISTS "Users can update own consent verifications" ON consent_verifications;
    CREATE POLICY "Users can update own consent verifications"
      ON consent_verifications
      FOR UPDATE
      USING (
        auth.uid() = user_id1 OR 
        auth.uid() = user_id2 OR
        auth.uid() = user_id
      );

    -- Comentarios
    COMMENT ON COLUMN consent_verifications.chat_id IS 'ID del chat/room para monitoreo real-time';
    COMMENT ON COLUMN consent_verifications.consent_score IS 'Score de consentimiento (0-100), pausa si <80';
    COMMENT ON COLUMN consent_verifications.status IS 'Estado: consent, uncertain, non_consent, insufficient_data';
    COMMENT ON COLUMN consent_verifications.is_paused IS 'Si el chat está pausado por bajo consenso';
    COMMENT ON COLUMN consent_verifications.pause_reason IS 'Razón de la pausa automática';
  END IF;
END $$;

