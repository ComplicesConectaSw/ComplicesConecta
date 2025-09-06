-- =====================================================
-- 🔧 MIGRACIÓN: CREAR TABLAS Y COLUMNAS FALTANTES
-- ComplicesConecta v2.1.2 - Fix Database Structure
-- Fecha: 06 de septiembre, 2025
-- =====================================================

-- 🖼️ CREAR TABLA: images
-- =====================================================
CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'profile' CHECK (type IN ('profile', 'gallery')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔑 CREAR TABLA: image_permissions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.image_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📋 CREAR TABLA: gallery_access_requests
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gallery_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_from UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 CREAR TABLA: chat_rooms
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    type TEXT DEFAULT 'private' CHECK (type IN ('private', 'group')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 CREAR TABLA: chat_members
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    UNIQUE(room_id, user_id)
);

-- 📨 CREAR TABLA: messages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📩 CREAR TABLA: chat_invitations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👤 AGREGAR COLUMNAS FALTANTES A profiles
-- =====================================================
DO $$
BEGIN
    -- Agregar columnas si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE public.profiles ADD COLUMN interests TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'looking_for') THEN
        ALTER TABLE public.profiles ADD COLUMN looking_for TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'swinger_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN swinger_experience TEXT CHECK (swinger_experience IN ('beginner', 'experienced', 'expert'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range_min') THEN
        ALTER TABLE public.profiles ADD COLUMN age_range_min INTEGER DEFAULT 18;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range_max') THEN
        ALTER TABLE public.profiles ADD COLUMN age_range_max INTEGER DEFAULT 65;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'max_distance') THEN
        ALTER TABLE public.profiles ADD COLUMN max_distance INTEGER DEFAULT 50;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_demo') THEN
        ALTER TABLE public.profiles ADD COLUMN is_demo BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 🔐 AGREGAR COLUMNAS FALTANTES A user_roles
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'role') THEN
        ALTER TABLE public.user_roles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator'));
    END IF;
END $$;

-- 📤 AGREGAR COLUMNAS FALTANTES A invitations
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'from_profile') THEN
        ALTER TABLE public.invitations ADD COLUMN from_profile UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'to_profile') THEN
        ALTER TABLE public.invitations ADD COLUMN to_profile UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'status') THEN
        ALTER TABLE public.invitations ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'type') THEN
        ALTER TABLE public.invitations ADD COLUMN type TEXT DEFAULT 'connection' CHECK (type IN ('connection', 'chat', 'event'));
    END IF;
END $$;

-- 🖼️ AGREGAR COLUMNAS FALTANTES A gallery_permissions
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_permissions' AND column_name = 'profile_id') THEN
        ALTER TABLE public.gallery_permissions ADD COLUMN profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_permissions' AND column_name = 'granted_to') THEN
        ALTER TABLE public.gallery_permissions ADD COLUMN granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_permissions' AND column_name = 'granted_by') THEN
        ALTER TABLE public.gallery_permissions ADD COLUMN granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 📊 CREAR ÍNDICES OPTIMIZADOS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_images_profile_id ON public.images(profile_id);
CREATE INDEX IF NOT EXISTS idx_images_type ON public.images(type);
CREATE INDEX IF NOT EXISTS idx_chat_members_room_id ON public.chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON public.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_access_requests_requester ON public.gallery_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_gallery_access_requests_requested_from ON public.gallery_access_requests(requested_from);

-- ✅ CONFIRMACIÓN
DO $$
BEGIN
    RAISE NOTICE '✅ MIGRACIÓN fix_database COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '📊 Tablas creadas: images, image_permissions, gallery_access_requests, chat_rooms, chat_members, messages, chat_invitations';
    RAISE NOTICE '📋 Columnas agregadas a: profiles, user_roles, invitations, gallery_permissions';
    RAISE NOTICE '🚀 Índices optimizados creados';
END $$;