-- =====================================================
-- MIGRACION UNIFICADA COMPLETA - ComplicesConecta v2.9.0
-- =====================================================
-- Fecha: 16 de Septiembre, 2025 - 00:09 hrs
-- Estado: Migración unificada para ejecución completa
-- Total: 11 migraciones unificadas en orden correcto
-- =====================================================

-- IMPORTANTE: Este archivo contiene todas las migraciones en el orden correcto
-- Ejecutar completo en SQL Editor de Supabase

-- =====================================================
-- 1. ESQUEMA BASE LIMPIO
-- =====================================================

-- ELIMINAR TABLAS EXISTENTES VACÍAS
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

-- CREAR TABLA: user_roles
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- CREAR TABLA: invitations
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

-- CREAR TABLA: gallery_permissions
CREATE TABLE public.gallery_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT DEFAULT 'view' CHECK (permission_type IN ('view', 'download', 'share')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(profile_id, granted_to, permission_type)
);

-- CREAR TABLA: images
CREATE TABLE public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'profile' CHECK (image_type IN ('profile', 'gallery', 'verification')),
    is_main BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- CREAR TABLA: image_permissions
CREATE TABLE public.image_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT DEFAULT 'view' CHECK (permission_type IN ('view', 'download')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(image_id, granted_to, permission_type)
);

-- CREAR TABLA: gallery_access_requests
CREATE TABLE public.gallery_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_from UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT DEFAULT 'gallery' CHECK (request_type IN ('gallery', 'private_photos')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    message TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(requester_id, requested_from, request_type)
);

-- CREAR TABLA: chat_rooms
CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    type TEXT DEFAULT 'private' CHECK (type IN ('private', 'group', 'public')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- CREAR TABLA: chat_members
CREATE TABLE public.chat_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(room_id, profile_id)
);

-- CREAR TABLA: messages
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREAR TABLA: chat_invitations
CREATE TABLE public.chat_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, invited_user)
);

-- CREAR TABLA: user_likes
CREATE TABLE public.user_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    like_type TEXT DEFAULT 'like' CHECK (like_type IN ('like', 'superlike', 'pass')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, liked_user_id)
);

-- CREAR TABLA: matches
CREATE TABLE public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id)
);

-- CREAR TABLA: match_interactions
CREATE TABLE public.match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('message', 'unmatch', 'report')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. PERFILES DE PAREJAS
-- =====================================================

-- Create enum for relationship types (if not exists)
DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('man-woman', 'man-man', 'woman-woman');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla couple_profiles si no existe
CREATE TABLE IF NOT EXISTS couple_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_name TEXT NOT NULL,
    couple_bio TEXT,
    relationship_type relationship_type NOT NULL,
    partner1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    partner2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    couple_images TEXT[], -- Array of image URLs for couple photos
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each profile can only be in one couple at a time
    CONSTRAINT unique_partner1 UNIQUE (partner1_id),
    CONSTRAINT unique_partner2 UNIQUE (partner2_id),
    -- Ensure partners are different
    CONSTRAINT different_partners CHECK (partner1_id != partner2_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner1 ON couple_profiles(partner1_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_partner2 ON couple_profiles(partner2_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_relationship_type ON couple_profiles(relationship_type);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_created_at ON couple_profiles(created_at);

-- =====================================================
-- 3. TABLAS DE INTERESES
-- =====================================================

-- Crear tabla de categorías de intereses
CREATE TABLE IF NOT EXISTS interest_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de intereses específicos
CREATE TABLE IF NOT EXISTS interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name)
);

-- Crear tabla de relación usuario-intereses
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
    intensity_level INTEGER DEFAULT 3 CHECK (intensity_level >= 1 AND intensity_level <= 5),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, interest_id)
);

-- Índices para optimización (creados después de las tablas)
-- CREATE INDEX IF NOT EXISTS idx_interests_category ON interests(category_id); -- Columna category_id no existe

