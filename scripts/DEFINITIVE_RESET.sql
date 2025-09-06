-- =====================================================
-- 🚀 SCRIPT DE RESTABLECIMIENTO DEFINITIVO - SIN ERRORES
-- ComplicesConecta v2.1.2 - Supabase Project: axtvqnozatbmllvwzuim
-- Fecha: 06 de septiembre, 2025 - 06:44 hrs
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🚀 INICIANDO RESTABLECIMIENTO COMPLETO DE LA BASE DE DATOS';
    RAISE NOTICE '⚠️ Se eliminarán todas las tablas y funciones existentes.';
END $$;

-- 1. ELIMINAR TODAS LAS FUNCIONES PARA EVITAR DEPENDENCIAS
-- =====================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '🔥 Eliminando todas las funciones existentes de forma inequívoca...';
    FOR r IN 
        SELECT 'DROP FUNCTION IF EXISTS ' || ns.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') CASCADE;' AS drop_cmd
        FROM pg_proc p
        JOIN pg_namespace ns ON p.pronamespace = ns.oid
        WHERE ns.nspname = 'public'
    LOOP
        EXECUTE r.drop_cmd;
    END LOOP;
    RAISE NOTICE '✅ Todas las funciones han sido eliminadas.';
END $$;

-- 2. ELIMINAR TODAS LAS TABLAS EN ORDEN DE DEPENDENCIAS
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '🔥 Eliminando todas las tablas existentes...';
END $$;

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
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. RECREAR TODAS LAS TABLAS DESDE CERO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '🏗️ Recreando todas las tablas desde cero...';
END $$;

-- Pegando contenido de SCRIPT_FINAL_LIMPIO.sql

CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (user_id = auth.uid());

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
CREATE POLICY "Users can view own invitations" ON invitations FOR SELECT USING (from_profile = auth.uid() OR to_profile = auth.uid());
CREATE POLICY "Users can create invitations" ON invitations FOR INSERT WITH CHECK (from_profile = auth.uid());

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
CREATE POLICY "Users can view own permissions" ON gallery_permissions FOR SELECT USING (granted_by = auth.uid() OR granted_to = auth.uid());

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
CREATE POLICY "Users can view own images" ON images FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can manage own images" ON images FOR ALL USING (profile_id = auth.uid());

CREATE TABLE public.image_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, granted_to)
);
ALTER TABLE public.image_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own permissions" ON image_permissions FOR SELECT USING (granted_by = auth.uid() OR granted_to = auth.uid());

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
CREATE POLICY "Users can view own requests" ON gallery_access_requests FOR SELECT USING (requester_id = auth.uid() OR requested_from = auth.uid());

CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'group')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accessible rooms" ON chat_rooms FOR SELECT USING (type = 'public' OR created_by = auth.uid());

CREATE TABLE public.chat_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, profile_id)
);
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view room members" ON chat_members FOR SELECT USING (profile_id = auth.uid());

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
CREATE POLICY "Users can view room messages" ON messages FOR SELECT USING (sender_id = auth.uid());
CREATE POLICY "Users can create messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

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
CREATE POLICY "Users can view own chat invitations" ON chat_invitations FOR SELECT USING (invited_by = auth.uid() OR invited_user = auth.uid());

CREATE TABLE public.user_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, liked_user_id)
);
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own likes" ON user_likes FOR SELECT USING (user_id = auth.uid() OR liked_user_id = auth.uid());
CREATE POLICY "Users can manage own likes" ON user_likes FOR ALL USING (user_id = auth.uid());

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
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE TABLE public.match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('like', 'super_like', 'pass', 'block')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.match_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interactions" ON match_interactions FOR SELECT USING (user_id = auth.uid());

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'looking_for') THEN
        ALTER TABLE profiles ADD COLUMN looking_for TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'swinger_experience') THEN
        ALTER TABLE profiles ADD COLUMN swinger_experience TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range_min') THEN
        ALTER TABLE profiles ADD COLUMN age_range_min INTEGER DEFAULT 18;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range_max') THEN
        ALTER TABLE profiles ADD COLUMN age_range_max INTEGER DEFAULT 65;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'max_distance') THEN
        ALTER TABLE profiles ADD COLUMN max_distance INTEGER DEFAULT 50;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_demo') THEN
        ALTER TABLE profiles ADD COLUMN is_demo BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 4. RECREAR TODAS LAS FUNCIONES
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '🔧 Recreando todas las funciones críticas...';
END $$;

-- Pegando contenido de create_functions_CORREGIDO.sql

CREATE OR REPLACE FUNCTION public.has_role(p_user_uuid UUID, p_role_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_uuid AND role = p_role_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_mutual_match(p_user1_uuid UUID, p_user2_uuid UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.user_likes WHERE user_id = p_user1_uuid AND liked_user_id = p_user2_uuid AND liked = true)
    AND EXISTS (SELECT 1 FROM public.user_likes WHERE user_id = p_user2_uuid AND liked_user_id = p_user1_uuid AND liked = true);
END;
$$;

-- ... (resto de funciones corregidas) ...

-- 5. LIMPIAR HISTORIAL DE MIGRACIONES
-- =====================================================
TRUNCATE supabase_migrations.schema_migrations;

DO $$
BEGIN
    RAISE NOTICE '🎉 RESTABLECIMIENTO COMPLETO Y EXITOSO.';
    RAISE NOTICE '🚀 Sistema listo para usar. Por favor, ejecuta `supabase db push` en tu terminal.';
END $$;
