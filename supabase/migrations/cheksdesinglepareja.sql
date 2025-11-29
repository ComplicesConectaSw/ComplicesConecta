DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'couple_profiles'
  ) THEN
    ALTER TABLE public.couple_profiles
      ADD COLUMN IF NOT EXISTS looking_for VARCHAR(50) DEFAULT 'friendship'
        CHECK (looking_for IN ('friendship','dating','casual','serious','swinger','threesome','group')),
      ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'beginner'
        CHECK (experience_level IN ('beginner','intermediate','advanced','expert')),
      ADD COLUMN IF NOT EXISTS swinger_experience VARCHAR(50) DEFAULT 'beginner'
        CHECK (swinger_experience IN ('beginner','intermediate','advanced','expert')),
      ADD COLUMN IF NOT EXISTS interested_in VARCHAR(50) DEFAULT 'couples'
        CHECK (interested_in IN ('singles','couples','both','groups')),
      ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS age_range_min INTEGER DEFAULT 18,
      ADD COLUMN IF NOT EXISTS age_range_max INTEGER DEFAULT 65;
  END IF;
END
$$;