-- =====================================================
-- 🚀 SCRIPT COMPLETO PARA SUPABASE SQL EDITOR
-- ComplicesConecta v2.1.2 - Project ID: axtvqnozatbmllvwzuim
-- Ejecutar en: https://supabase.com/dashboard/project/axtvqnozatbmllvwzuim/sql
-- =====================================================

-- 🖼️ CREAR TABLA: images
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
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    type TEXT DEFAULT 'private' CHECK (type IN ('private', 'group')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 CREAR TABLA: chat_members
CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    UNIQUE(room_id, user_id)
);

-- 📨 CREAR TABLA: messages
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
DO $$
BEGIN
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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'role') THEN
        ALTER TABLE public.user_roles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator'));
    END IF;
END $$;

-- 📤 AGREGAR COLUMNAS FALTANTES A invitations
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

-- 🔐 HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_invitations ENABLE ROW LEVEL SECURITY;

-- 👤 POLÍTICAS RLS PARA profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view public profiles" ON profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 🔐 POLÍTICAS RLS PARA user_roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 📤 POLÍTICAS RLS PARA invitations
DROP POLICY IF EXISTS "Users can view own invitations" ON invitations;
DROP POLICY IF EXISTS "Users can manage own invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON invitations;

CREATE POLICY "Users can view own invitations" ON invitations
    FOR SELECT USING (from_profile = auth.uid() OR to_profile = auth.uid());

CREATE POLICY "Users can manage own invitations" ON invitations
    FOR ALL USING (from_profile = auth.uid() OR to_profile = auth.uid());

CREATE POLICY "Admins can manage all invitations" ON invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 🖼️ POLÍTICAS RLS PARA gallery_permissions
DROP POLICY IF EXISTS "Users can view own gallery permissions" ON gallery_permissions;
DROP POLICY IF EXISTS "Users can manage own gallery permissions" ON gallery_permissions;
DROP POLICY IF EXISTS "Admins can manage all gallery permissions" ON gallery_permissions;

CREATE POLICY "Users can view own gallery permissions" ON gallery_permissions
    FOR SELECT USING (profile_id = auth.uid() OR granted_to = auth.uid());

CREATE POLICY "Users can manage own gallery permissions" ON gallery_permissions
    FOR ALL USING (profile_id = auth.uid() OR granted_by = auth.uid());

CREATE POLICY "Admins can manage all gallery permissions" ON gallery_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 🖼️ POLÍTICAS RLS PARA images
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can view public images" ON images;
DROP POLICY IF EXISTS "Users can manage own images" ON images;
DROP POLICY IF EXISTS "Admins can manage all images" ON images;

CREATE POLICY "Users can view own images" ON images
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can view public images" ON images
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own images" ON images
    FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all images" ON images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 🔑 POLÍTICAS RLS PARA image_permissions
DROP POLICY IF EXISTS "Users can view own image permissions" ON image_permissions;
DROP POLICY IF EXISTS "Users can manage own image permissions" ON image_permissions;
DROP POLICY IF EXISTS "Admins can manage all image permissions" ON image_permissions;

CREATE POLICY "Users can view own image permissions" ON image_permissions
    FOR SELECT USING (granted_to = auth.uid() OR granted_by = auth.uid());

CREATE POLICY "Users can manage own image permissions" ON image_permissions
    FOR ALL USING (granted_by = auth.uid());

CREATE POLICY "Admins can manage all image permissions" ON image_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 📋 POLÍTICAS RLS PARA gallery_access_requests
DROP POLICY IF EXISTS "Users can view own gallery requests" ON gallery_access_requests;
DROP POLICY IF EXISTS "Users can manage own gallery requests" ON gallery_access_requests;
DROP POLICY IF EXISTS "Admins can manage all gallery requests" ON gallery_access_requests;

CREATE POLICY "Users can view own gallery requests" ON gallery_access_requests
    FOR SELECT USING (requester_id = auth.uid() OR requested_from = auth.uid());

CREATE POLICY "Users can manage own gallery requests" ON gallery_access_requests
    FOR ALL USING (requester_id = auth.uid() OR requested_from = auth.uid());

CREATE POLICY "Admins can manage all gallery requests" ON gallery_access_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 💬 POLÍTICAS RLS PARA chat_rooms
DROP POLICY IF EXISTS "Users can view own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can manage own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can manage all chat rooms" ON chat_rooms;

CREATE POLICY "Users can view own chat rooms" ON chat_rooms
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE room_id = chat_rooms.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own chat rooms" ON chat_rooms
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all chat rooms" ON chat_rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 👥 POLÍTICAS RLS PARA chat_members
DROP POLICY IF EXISTS "Users can view chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can manage own membership" ON chat_members;
DROP POLICY IF EXISTS "Admins can manage all chat members" ON chat_members;

