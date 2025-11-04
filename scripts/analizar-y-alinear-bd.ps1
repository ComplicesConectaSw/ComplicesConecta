# Script para analizar y alinear BD local y remoto
# Version: 3.5.0

$container = "supabase_db_axtvqnozatbmllvwzuim"
$backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$currentMigrationsDir = "supabase\migrations"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANALISIS Y ALINEACION DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Obtener tablas en local
Write-Host "1. Obteniendo tablas en base de datos local..." -ForegroundColor Yellow
$localTablesOutput = docker exec $container psql -U postgres -d postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
$localTables = $localTablesOutput -split "`n" | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() }
$localTablesCount = ($localTables | Measure-Object).Count
Write-Host "   Tablas encontradas en local: $localTablesCount" -ForegroundColor Green
Write-Host ""

# 2. Listar tablas esperadas segun tipos
Write-Host "2. Tablas esperadas segun tipos de Supabase:" -ForegroundColor Yellow
$expectedTables = @(
    'ai_compatibility_scores', 'ai_model_metrics', 'ai_prediction_logs',
    'analytics_events', 'biometric_sessions', 'blocked_ips', 'cache_statistics',
    'chat_members', 'chat_messages', 'chat_rooms', 'chat_summaries',
    'couple_events', 'couple_interactions', 'couple_matches',
    'couple_profile_likes', 'couple_profile_reports', 'couple_profile_views',
    'couple_profiles', 'error_alerts', 'gallery_permissions',
    'invitation_statistics', 'invitation_templates', 'invitations',
    'matches', 'messages', 'monitoring_sessions', 'notifications',
    'performance_metrics', 'profiles', 'referral_rewards',
    'referral_statistics', 'referral_transactions', 'reports',
    'security_events', 'spatial_ref_sys', 'staking_records', 'stories',
    'story_comments', 'story_likes', 'story_shares', 'summary_feedback',
    'summary_requests', 'swinger_interests', 'token_analytics',
    'token_transactions', 'two_factor_auth', 'user_interests',
    'user_referral_balances', 'user_token_balances', 'web_vitals_history',
    'worldid_rewards', 'worldid_statistics', 'worldid_verifications'
)
Write-Host "   Tablas esperadas: $($expectedTables.Count)" -ForegroundColor Green
Write-Host ""

# 3. Comparar tablas
Write-Host "3. Comparando tablas..." -ForegroundColor Yellow
$missingTables = @()
foreach ($table in $expectedTables) {
    if ($localTables -notcontains $table) {
        $missingTables += $table
    }
}

if ($missingTables.Count -eq 0) {
    Write-Host "   OK: Todas las tablas esperadas existen en local" -ForegroundColor Green
} else {
    Write-Host "   ADVERTENCIA: Tablas faltantes en local: $($missingTables.Count)" -ForegroundColor Yellow
    foreach ($table in $missingTables) {
        Write-Host "      - $table" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Analizar migraciones de respaldo
Write-Host "4. Analizando migraciones de respaldo..." -ForegroundColor Yellow
if (Test-Path $backupDir) {
    $backupFiles = Get-ChildItem $backupDir -File | Select-Object -ExpandProperty Name
    Write-Host "   Archivos de respaldo encontrados: $($backupFiles.Count)" -ForegroundColor Green
    
    # Identificar archivos de respaldo obsoletos (backups antiguos)
    $obsoleteFiles = $backupFiles | Where-Object { $_ -like "backup_*" -or $_ -like "full_backup_*" }
    Write-Host "   Archivos obsoletos (backups antiguos): $($obsoleteFiles.Count)" -ForegroundColor Yellow
    
    if ($obsoleteFiles.Count -gt 0) {
        Write-Host "   Archivos obsoletos a eliminar:" -ForegroundColor Yellow
        foreach ($file in $obsoleteFiles) {
            Write-Host "      - $file" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ADVERTENCIA: Directorio de respaldo no existe: $backupDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "   OK: Directorio de respaldo creado" -ForegroundColor Green
}
Write-Host ""

# 5. Crear backup de migraciones actuales
Write-Host "5. Creando backup de migraciones actuales..." -ForegroundColor Yellow
if (Test-Path $currentMigrationsDir) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupSubDir = Join-Path $backupDir "migraciones_actuales_$timestamp"
    New-Item -ItemType Directory -Path $backupSubDir -Force | Out-Null
    
    Copy-Item "$currentMigrationsDir\*" -Destination $backupSubDir -Recurse -Force
    $copiedFiles = (Get-ChildItem $backupSubDir -File).Count
    Write-Host "   OK: Backup creado en: $backupSubDir" -ForegroundColor Green
    Write-Host "   Archivos copiados: $copiedFiles" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Directorio de migraciones actuales no existe" -ForegroundColor Red
}
Write-Host ""

# 6. Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tablas en local: $localTablesCount" -ForegroundColor Green
Write-Host "Tablas esperadas: $($expectedTables.Count)" -ForegroundColor Green
$missingCount = $missingTables.Count
$missingColor = if ($missingCount -eq 0) { "Green" } else { "Yellow" }
Write-Host "Tablas faltantes: $missingCount" -ForegroundColor $missingColor
Write-Host ""
