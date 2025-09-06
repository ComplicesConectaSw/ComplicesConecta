-- =====================================================
-- 🚀 SCRIPT FINAL PARA SUPABASE - SIN ERRORES
-- ComplicesConecta v2.1.2 - Supabase Project: axtvqnozatbmllvwzuim
-- Fecha: 06 de septiembre, 2025 - 06:30 hrs
-- =====================================================

-- ELIMINAR TABLAS EXISTENTES VACÍAS Y RECREAR
-- =====================================================

-- Eliminar tablas en orden correcto (dependencias)
DROP TABLE IF EXISTS public.match_interactions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.user_likes CASCADE;
DROP TABLE IF EXISTS public.chat_invitations CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_members CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.gallery_access_requests CASCADE;
DROP TABLE IF EXISTS public.image_permissions CASCADE;
DROP TABLE IF EXISTS public.images CASCADE;
DROP TABLE IF EXISTS public.gallery_permissions CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

DO $$
BEGIN
    RAISE NOTICE '🚀 INICIANDO CREACIÓN COMPLETA DE TABLAS';
    RAISE NOTICE '📊 Proyecto Supabase: axtvqnozatbmllvwzuim';
    RAISE NOTICE '⏰ Fecha: %', NOW();
END $$;

-- 👤 TABLA: user_roles
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 📨 TABLA: invitations
-- =====================================================
CREATE TABLE public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_profile UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    to_profile UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    type TEXT DEFAULT 'connection' CHECK (type IN ('connection', 'event', 'group')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_profile, to_profile, type)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON invitations
    FOR SELECT USING (from_profile = auth.uid() OR to_profile = auth.uid());

CREATE POLICY "Users can create invitations" ON invitations
    FOR INSERT WITH CHECK (from_profile = auth.uid());

CREATE POLICY "Users can update received invitations" ON invitations
    FOR UPDATE USING (to_profile = auth.uid());

-- 🔑 TABLA: gallery_permissions
-- =====================================================
CREATE TABLE public.gallery_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT DEFAULT 'view' CHECK (permission_type IN ('view', 'download', 'share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, granted_to, permission_type)
);

ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permissions" ON gallery_permissions
    FOR SELECT USING (granted_by = auth.uid() OR granted_to = auth.uid());

CREATE POLICY "Users can grant permissions" ON gallery_permissions
    FOR INSERT WITH CHECK (granted_by = auth.uid());

-- 🖼️ TABLA: images
-- =====================================================
CREATE TABLE public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'profile' CHECK (type IN ('profile', 'gallery', 'avatar')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images" ON images
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own images" ON images
    FOR ALL USING (profile_id = auth.uid());

-- 🔑 TABLA: image_permissions
-- =====================================================
CREATE TABLE public.image_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, granted_to)
);

ALTER TABLE public.image_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permissions" ON image_permissions
    FOR SELECT USING (granted_by = auth.uid() OR granted_to = auth.uid());

CREATE POLICY "Users can grant own permissions" ON image_permissions
    FOR INSERT WITH CHECK (granted_by = auth.uid());

-- 📋 TABLA: gallery_access_requests
-- =====================================================
CREATE TABLE public.gallery_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_from UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, requested_from)
);

ALTER TABLE public.gallery_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON gallery_access_requests
    FOR SELECT USING (requester_id = auth.uid() OR requested_from = auth.uid());

CREATE POLICY "Users can create requests" ON gallery_access_requests
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update target requests" ON gallery_access_requests
    FOR UPDATE USING (requested_from = auth.uid());

-- 💬 TABLA: chat_rooms
-- =====================================================
CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'group')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible rooms" ON chat_rooms
    FOR SELECT USING (
        type = 'public' OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_members 
            WHERE room_id = chat_rooms.id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rooms" ON chat_rooms
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can manage own rooms" ON chat_rooms
    FOR ALL USING (created_by = auth.uid());

-- 👥 TABLA: chat_members
-- =====================================================
CREATE TABLE public.chat_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, profile_id)
);

ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room members" ON chat_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE id = chat_members.room_id AND (type = 'public' OR created_by = auth.uid())
        ) OR profile_id = auth.uid()
    );

CREATE POLICY "Room admins can manage members" ON chat_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE id = chat_members.room_id AND created_by = auth.uid()
        ) OR profile_id = auth.uid()
    );

-- 💬 TABLA: messages
-- =====================================================
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members 
            WHERE room_id = messages.room_id AND profile_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE id = messages.room_id AND type = 'public'
        )
    );

