-- =====================================================
-- SISTEMA AUTOMÁTICO DE CORRECCIÓN DE BASE DE DATOS
-- ComplicesConecta v2.1.2 - Auditoría y Reparación Completa
-- Fecha: 06 de septiembre, 2025 - 05:32 hrs
-- =====================================================

-- SISTEMA AUDITOR Y REPARADOR AUTOMÁTICO SUPABASE
-- Detecta, crea y corrige toda la base de datos automáticamente
-- Scripts idempotentes - seguros para ejecutar múltiples veces

-- 🔍 PASO 1: AUDITORÍA Y CREACIÓN DE TABLAS CRÍTICAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🤖 INICIANDO SISTEMA AUTOMÁTICO DE CORRECCIÓN';
    RAISE NOTICE '⏰ Fecha: %', NOW();
    RAISE NOTICE '🔍 Auditando y creando tablas críticas...';
END $$;

-- 1.1 CREAR TABLA IMAGES (si no existe)
CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'profile' CHECK (type IN ('profile', 'gallery')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 CREAR TABLA IMAGE_PERMISSIONS (si no existe)
CREATE TABLE IF NOT EXISTS public.image_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
    granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, granted_to)
);

-- 1.3 CREAR TABLA GALLERY_ACCESS_REQUESTS (si no existe)
CREATE TABLE IF NOT EXISTS public.gallery_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, target_profile_id)
);

-- 1.4 CREAR TABLA CHAT_ROOMS (si no existe)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5 CREAR TABLA CHAT_MEMBERS (si no existe)
CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, profile_id)
);

-- 1.6 CREAR TABLA MESSAGES (si no existe)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.7 CREAR TABLA CHAT_INVITATIONS (si no existe)
CREATE TABLE IF NOT EXISTS public.chat_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, invited_user)
);

-- 1.8 CREAR TABLA USER_LIKES (si no existe)
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, liked_user_id)
);

-- 1.9 CREAR TABLA MATCHES (si no existe)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    compatibility_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- 1.10 CREAR TABLA MATCH_INTERACTIONS (si no existe)
CREATE TABLE IF NOT EXISTS public.match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('like', 'super_like', 'pass', 'block')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    RAISE NOTICE '✅ Tablas críticas creadas/verificadas exitosamente';
END $$;

-- 🔧 PASO 2: AGREGAR COLUMNAS CRÍTICAS FALTANTES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Agregando columnas críticas faltantes...';
END $$;

-- 2.1 Agregar columnas faltantes en PROFILES
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

-- 2.2 Agregar columnas faltantes en USER_ROLES
DO $$ 
BEGIN
    -- Crear tabla user_roles si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        CREATE TABLE public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'demo')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        RAISE NOTICE '  ✅ Tabla user_roles creada';
    END IF;
END $$;

-- 2.3 Verificar y agregar columnas en INVITATIONS
DO $$ 
BEGIN
    -- Crear tabla invitations si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'invitations' AND table_schema = 'public') THEN
        CREATE TABLE public.invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            from_profile UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            to_profile UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
            type TEXT DEFAULT 'connection' CHECK (type IN ('connection', 'gallery', 'chat')),
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(from_profile, to_profile, type)
        );
        RAISE NOTICE '  ✅ Tabla invitations creada';
    END IF;
END $$;

-- 2.4 Verificar y agregar columnas en GALLERY_PERMISSIONS
DO $$ 
BEGIN
    -- Crear tabla gallery_permissions si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'gallery_permissions' AND table_schema = 'public') THEN
        CREATE TABLE public.gallery_permissions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            granted_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(profile_id, granted_to)
        );
        RAISE NOTICE '  ✅ Tabla gallery_permissions creada';
    END IF;
    
    -- Verificar si existe la columna swinger_experience
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'swinger_experience') THEN
        ALTER TABLE profiles ADD COLUMN swinger_experience TEXT DEFAULT 'beginner';
    END IF;
    
    -- Verificar si existe la columna age_range_min
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'age_range_min') THEN
        ALTER TABLE profiles ADD COLUMN age_range_min INTEGER DEFAULT 18;
    END IF;
    
    -- Verificar si existe la columna age_range_max
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'age_range_max') THEN
        ALTER TABLE profiles ADD COLUMN age_range_max INTEGER DEFAULT 65;
    END IF;
    
    -- Verificar si existe la columna max_distance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'max_distance') THEN
        ALTER TABLE profiles ADD COLUMN max_distance INTEGER DEFAULT 50;
    END IF;
END $$;

-- Tabla user_roles (crear si no existe)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla invitations (crear si no existe)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('profile', 'gallery', 'chat')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id, type)
);

-- Tabla gallery_permissions (crear si no existe)
CREATE TABLE IF NOT EXISTS gallery_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL DEFAULT 'private' CHECK (permission_type IN ('public', 'private')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, viewer_id)
);

-- Tabla images (crear si no existe)
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    bucket_name TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    is_public BOOLEAN DEFAULT false,
    is_profile_image BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla image_permissions (crear si no existe)
CREATE TABLE IF NOT EXISTS image_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL DEFAULT 'view' CHECK (permission_type IN ('view', 'download')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(image_id, user_id)
);

-- Tabla gallery_access_requests (crear si no existe)
CREATE TABLE IF NOT EXISTS gallery_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, owner_id)
);

