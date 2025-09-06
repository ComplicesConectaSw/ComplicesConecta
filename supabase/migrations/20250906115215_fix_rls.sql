-- =====================================================
-- 🛡️ MIGRACIÓN: HABILITAR RLS Y POLÍTICAS DE SEGURIDAD
-- ComplicesConecta v2.1.2 - Row Level Security
-- Fecha: 06 de septiembre, 2025
-- =====================================================

-- 🔐 HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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

-- ✅ CONFIRMACIÓN
DO $$
BEGIN
    RAISE NOTICE '🛡️ MIGRACIÓN fix_rls COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '🔐 RLS habilitado en 11 tablas críticas';
    RAISE NOTICE '📋 Políticas de seguridad aplicadas: propietario → acceso propio, admin → acceso total';
    RAISE NOTICE '🚀 Sistema de seguridad completamente configurado';
END $$;