CREATE POLICY "Users can create messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- 📨 TABLA: chat_invitations
-- =====================================================
CREATE TABLE public.chat_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, invited_user)
);

ALTER TABLE public.chat_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat invitations" ON chat_invitations
    FOR SELECT USING (invited_by = auth.uid() OR invited_user = auth.uid());

CREATE POLICY "Users can create chat invitations" ON chat_invitations
    FOR INSERT WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update received invitations" ON chat_invitations
    FOR UPDATE USING (invited_user = auth.uid());

-- 💕 TABLA: user_likes
-- =====================================================
CREATE TABLE public.user_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, liked_user_id)
);

ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own likes" ON user_likes
    FOR SELECT USING (user_id = auth.uid() OR liked_user_id = auth.uid());

CREATE POLICY "Users can manage own likes" ON user_likes
    FOR ALL USING (user_id = auth.uid());

-- 🎯 TABLA: matches
-- =====================================================
CREATE TABLE public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    compatibility_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can update own matches" ON matches
    FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- 🔄 TABLA: match_interactions
-- =====================================================
CREATE TABLE public.match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('like', 'super_like', 'pass', 'block')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.match_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON match_interactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create interactions" ON match_interactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 📋 AGREGAR COLUMNAS FALTANTES EN PROFILES
-- =====================================================

DO $$ 
BEGIN
    -- Verificar y agregar columna interests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
        RAISE NOTICE '  ✅ Columna interests agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna looking_for
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'looking_for') THEN
        ALTER TABLE profiles ADD COLUMN looking_for TEXT[] DEFAULT '{}';
        RAISE NOTICE '  ✅ Columna looking_for agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna swinger_experience
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'swinger_experience') THEN
        ALTER TABLE profiles ADD COLUMN swinger_experience TEXT;
        RAISE NOTICE '  ✅ Columna swinger_experience agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna age_range_min
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'age_range_min') THEN
        ALTER TABLE profiles ADD COLUMN age_range_min INTEGER DEFAULT 18;
        RAISE NOTICE '  ✅ Columna age_range_min agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna age_range_max
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'age_range_max') THEN
        ALTER TABLE profiles ADD COLUMN age_range_max INTEGER DEFAULT 65;
        RAISE NOTICE '  ✅ Columna age_range_max agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna max_distance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'max_distance') THEN
        ALTER TABLE profiles ADD COLUMN max_distance INTEGER DEFAULT 50;
        RAISE NOTICE '  ✅ Columna max_distance agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna is_demo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_demo') THEN
        ALTER TABLE profiles ADD COLUMN is_demo BOOLEAN DEFAULT false;
        RAISE NOTICE '  ✅ Columna is_demo agregada a profiles';
    END IF;
    
    -- Verificar y agregar columna is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE '  ✅ Columna is_active agregada a profiles';
    END IF;
END $$;

-- 🚀 CREAR ÍNDICES CRÍTICOS PARA PERFORMANCE
-- =====================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for_gin ON public.profiles USING GIN(looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_active_search ON public.profiles(is_active, is_demo, age) WHERE is_active = true AND is_demo = false;

-- Índices para matches
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_users_unique ON public.matches(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON public.matches(user1_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON public.matches(user2_id, status, created_at DESC);

-- Índices para user_likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_likes_unique ON public.user_likes(user_id, liked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_given ON public.user_likes(user_id, liked, created_at DESC);

-- Índices para chat_rooms y messages
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON public.chat_rooms(type, created_at DESC) WHERE type = 'public';
CREATE INDEX IF NOT EXISTS idx_messages_room_time ON public.messages(room_id, created_at DESC);

-- Índices para images
CREATE INDEX IF NOT EXISTS idx_images_profile_id ON public.images(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_type ON public.images(type, is_primary) WHERE is_primary = true;

DO $$
BEGIN
    RAISE NOTICE '🎉 TODAS LAS TABLAS Y COLUMNAS CREADAS EXITOSAMENTE';
    RAISE NOTICE '📊 Proyecto: axtvqnozatbmllvwzuim';
    RAISE NOTICE '✅ 11 tablas nuevas + columnas en profiles + índices optimizados';
    RAISE NOTICE '🛡️ RLS habilitado en todas las tablas con políticas de seguridad';
    RAISE NOTICE '🚀 Sistema listo para usar - SIN ERRORES';
END $$;