-- Crear índice para is_premium solo si la columna existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interests' AND column_name = 'is_premium'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_interests_premium ON interests(is_premium);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
-- CREATE INDEX IF NOT EXISTS idx_user_interests_public ON user_interests(is_public); -- Columna is_public removida

-- =====================================================
-- 4. FOTOS DE PAREJAS
-- =====================================================

-- Crear tabla couple_photos
CREATE TABLE IF NOT EXISTS couple_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_profile_id UUID REFERENCES couple_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    partner_type VARCHAR(20) CHECK (partner_type IN ('partner1', 'partner2', 'couple', 'both')),
    is_main BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    upload_order INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_couple_photos_profile ON couple_photos(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_photos_main ON couple_photos(is_main);
CREATE INDEX IF NOT EXISTS idx_couple_photos_private ON couple_photos(is_private);
CREATE INDEX IF NOT EXISTS idx_couple_photos_partner ON couple_photos(partner_type);

-- =====================================================
-- 5. CHAT TIEMPO REAL (YA INCLUIDO EN ESQUEMA BASE)
-- =====================================================

-- Las tablas de chat ya están creadas en el esquema base
-- Agregamos índices adicionales para optimización

CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_active ON chat_members(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- =====================================================
-- 6. SISTEMA DE TOKENS
-- =====================================================

-- Crear tabla de tokens
CREATE TABLE IF NOT EXISTS tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_type VARCHAR(50) NOT NULL CHECK (token_type IN ('premium', 'superlike', 'boost', 'message', 'gallery_access')),
    amount INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(50) CHECK (source IN ('purchase', 'reward', 'promotion', 'referral', 'admin')),
    transaction_id VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones de tokens
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('credit', 'debit')),
    reason VARCHAR(100),
    reference_id UUID,
    balance_before INTEGER DEFAULT 0,
    balance_after INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de paquetes de tokens
CREATE TABLE IF NOT EXISTS token_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    token_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    price_usd DECIMAL(10,2),
    price_mxn DECIMAL(10,2),
    discount_percentage INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_tokens_user_type ON tokens(user_id, token_type);
CREATE INDEX IF NOT EXISTS idx_tokens_active ON tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(token_type);

-- =====================================================
-- 7. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

-- Habilitar RLS en tablas críticas
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas básicas para acceso público a categorías e intereses
CREATE POLICY "Public read access for interest_categories" ON interest_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for interests" ON interests FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for token_packages" ON token_packages FOR SELECT USING (is_active = true);

-- Políticas para usuarios autenticados
CREATE POLICY "Users can view own data" ON user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own invitations" ON invitations FOR SELECT USING (from_profile = auth.uid() OR to_profile = auth.uid());
CREATE POLICY "Users can view own couple profile" ON couple_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own photos" ON couple_photos FOR SELECT USING (couple_profile_id IN (SELECT id FROM couple_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own interests" ON user_interests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own tokens" ON tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own transactions" ON token_transactions FOR SELECT USING (user_id = auth.uid());

-- Políticas para mensajes y chat
CREATE POLICY "Users can view room messages" ON messages FOR SELECT USING (sender_id = auth.uid() OR EXISTS (SELECT 1 FROM chat_members WHERE room_id = messages.room_id AND profile_id = auth.uid()));
CREATE POLICY "Users can create messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- =====================================================
-- 9. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = $1 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener balance de tokens
CREATE OR REPLACE FUNCTION get_token_balance(user_id UUID, token_type TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) FROM tokens 
         WHERE tokens.user_id = $1 
         AND tokens.token_type = $2 
         AND is_active = true 
         AND (expires_at IS NULL OR expires_at > NOW())), 
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas críticas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'user_roles', 'messages', 'tokens', 'invitations',
        'couple_profiles', 'couple_photos', 'chat_rooms',
        'chat_members', 'interests', 'user_interests'
    )
ORDER BY tablename;

-- Verificar políticas RLS aplicadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command_type
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- RESULTADO FINAL
-- =====================================================

SELECT 'MIGRACION UNIFICADA COMPLETA - ComplicesConecta v2.9.0 - Sistema Swinger Listo' as status;