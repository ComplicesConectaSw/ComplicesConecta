-- =====================================================
-- SCRIPT: Aplicar Migraciones Manualmente
-- Fecha: 14/09/2025 10:36hrs
-- Versión: v2.8.2 - Sistema de Imágenes y Chat
-- =====================================================

-- MIGRACIÓN 1: Sistema de Fotos para Parejas
-- =====================================================

-- Crear tabla couple_photos
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

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_couple_photos_profile_id ON public.couple_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_photos_partner_type ON public.couple_photos(partner_type);
CREATE INDEX IF NOT EXISTS idx_couple_photos_is_main ON public.couple_photos(is_main);
CREATE INDEX IF NOT EXISTS idx_couple_photos_created_at ON public.couple_photos(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_couple_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_couple_photos_updated_at ON public.couple_photos;
CREATE TRIGGER trigger_update_couple_photos_updated_at
    BEFORE UPDATE ON public.couple_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_couple_photos_updated_at();

-- Función para asegurar solo una foto principal por partner
CREATE OR REPLACE FUNCTION ensure_single_main_photo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la nueva foto se marca como principal
    IF NEW.is_main = true THEN
        -- Quitar principal de otras fotos del mismo partner y perfil
        UPDATE public.couple_photos 
        SET is_main = false 
        WHERE profile_id = NEW.profile_id 
        AND partner_type = NEW.partner_type 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asegurar solo una foto principal por partner
DROP TRIGGER IF EXISTS trigger_ensure_single_main_photo ON public.couple_photos;
CREATE TRIGGER trigger_ensure_single_main_photo
    BEFORE INSERT OR UPDATE ON public.couple_photos
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_main_photo();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.couple_photos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own couple photos" ON public.couple_photos;
DROP POLICY IF EXISTS "Users can insert own couple photos" ON public.couple_photos;
DROP POLICY IF EXISTS "Users can update own couple photos" ON public.couple_photos;
DROP POLICY IF EXISTS "Users can delete own couple photos" ON public.couple_photos;

-- Política: Los usuarios pueden ver sus propias fotos
CREATE POLICY "Users can view own couple photos" ON public.couple_photos
    FOR SELECT USING (
        auth.uid() = profile_id OR
        -- Permitir ver fotos de perfiles públicos
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = couple_photos.profile_id 
            AND profile_type = 'couple'
        )
    );

-- Política: Los usuarios pueden insertar sus propias fotos
CREATE POLICY "Users can insert own couple photos" ON public.couple_photos
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Política: Los usuarios pueden actualizar sus propias fotos
CREATE POLICY "Users can update own couple photos" ON public.couple_photos
    FOR UPDATE USING (auth.uid() = profile_id);

-- Política: Los usuarios pueden eliminar sus propias fotos
CREATE POLICY "Users can delete own couple photos" ON public.couple_photos
    FOR DELETE USING (auth.uid() = profile_id);

-- MIGRACIÓN 2: Sistema de Chat en Tiempo Real
-- =====================================================

-- Crear tabla chat_rooms
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

-- Crear tabla chat_participants
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

-- Crear tabla chat_messages
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

-- Crear tabla chat_typing para indicadores de escritura
CREATE TABLE IF NOT EXISTS public.chat_typing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- Crear índices para chat
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

-- Políticas RLS básicas para chat
DROP POLICY IF EXISTS "Users can view rooms they participate in" ON public.chat_rooms;
CREATE POLICY "Users can view rooms they participate in" ON public.chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = chat_rooms.id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can create rooms" ON public.chat_rooms;
CREATE POLICY "Users can create rooms" ON public.chat_rooms
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Verificación final
SELECT 'MIGRACIÓN COMPLETADA: Tablas creadas exitosamente' as status;
