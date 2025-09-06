-- =====================================================
-- 🔍 VERIFICACIÓN DIRECTA DE TABLAS Y COLUMNAS
-- ComplicesConecta v2.1.2 - Supabase Project: axtvqnozatbmllvwzuim
-- =====================================================

-- Verificar columnas de user_roles
SELECT 'user_roles' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar columnas de invitations
SELECT 'invitations' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invitations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar columnas de images
SELECT 'images' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'images' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar columnas de chat_rooms
SELECT 'chat_rooms' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_rooms' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'invitations', 'images', 'chat_rooms', 'messages', 'matches')
ORDER BY tablename;

-- Contar políticas RLS
SELECT schemaname, tablename, COUNT(*) as policies_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
