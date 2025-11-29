DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'couple_events'
  ) THEN
    -- Agregar columnas a couple_events si no existen
    -- event_type (virtual, hybrid, in_person)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'couple_events' 
      AND column_name = 'event_type'
    ) THEN
      ALTER TABLE couple_events 
      ADD COLUMN event_type TEXT DEFAULT 'in_person' CHECK (event_type IN ('virtual', 'hybrid', 'in_person'));
    END IF;

    -- is_vip
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'couple_events' 
      AND column_name = 'is_vip'
    ) THEN
      ALTER TABLE couple_events 
      ADD COLUMN is_vip BOOLEAN DEFAULT false;
    END IF;

    -- cmpx_reward
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'couple_events' 
      AND column_name = 'cmpx_reward'
    ) THEN
      ALTER TABLE couple_events 
      ADD COLUMN cmpx_reward INTEGER DEFAULT 50 CHECK (cmpx_reward >= 0);
    END IF;

    -- co2_saved
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'couple_events' 
      AND column_name = 'co2_saved'
    ) THEN
      ALTER TABLE couple_events 
      ADD COLUMN co2_saved NUMERIC(10,2) DEFAULT 0 CHECK (co2_saved >= 0);
    END IF;

    -- current_participants
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'couple_events' 
      AND column_name = 'current_participants'
    ) THEN
      ALTER TABLE couple_events 
      ADD COLUMN current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0);
    END IF;

    -- Crear tabla event_participations si no existe
    CREATE TABLE IF NOT EXISTS event_participations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES couple_events(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      participated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cmpx_rewarded INTEGER NOT NULL DEFAULT 50,
      co2_saved NUMERIC(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_event_participations_event_id ON event_participations(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_participations_user_id ON event_participations(user_id);

    -- RLS Policies
    ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own event participations" ON event_participations;
    CREATE POLICY "Users can view own event participations"
      ON event_participations
      FOR SELECT
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own event participations" ON event_participations;
    CREATE POLICY "Users can create own event participations"
      ON event_participations
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Comentarios
    COMMENT ON COLUMN couple_events.event_type IS 'Tipo de evento: virtual, hybrid, in_person';
    COMMENT ON COLUMN couple_events.is_vip IS 'Requiere acceso VIP (GTK o Premium)';
    COMMENT ON COLUMN couple_events.cmpx_reward IS 'Recompensa CMPX por participar (default 50)';
    COMMENT ON COLUMN couple_events.co2_saved IS 'CO2 ahorrado en kg por evento virtual';
  ELSE
    RAISE NOTICE 'Tabla couple_events no existe en este entorno; se omite migración de eventos virtuales.';
  END IF;
END $$;

