-- =====================================================
-- SCRIPT: Corrección de Migraciones - Sin Errores
-- Fecha: 14/09/2025 10:43hrs
-- Versión: v2.8.2 - Corrección de Errores SQL
-- =====================================================

-- PASO 1: Crear tabla couple_photos (corregida)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.couple_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('el', 'ella')),
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_couple_photos_profile_id ON public.couple_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_photos_partner_type ON public.couple_photos(partner_type);
CREATE INDEX IF NOT EXISTS idx_couple_photos_is_main ON public.couple_photos(is_main);
CREATE INDEX IF NOT EXISTS idx_couple_photos_created_at ON public.couple_photos(created_at DESC);

-- Función para updated_at
CREATE OR REPLACE FUNCTION update_couple_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_couple_photos_updated_at ON public.couple_photos;
CREATE TRIGGER trigger_update_couple_photos_updated_at
    BEFORE UPDATE ON public.couple_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_couple_photos_updated_at();

-- Función para una sola foto principal por partner
CREATE OR REPLACE FUNCTION ensure_single_main_photo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_main = true THEN
        UPDATE public.couple_photos 
        SET is_main = false 
        WHERE profile_id = NEW.profile_id 
        AND partner_type = NEW.partner_type 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para foto principal única
DROP TRIGGER IF EXISTS trigger_ensure_single_main_photo ON public.couple_photos;
CREATE TRIGGER trigger_ensure_single_main_photo
    BEFORE INSERT OR UPDATE ON public.couple_photos
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_main_photo();

-- Habilitar RLS
ALTER TABLE public.couple_photos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "Users can view own couple photos" ON public.couple_photos;
DROP POLICY IF EXISTS "Users can insert own couple photos" ON public.couple_photos;
DROP POLICY IF EXISTS "Users can update own couple photos" ON public.couple_photos;
DROP POLICY IF EXISTS "Users can delete own couple photos" ON public.couple_photos;

-- Políticas RLS corregidas (sin is_verified)
CREATE POLICY "Users can view own couple photos" ON public.couple_photos
    FOR SELECT USING (
        auth.uid() = profile_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = couple_photos.profile_id 
            AND profile_type = 'couple'
        )
    );

CREATE POLICY "Users can insert own couple photos" ON public.couple_photos
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own couple photos" ON public.couple_photos
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own couple photos" ON public.couple_photos
    FOR DELETE USING (auth.uid() = profile_id);

-- PASO 2: Crear tablas de chat (corregidas)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    type TEXT NOT NULL CHECK (type IN ('private', 'group', 'couple')) DEFAULT 'private',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_typing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- Índices para chat
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON public.chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON public.chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at ON public.chat_rooms(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON public.chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON public.chat_participants(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_typing_room_id ON public.chat_typing(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_user_id ON public.chat_typing(user_id);

-- Funciones para chat
CREATE OR REPLACE FUNCTION update_chat_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_rooms 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para chat
DROP TRIGGER IF EXISTS trigger_update_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER trigger_update_chat_rooms_updated_at
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_rooms_updated_at();

DROP TRIGGER IF EXISTS trigger_update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER trigger_update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_messages_updated_at();

DROP TRIGGER IF EXISTS trigger_update_room_last_message ON public.chat_messages;
CREATE TRIGGER trigger_update_room_last_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_room_last_message();

-- Habilitar RLS en tablas de chat
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_typing ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "Users can view rooms they participate in" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view typing in their rooms" ON public.chat_typing;
DROP POLICY IF EXISTS "Users can set typing status" ON public.chat_typing;

-- Políticas RLS básicas para chat
CREATE POLICY "Users can view rooms they participate in" ON public.chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = chat_rooms.id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can create rooms" ON public.chat_rooms
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view participants in their rooms" ON public.chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp 
            WHERE cp.room_id = chat_participants.room_id 
            AND cp.user_id = auth.uid() 
            AND cp.is_active = true
        )
    );

CREATE POLICY "Users can join rooms" ON public.chat_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = chat_messages.room_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = chat_messages.room_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can view typing in their rooms" ON public.chat_typing
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = chat_typing.room_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Users can set typing status" ON public.chat_typing
    FOR ALL USING (auth.uid() = user_id);

-- Verificación final
SELECT 
    'couple_photos' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couple_photos') 
         THEN 'CREADA ✅' 
         ELSE 'ERROR ❌' 
    END as status
UNION ALL
SELECT 
    'chat_rooms' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_rooms') 
         THEN 'CREADA ✅' 
         ELSE 'ERROR ❌' 
    END as status
UNION ALL
SELECT 
    'chat_messages' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') 
         THEN 'CREADA ✅' 
         ELSE 'ERROR ❌' 
    END as status;
