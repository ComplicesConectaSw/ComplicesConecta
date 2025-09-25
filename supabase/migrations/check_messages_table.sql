-- Script para verificar la estructura actual de la tabla messages
-- Fecha: 22/09/2025 20:52 hrs

-- 1. Verificar si la tabla messages existe
SELECT 
    table_name, 
    table_schema 
FROM information_schema.tables 
WHERE table_name = 'messages' 
    AND table_schema = 'public';

-- 2. Verificar columnas de la tabla messages (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si existe la tabla conversations
SELECT 
    table_name, 
    table_schema 
FROM information_schema.tables 
WHERE table_name = 'conversations' 
    AND table_schema = 'public';

-- 4. Listar todas las tablas disponibles
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
