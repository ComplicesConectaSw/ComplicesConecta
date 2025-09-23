-- =====================================================
-- 🛡️ HABILITAR RLS Y VERIFICAR ESTRUCTURA COMPLETA
-- ComplicesConecta v2.1.2 - Completar configuración
-- =====================================================

-- 1️⃣ HABILITAR RLS EN TODAS LAS TABLAS
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

-- 2️⃣ VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3️⃣ VERIFICAR ESTRUCTURA DE TABLAS CRÍTICAS
SELECT 
    'images' as tabla,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'images' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'profiles' as tabla,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'chat_rooms' as tabla,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_rooms' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4️⃣ CONTAR COLUMNAS POR TABLA
SELECT 
    table_name,
    COUNT(*) as total_columnas
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN (
    'profiles', 'user_roles', 'invitations', 'gallery_permissions',
    'images', 'image_permissions', 'gallery_access_requests',
    'chat_rooms', 'chat_members', 'messages', 'chat_invitations'
)
GROUP BY table_name
ORDER BY table_name;

-- 5️⃣ VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as comando,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
