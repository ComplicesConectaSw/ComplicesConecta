-- Script de validación de conexiones entre tablas
-- Fecha: 2025-09-25
-- Descripción: Verificar integridad referencial y conexiones FK

-- Verificar todas las foreign keys del sistema
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Verificar que todas las tablas existen
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN '✅ TABLA EXISTE'
        ELSE '⚠️ VISTA/OTRO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Contar registros en cada tabla
SELECT 
    'profiles' as tabla, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 
    'messages' as tabla, COUNT(*) as registros FROM messages
UNION ALL
SELECT 
    'invitations' as tabla, COUNT(*) as registros FROM invitations
UNION ALL
SELECT 
    'roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 
    'profile_cache' as tabla, COUNT(*) as registros FROM profile_cache
UNION ALL
SELECT 
    'staking' as tabla, COUNT(*) as registros FROM staking
UNION ALL
SELECT 
    'tokens' as tabla, COUNT(*) as registros FROM tokens
UNION ALL
SELECT 
    'sessions' as tabla, COUNT(*) as registros FROM sessions
UNION ALL
SELECT 
    'content_moderation' as tabla, COUNT(*) as registros FROM content_moderation
UNION ALL
SELECT 
    'reports' as tabla, COUNT(*) as registros FROM reports
UNION ALL
SELECT 
    'audit_logs' as tabla, COUNT(*) as registros FROM audit_logs
UNION ALL
SELECT 
    'security' as tabla, COUNT(*) as registros FROM security
ORDER BY tabla;

-- Verificar integridad referencial (huérfanos)
SELECT 'messages_sender_orphans' as check_name, COUNT(*) as orphan_count
FROM messages m 
LEFT JOIN profiles p ON m.sender_id = p.id 
WHERE p.id IS NULL

UNION ALL

SELECT 'messages_receiver_orphans' as check_name, COUNT(*) as orphan_count
FROM messages m 
LEFT JOIN profiles p ON m.receiver_id = p.id 
WHERE p.id IS NULL

UNION ALL

SELECT 'invitations_sender_orphans' as check_name, COUNT(*) as orphan_count
FROM invitations i 
LEFT JOIN profiles p ON i.sender_id = p.id 
WHERE p.id IS NULL

UNION ALL

SELECT 'invitations_receiver_orphans' as check_name, COUNT(*) as orphan_count
FROM invitations i 
LEFT JOIN profiles p ON i.receiver_id = p.id 
WHERE p.id IS NULL;