-- Tabla chat_rooms (crear si no existe)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla chat_members (crear si no existe)
CREATE TABLE IF NOT EXISTS chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Tabla messages (crear si no existe)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla chat_invitations (crear si no existe)
CREATE TABLE IF NOT EXISTS chat_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, invitee_id)
);

-- Tabla user_likes (crear si no existe)
CREATE TABLE IF NOT EXISTS user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    like_type TEXT NOT NULL DEFAULT 'like' CHECK (like_type IN ('like', 'super_like', 'pass')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(liker_id, liked_id)
);

-- Tabla matches (crear si no existe)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Asegurar orden consistente
);

-- Tabla match_interactions (crear si no existe)
CREATE TABLE IF NOT EXISTS match_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message', 'unmatch', 'report')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 2: CREAR FUNCIONES CRÍTICAS FALTANTES
-- =====================================================

-- Función has_role (crear si no existe)
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid AND role = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función handle_new_user (crear si no existe)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    
    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (NEW.id, 'user', NOW(), NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función update_updated_at_column (crear si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función exec_sql (crear si no existe)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS TEXT AS $$
BEGIN
    EXECUTE sql_query;
    RETURN 'Query executed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función detect_mutual_match (crear si no existe)
CREATE OR REPLACE FUNCTION detect_mutual_match(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    mutual_like BOOLEAN := FALSE;
BEGIN
    -- Verificar si ambos usuarios se han dado like mutuamente
    SELECT EXISTS (
        SELECT 1 FROM user_likes 
        WHERE liker_id = user1_uuid AND liked_id = user2_uuid AND like_type = 'like'
    ) AND EXISTS (
        SELECT 1 FROM user_likes 
        WHERE liker_id = user2_uuid AND liked_id = user1_uuid AND like_type = 'like'
    ) INTO mutual_like;
    
    -- Si hay match mutuo, crear el registro en matches
    IF mutual_like AND NOT EXISTS (
        SELECT 1 FROM matches 
        WHERE (user1_id = LEAST(user1_uuid, user2_uuid) AND user2_id = GREATEST(user1_uuid, user2_uuid))
    ) THEN
        INSERT INTO matches (user1_id, user2_id, matched_at, is_active)
        VALUES (LEAST(user1_uuid, user2_uuid), GREATEST(user1_uuid, user2_uuid), NOW(), true);
    END IF;
    
    RETURN mutual_like;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función get_user_matches (crear si no existe)
CREATE OR REPLACE FUNCTION get_user_matches(user_uuid UUID)
RETURNS TABLE (
    match_id UUID,
    matched_user_id UUID,
    matched_at TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        CASE 
            WHEN m.user1_id = user_uuid THEN m.user2_id
            ELSE m.user1_id
        END as matched_user_id,
        m.matched_at,
        m.is_active
    FROM matches m
    WHERE (m.user1_id = user_uuid OR m.user2_id = user_uuid)
      AND m.is_active = true
    ORDER BY m.matched_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función get_potential_matches (crear si no existe)
CREATE OR REPLACE FUNCTION get_potential_matches(
    user_uuid UUID,
    max_distance_km INTEGER DEFAULT 50,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 65
)
RETURNS TABLE (
    user_id UUID,
    distance_km NUMERIC,
    compatibility_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        0::NUMERIC as distance_km, -- Placeholder para cálculo de distancia
        50 as compatibility_score   -- Placeholder para score de compatibilidad
    FROM profiles p
    WHERE p.id != user_uuid
      AND p.id NOT IN (
          SELECT liked_id FROM user_likes WHERE liker_id = user_uuid
      )
      AND p.id NOT IN (
          SELECT CASE 
              WHEN user1_id = user_uuid THEN user2_id
              ELSE user1_id
          END FROM matches 
          WHERE (user1_id = user_uuid OR user2_id = user_uuid)
      )
    ORDER BY compatibility_score DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: CREAR TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Trigger para actualizar updated_at en profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en invitations
DROP TRIGGER IF EXISTS trg_invitations_updated_at ON invitations;
CREATE TRIGGER trg_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en images
DROP TRIGGER IF EXISTS trg_images_updated_at ON images;
CREATE TRIGGER trg_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear perfil automáticamente al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- PASO 4: HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

-- Habilitar RLS en todas las tablas críticas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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

-- PASO 5: CREAR ÍNDICES DE PERFORMANCE
-- =====================================================

-- Índices para user_likes
CREATE INDEX IF NOT EXISTS idx_user_likes_liker_id ON user_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_liked_id ON user_likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_created_at ON user_likes(created_at);

-- Índices para matches
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);
CREATE INDEX IF NOT EXISTS idx_matches_is_active ON matches(is_active);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles USING GIN(looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON profiles(age_range_min, age_range_max);

-- Índices para invitations
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_receiver_id ON invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Índices para images
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_is_profile_image ON images(is_profile_image);

-- Índices para chat
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_room_id ON chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);

-- =====================================================
-- FIN DEL SCRIPT DE CORRECCIÓN AUTOMÁTICA
-- =====================================================

-- Mensaje de finalización
SELECT 'CORRECCIÓN AUTOMÁTICA COMPLETADA - ComplicesConecta v2.1.2' as resultado;
