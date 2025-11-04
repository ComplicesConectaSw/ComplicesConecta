# Script para aplicar migraciones en Supabase remoto
# Version: 3.5.0
# 
# Este script genera comandos SQL para aplicar en Supabase Dashboard SQL Editor

$migrationsDir = "supabase\migrations"
$outputFile = "supabase\migraciones-para-remoto.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GENERANDO SCRIPT PARA MIGRACIONES REMOTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Migraciones a aplicar en remoto
$migrationsToApply = @(
    "20251104000000_create_missing_admin_tables.sql",
    "20251104000001_create_moderation_tables.sql",
    "20251104000002_create_media_tables.sql"
)

$scriptContent = @"
-- =====================================================
-- MIGRACIONES PARA APLICAR EN REMOTO (Supabase Dashboard)
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Version: 3.5.0
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar el script
-- 4. Verificar que las tablas se crearon correctamente
-- 
-- =====================================================

"@

foreach ($migration in $migrationsToApply) {
    $migrationPath = Join-Path $migrationsDir $migration
    
    if (Test-Path $migrationPath) {
        Write-Host "Agregando: $migration" -ForegroundColor Yellow
        
        $migrationContent = Get-Content $migrationPath -Raw
        
        $scriptContent += @"

-- =====================================================
-- MIGRACION: $migration
-- =====================================================

$migrationContent

-- =====================================================
-- FIN MIGRACION: $migration
-- =====================================================

"@
    } else {
        Write-Host "  ⚠️ No encontrada: $migration" -ForegroundColor Red
    }
}

# Agregar queries de verificación
$scriptContent += @"

-- =====================================================
-- VERIFICACION DE TABLAS CREADAS
-- =====================================================

-- Verificar tablas creadas
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN '✓ Existe'
        ELSE '✗ No existe'
    END as estado
FROM (VALUES
    ('comment_likes'),
    ('user_roles'),
    ('career_applications'),
    ('moderator_requests'),
    ('moderators'),
    ('moderation_logs'),
    ('user_suspensions'),
    ('media'),
    ('images'),
    ('media_access_logs')
) AS t(table_name);

-- Contar total de tablas
SELECT 
    COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

"@

# Guardar script
$scriptContent | Out-File -FilePath $outputFile -Encoding utf8

Write-Host ""
Write-Host "Script generado: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abrir Supabase Dashboard → SQL Editor" -ForegroundColor Yellow
Write-Host "  2. Copiar contenido de: $outputFile" -ForegroundColor Yellow
Write-Host "  3. Ejecutar en SQL Editor" -ForegroundColor Yellow
Write-Host "  4. Verificar resultados" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

