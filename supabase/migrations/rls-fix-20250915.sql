-- RLS Security Policies Fix - ComplicesConecta
-- Fecha: 2025-09-15
-- Objetivo: Asegurar políticas RLS estrictas para profiles, messages, tokens

-- =====================================================
-- 1. PROFILES TABLE - RLS POLICIES
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Habilitar RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuarios pueden ver perfiles públicos y el suyo propio
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        -- Perfil propio
        auth.uid() = id
        OR
        -- Perfiles públicos (no demo, verificados)
        (is_demo = false AND is_verified = true)
        OR
        -- Admins pueden ver todos
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política INSERT: Solo usuarios autenticados pueden crear su perfil
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
        AND auth.uid() IS NOT NULL
    );

-- Política UPDATE: Solo el dueño puede modificar su perfil
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth.uid() = id
        OR
        -- Admins pueden modificar perfiles
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política DELETE: Solo el dueño o admin puede eliminar
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- 2. MESSAGES TABLE - RLS POLICIES
-- =====================================================

-- Verificar si la tabla messages existe, si no, crearla
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    chat_room_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON messages;

-- Habilitar RLS en messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Solo participantes del chat pueden ver mensajes
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        -- Sender puede ver sus mensajes
        auth.uid() = sender_id
        OR
        -- Receiver puede ver mensajes dirigidos a él
        auth.uid() = receiver_id
        OR
        -- Admins pueden ver todos los mensajes
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política INSERT: Solo usuarios autenticados pueden enviar mensajes
CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND auth.uid() IS NOT NULL
        AND sender_id != receiver_id -- No enviarse mensajes a sí mismo
    );

-- Política UPDATE: Solo el sender puede modificar sus mensajes (marcar como leído, etc.)
CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (
        auth.uid() = sender_id
        OR
        auth.uid() = receiver_id -- Receiver puede marcar como leído
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política DELETE: Solo el sender puede eliminar sus mensajes
CREATE POLICY "messages_delete_policy" ON messages
    FOR DELETE USING (
        auth.uid() = sender_id
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- 3. TOKENS TABLE - RLS POLICIES
-- =====================================================

-- Verificar si la tabla tokens existe, si no, crearla
CREATE TABLE IF NOT EXISTS tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token_type VARCHAR(50) NOT NULL, -- 'CMPX', 'GTK', etc.
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    transaction_type VARCHAR(50), -- 'earned', 'spent', 'transferred'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "tokens_select_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_insert_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_update_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_delete_policy" ON tokens;

-- Habilitar RLS en tokens
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Solo el propietario puede ver sus tokens
CREATE POLICY "tokens_select_policy" ON tokens
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        -- Admins pueden ver todos los tokens
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política INSERT: Solo el sistema o admins pueden crear tokens
CREATE POLICY "tokens_insert_policy" ON tokens
    FOR INSERT WITH CHECK (
        -- Solo admins pueden insertar tokens
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
        OR
        -- O el propio usuario para ciertos tipos de transacciones
        (auth.uid() = user_id AND transaction_type IN ('earned', 'referral'))
    );

-- Política UPDATE: Solo admins pueden modificar tokens
CREATE POLICY "tokens_update_policy" ON tokens
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política DELETE: Solo admins pueden eliminar tokens
CREATE POLICY "tokens_delete_policy" ON tokens
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- 4. INVITATIONS TABLE - RLS POLICIES
-- =====================================================

-- Verificar si la tabla invitations existe
-- (Asumiendo que ya existe basado en el código)

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "invitations_select_policy" ON invitations;
DROP POLICY IF EXISTS "invitations_insert_policy" ON invitations;
DROP POLICY IF EXISTS "invitations_update_policy" ON invitations;
DROP POLICY IF EXISTS "invitations_delete_policy" ON invitations;

-- Habilitar RLS en invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Solo participantes pueden ver invitaciones
CREATE POLICY "invitations_select_policy" ON invitations
    FOR SELECT USING (
        auth.uid() = from_profile
        OR
        auth.uid() = to_profile
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política INSERT: Solo usuarios autenticados pueden crear invitaciones
CREATE POLICY "invitations_insert_policy" ON invitations
    FOR INSERT WITH CHECK (
        auth.uid() = from_profile
        AND auth.uid() IS NOT NULL
        AND from_profile != to_profile
    );

-- Política UPDATE: Solo el destinatario puede responder invitaciones
CREATE POLICY "invitations_update_policy" ON invitations
    FOR UPDATE USING (
        auth.uid() = to_profile
        OR
        auth.uid() = from_profile -- Sender puede cancelar
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Política DELETE: Solo el creador puede eliminar invitaciones
CREATE POLICY "invitations_delete_policy" ON invitations
    FOR DELETE USING (
        auth.uid() = from_profile
        OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- 5. CONSTRAINT PARA EMAIL ÚNICO
-- =====================================================

-- Verificar y agregar columna is_verified si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Agregar constraint de email único en profiles
ALTER TABLE profiles 
ADD CONSTRAINT unique_email_profiles 
UNIQUE (email);

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para mejorar performance de las consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_tokens_user_type ON tokens(user_id, token_type);
CREATE INDEX IF NOT EXISTS idx_invitations_from_to ON invitations(from_profile, to_profile);

-- =====================================================
-- 7. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si dos usuarios están conectados
CREATE OR REPLACE FUNCTION are_connected(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM invitations 
        WHERE ((from_profile = user1_id AND to_profile = user2_id)
               OR (from_profile = user2_id AND to_profile = user1_id))
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON POLICY "profiles_select_policy" ON profiles IS 
'Permite ver perfiles públicos verificados y el perfil propio. Admins ven todos.';

COMMENT ON POLICY "messages_select_policy" ON messages IS 
'Solo participantes del chat pueden ver mensajes. Admins ven todos.';

COMMENT ON POLICY "tokens_select_policy" ON tokens IS 
'Solo el propietario puede ver sus tokens. Admins ven todos.';

COMMENT ON POLICY "invitations_select_policy" ON invitations IS 
'Solo participantes de la invitación pueden verla. Admins ven todas.';

-- Finalización
SELECT 'RLS Policies aplicadas correctamente - ComplicesConecta' as status;
