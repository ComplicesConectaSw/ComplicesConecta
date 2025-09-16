-- =====================================================
-- 🗃️ ORDEN DE EJECUCIÓN DE MIGRACIONES - ComplicesConecta v2.9.0
-- =====================================================
-- Fecha: 16 de Septiembre, 2025 - 00:03 hrs
-- Estado: RLS Policies aplicadas correctamente - ComplicesConecta
-- Total: 11 migraciones, 90.4KB de código SQL
-- =====================================================

-- IMPORTANTE: Las migraciones deben ejecutarse en este orden exacto
-- para evitar conflictos de dependencias y constraints

-- =====================================================
-- 1. ESQUEMA BASE LIMPIO (10.6KB)
-- =====================================================
-- Archivo: 20250906125234_clean_final_schema.sql
-- Descripción: Esquema base limpio con tablas fundamentales
-- Dependencias: Ninguna
-- Estado: ✅ Aplicada

-- =====================================================
-- 2. PERFILES DE PAREJAS (5.7KB)
-- =====================================================
-- Archivo: 20250107_create_couple_profiles.sql
-- Descripción: Perfiles de parejas swinger
-- Dependencias: clean_final_schema
-- Estado: ✅ Aplicada

-- =====================================================
-- 3. TABLAS DE INTERESES (4.3KB)
-- =====================================================
-- Archivo: 20250914_add_interests_tables.sql
-- Descripción: Tablas de intereses lifestyle swinger
-- Dependencias: couple_profiles
-- Estado: ✅ Aplicada

-- =====================================================
-- 4. FOTOS DE PAREJAS (4.9KB)
-- =====================================================
-- Archivo: 20250914103600_create_couple_photos_table.sql
-- Descripción: Sistema de fotos para parejas
-- Dependencias: couple_profiles, interests_tables
-- Estado: ✅ Aplicada

-- =====================================================
-- 5. CHAT TIEMPO REAL (10.4KB)
-- =====================================================
-- Archivo: 20250914103700_create_chat_realtime_tables.sql
-- Descripción: Sistema de chat en tiempo real
-- Dependencias: couple_profiles, couple_photos
-- Estado: ✅ Aplicada

-- =====================================================
-- 6. SISTEMA DE TOKENS (16.2KB)
-- =====================================================
-- Archivo: 20250906_05_create_token_system.sql
-- Descripción: Sistema completo de tokens premium
-- Dependencias: chat_realtime_tables
-- Estado: ✅ Aplicada

-- =====================================================
-- 7. RLS TOKENS (7.8KB)
-- =====================================================
-- Archivo: 20250906_06_create_token_rls.sql
-- Descripción: Políticas RLS para sistema de tokens
-- Dependencias: token_system
-- Estado: ✅ Aplicada

-- =====================================================
-- 8. HABILITAR RLS GENERAL (2.5KB)
-- =====================================================
-- Archivo: HABILITAR_RLS_COMPLETO.sql
-- Descripción: Habilitar RLS en todas las tablas críticas
-- Dependencias: token_rls
-- Estado: ✅ Aplicada

-- =====================================================
-- 9. VALIDACIÓN PERFILES (4.6KB)
-- =====================================================
-- Archivo: rls-profiles-validation.sql
-- Descripción: Validación y políticas RLS para perfiles
-- Dependencias: RLS_COMPLETO
-- Estado: ✅ Aplicada

-- =====================================================
-- 10. RLS ESPECÍFICO (12KB)
-- =====================================================
-- Archivo: rls-messages-tokens-invitations.sql
-- Descripción: Políticas RLS específicas para mensajes, tokens e invitaciones
-- Dependencias: profiles_validation
-- Estado: ✅ Aplicada

-- =====================================================
-- 11. CORRECCIÓN FINAL RLS (12.2KB)
-- =====================================================
-- Archivo: rls-fix-20250915.sql
-- Descripción: Corrección final de políticas RLS y constraints
-- Dependencias: rls_messages_tokens_invitations
-- Estado: ✅ Aplicada

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas críticas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 'messages', 'tokens', 'invitations',
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

-- Verificar constraints únicos
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;

-- Verificar índices de performance
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
-- RESULTADO ESPERADO
-- =====================================================
-- Estado: RLS Policies aplicadas correctamente - ComplicesConecta
-- Tablas con RLS: 10+ tablas críticas
-- Políticas RLS: 30+ políticas activas
-- Constraints: unique_email_profiles y otros
-- Índices: 15+ índices de performance
-- =====================================================

SELECT 'MIGRACIÓN COMPLETA - ComplicesConecta v2.9.0 - Sistema Swinger Listo' as status;