CREATE POLICY "Users can view chat members" ON chat_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_members cm2 
            WHERE cm2.room_id = chat_members.room_id AND cm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own membership" ON chat_members
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all chat members" ON chat_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 📨 POLÍTICAS RLS PARA messages
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON messages;
DROP POLICY IF EXISTS "Users can manage own messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;

CREATE POLICY "Users can view messages in their rooms" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE room_id = messages.room_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own messages" ON messages
    FOR ALL USING (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 📩 POLÍTICAS RLS PARA chat_invitations
DROP POLICY IF EXISTS "Users can view own chat invitations" ON chat_invitations;
DROP POLICY IF EXISTS "Users can manage own chat invitations" ON chat_invitations;
DROP POLICY IF EXISTS "Admins can manage all chat invitations" ON chat_invitations;

CREATE POLICY "Users can view own chat invitations" ON chat_invitations
    FOR SELECT USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Users can manage own chat invitations" ON chat_invitations
    FOR ALL USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Admins can manage all chat invitations" ON chat_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 📊 CREAR ÍNDICES OPTIMIZADOS
CREATE INDEX IF NOT EXISTS idx_images_profile_id ON public.images(profile_id);
CREATE INDEX IF NOT EXISTS idx_images_type ON public.images(type);
CREATE INDEX IF NOT EXISTS idx_chat_members_room_id ON public.chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON public.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_access_requests_requester ON public.gallery_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_gallery_access_requests_requested_from ON public.gallery_access_requests(requested_from);

-- 🔍 FUNCIÓN DE VALIDACIÓN COMPLETA
CREATE OR REPLACE FUNCTION public.validate_database_complete()
RETURNS TABLE (
    category TEXT,
    item TEXT,
    status TEXT,
    score INTEGER,
    details TEXT
) AS $$
DECLARE
    total_score INTEGER := 0;
    table_count INTEGER;
    rls_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Validar tablas críticas (40 puntos)
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
    );
    
    RETURN QUERY SELECT 
        'TABLAS'::TEXT,
        'Tablas Críticas'::TEXT,
        CASE WHEN table_count = 11 THEN 'COMPLETO' ELSE 'INCOMPLETO' END::TEXT,
        CASE WHEN table_count = 11 THEN 40 ELSE (table_count * 40 / 11) END::INTEGER,
        format('Encontradas: %s/11', table_count)::TEXT;
    
    total_score := total_score + CASE WHEN table_count = 11 THEN 40 ELSE (table_count * 40 / 11) END;

    -- Validar RLS habilitado (30 puntos)
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname IN (
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
    )
    AND c.relrowsecurity = true;
    
    RETURN QUERY SELECT 
        'SEGURIDAD'::TEXT,
        'RLS Habilitado'::TEXT,
        CASE WHEN rls_count = 11 THEN 'COMPLETO' ELSE 'INCOMPLETO' END::TEXT,
        CASE WHEN rls_count = 11 THEN 30 ELSE (rls_count * 30 / 11) END::INTEGER,
        format('RLS activo: %s/11 tablas', rls_count)::TEXT;
    
    total_score := total_score + CASE WHEN rls_count = 11 THEN 30 ELSE (rls_count * 30 / 11) END;

    -- Validar políticas RLS (20 puntos)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public';
    
    RETURN QUERY SELECT 
        'SEGURIDAD'::TEXT,
        'Políticas RLS'::TEXT,
        CASE WHEN policy_count >= 30 THEN 'COMPLETO' ELSE 'PARCIAL' END::TEXT,
        CASE WHEN policy_count >= 30 THEN 20 ELSE (policy_count * 20 / 30) END::INTEGER,
        format('Políticas creadas: %s (mínimo 30)', policy_count)::TEXT;
    
    total_score := total_score + CASE WHEN policy_count >= 30 THEN 20 ELSE (policy_count * 20 / 30) END;

    -- Puntuación final
    RETURN QUERY SELECT 
        'RESULTADO'::TEXT,
        'PUNTUACIÓN TOTAL'::TEXT,
        CASE 
            WHEN total_score >= 95 THEN 'EXCELENTE'
            WHEN total_score >= 85 THEN 'BUENO'
            WHEN total_score >= 70 THEN 'ACEPTABLE'
            ELSE 'REQUIERE MEJORAS'
        END::TEXT,
        total_score::INTEGER,
        format('Puntuación: %s/100 - Sistema %s para producción', 
            total_score,
            CASE WHEN total_score >= 90 THEN 'LISTO' ELSE 'NO LISTO' END
        )::TEXT;

END;
$$ LANGUAGE plpgsql;

-- ✅ EJECUTAR VALIDACIÓN FINAL
SELECT * FROM public.validate_database_complete();
