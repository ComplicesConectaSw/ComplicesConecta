CREATE TABLE IF NOT EXISTS public.couple_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- campos mínimos base; el resto los agrega la migración extendida
  name text,
  bio text,
  location text
);