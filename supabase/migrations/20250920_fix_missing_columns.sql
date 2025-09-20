-- MIGRACIÓN CRÍTICA: Agregar columnas faltantes para resolver tipos 'never'
-- Fecha: 2025-09-20
-- Propósito: Resolver problemas de tipos TypeScript agregando columnas requeridas

-- 1. Agregar columnas faltantes a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS interested_in text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS partner_first_name text,
ADD COLUMN IF NOT EXISTS partner_age integer,
ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS swinger_experience text,
ADD COLUMN IF NOT EXISTS age_range_min integer DEFAULT 18,
ADD COLUMN IF NOT EXISTS age_range_max integer DEFAULT 65;

-- 2. Actualizar constraint para account_type
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_account_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_account_type_check 
CHECK (account_type IN ('single', 'couple'));

-- 3. Actualizar constraint para gender
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_gender_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_gender_check 
CHECK (gender IN ('male', 'female', 'non-binary', 'other'));

-- 4. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles (gender);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles (account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON public.profiles (age_range_min, age_range_max);

-- 5. Verificar que las tablas de chat existen y tienen las columnas correctas
DO $$ 
BEGIN
    -- Verificar si chat_rooms existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_rooms') THEN
        CREATE TABLE public.chat_rooms (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            description text,
            created_by uuid REFERENCES auth.users(id),
            is_public boolean DEFAULT false,
            is_active boolean DEFAULT true,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- RLS para chat_rooms
        ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view public chat rooms" ON public.chat_rooms
            FOR SELECT USING (is_public = true OR created_by = auth.uid());
            
        CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
            FOR INSERT WITH CHECK (created_by = auth.uid());
            
        CREATE POLICY "Users can update their own chat rooms" ON public.chat_rooms
            FOR UPDATE USING (created_by = auth.uid());
    END IF;

    -- Verificar si chat_members existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_members') THEN
        CREATE TABLE public.chat_members (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
            profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            role text DEFAULT 'member',
            joined_at timestamp with time zone DEFAULT now(),
            is_muted boolean DEFAULT false
        );
        
        -- RLS para chat_members
        ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view chat members" ON public.chat_members
            FOR SELECT USING (profile_id = auth.uid());
            
        CREATE POLICY "Users can join chat rooms" ON public.chat_members
            FOR INSERT WITH CHECK (profile_id = auth.uid());
    END IF;

    -- Verificar si chat_invitations existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_invitations') THEN
        CREATE TABLE public.chat_invitations (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
            from_profile uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            to_profile uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            status text DEFAULT 'pending',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- RLS para chat_invitations
        ALTER TABLE public.chat_invitations ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their invitations" ON public.chat_invitations
            FOR SELECT USING (from_profile = auth.uid() OR to_profile = auth.uid());
            
        CREATE POLICY "Users can send invitations" ON public.chat_invitations
            FOR INSERT WITH CHECK (from_profile = auth.uid());
            
        CREATE POLICY "Users can update their received invitations" ON public.chat_invitations
            FOR UPDATE USING (to_profile = auth.uid());
    END IF;

    -- Verificar si couple_photos existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couple_photos') THEN
        CREATE TABLE public.couple_photos (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            couple_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
            image_url text NOT NULL,
            title text,
            description text,
            is_public boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- RLS para couple_photos
        ALTER TABLE public.couple_photos ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view public couple photos" ON public.couple_photos
            FOR SELECT USING (is_public = true OR couple_id = auth.uid());
            
        CREATE POLICY "Users can manage their couple photos" ON public.couple_photos
            FOR ALL USING (couple_id = auth.uid());
    END IF;
END $$;

-- 6. Actualizar datos existentes con valores por defecto
UPDATE public.profiles 
SET 
    account_type = COALESCE(profile_type, 'single'),
    interests = COALESCE(interests, '{}'),
    interested_in = COALESCE(interested_in, '{}'),
    looking_for = COALESCE(looking_for, '{}'),
    age_range_min = COALESCE(age_range_min, 18),
    age_range_max = COALESCE(age_range_max, 65)
WHERE account_type IS NULL OR interests IS NULL;

-- 7. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Aplicar trigger a las tablas que lo necesiten
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_couple_photos_updated_at ON public.couple_photos;
CREATE TRIGGER update_couple_photos_updated_at
    BEFORE UPDATE ON public.couple_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Comentarios para documentación
COMMENT ON COLUMN public.profiles.interests IS 'Array de intereses del usuario';
COMMENT ON COLUMN public.profiles.gender IS 'Género del usuario: male, female, non-binary, other';
COMMENT ON COLUMN public.profiles.interested_in IS 'Array de géneros de interés';
COMMENT ON COLUMN public.profiles.account_type IS 'Tipo de cuenta: single o couple';
COMMENT ON COLUMN public.profiles.looking_for IS 'Array de lo que busca el usuario';
COMMENT ON COLUMN public.profiles.swinger_experience IS 'Nivel de experiencia swinger';

-- 10. Verificación final
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'chat_rooms', 'chat_members', 'chat_invitations', 'couple_photos')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
