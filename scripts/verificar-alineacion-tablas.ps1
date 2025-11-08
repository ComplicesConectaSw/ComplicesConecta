# Script para verificar alineación de tablas entre local, remoto y backup
# Version: 3.5.0

$container = "supabase_db_axtvqnozatbmllvwzuim"
$backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$sourceDir = "supabase\migrations"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACION DE ALINEACION DE TABLAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Obtener tablas de LOCAL
Write-Host "1. Verificando tablas en LOCAL (Docker)..." -ForegroundColor Yellow
$localTablesOutput = docker exec $container psql -U postgres -d postgres -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
$localTables = $localTablesOutput | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() } | Sort-Object
Write-Host "   Tablas encontradas en LOCAL: $($localTables.Count)" -ForegroundColor Green
Write-Host ""

# 2. Obtener tablas del backup consolidado
Write-Host "2. Verificando tablas en BACKUP consolidado..." -ForegroundColor Yellow
$backupConsolidado = Get-ChildItem $backupDir -Directory | Where-Object { $_.Name -like "backup_consolidado_*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($backupConsolidado) {
    Write-Host "   Backup encontrado: $($backupConsolidado.Name)" -ForegroundColor Green
    
    # Extraer nombres de tablas de las migraciones en el backup
    $migrationFiles = Get-ChildItem $backupConsolidado.FullName -File | Where-Object { $_.Name -match '^\d{14}_' }
    Write-Host "   Migraciones en backup: $($migrationFiles.Count)" -ForegroundColor Gray
    
    # Buscar CREATE TABLE en migraciones
    $backupTables = @()
    foreach ($file in $migrationFiles) {
        $content = Get-Content $file.FullName -Raw
        $matches = [regex]::Matches($content, "CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?(\w+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($match in $matches) {
            if ($match.Groups[1].Value -notin $backupTables) {
                $backupTables += $match.Groups[1].Value
            }
        }
    }
    $backupTables = $backupTables | Sort-Object
    Write-Host "   Tablas definidas en backup: $($backupTables.Count)" -ForegroundColor Green
} else {
    Write-Host "   [ADVERTENCIA] No se encontro backup consolidado" -ForegroundColor Red
    $backupTables = @()
}
Write-Host ""

# 3. Extraer tablas usadas en el código
Write-Host "3. Extrayendo tablas usadas en el código..." -ForegroundColor Yellow
$codeTables = @()
$srcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }

foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Ignorar comentarios y líneas comentadas
    $lines = $content -split "`n"
    $uncommentedContent = ""
    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        # Ignorar líneas que empiezan con comentarios (//, /*, #)
        if ($trimmedLine -notmatch '^\s*//' -and $trimmedLine -notmatch '^\s*#' -and $trimmedLine -notmatch '^\s*/\*') {
            $uncommentedContent += $line + "`n"
        }
    }
    
    # Buscar tablas usadas (no vistas)
    $matches = [regex]::Matches($uncommentedContent, "\.from\(['""](\w+)['""]\)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($match in $matches) {
        $tableName = $match.Groups[1].Value
        # Ignorar vistas conocidas
        if ($tableName -notmatch '_with_partners$' -and $tableName -notin $codeTables) {
            $codeTables += $tableName
        }
    }
}
$codeTables = $codeTables | Sort-Object
Write-Host "   Tablas usadas en código: $($codeTables.Count)" -ForegroundColor Green
Write-Host ""

# 4. Comparar y reportar
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANALISIS DE ALINEACION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Filtrar vistas y tablas conocidas que son vistas o están en desarrollo
$knownViews = @('couple_profiles_with_partners')
# app_logs existe en remoto pero no en local - Preparada para implementación futura
$knownTODOs = @()  # app_logs removido: existe en remoto, preparada para uso futuro
$knownDeprecated = @('user_tokens')  # Se debe migrar a user_token_balances

# Tablas en código pero no en local (excluyendo vistas y TODOs)
$missingInLocal = $codeTables | Where-Object { 
    $_ -notin $localTables -and 
    $_ -notin $knownViews -and 
    $_ -notin $knownTODOs -and
    $_ -notin $knownDeprecated
}
if ($missingInLocal.Count -gt 0) {
    Write-Host "[ADVERTENCIA] TABLAS USADAS EN CODIGO PERO NO EN LOCAL:" -ForegroundColor Red
    $missingInLocal | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host ""
} else {
    Write-Host "[OK] Todas las tablas usadas en codigo existen en LOCAL" -ForegroundColor Green
    Write-Host ""
}

# Mostrar vistas y TODOs como información
if ($codeTables | Where-Object { $_ -in $knownViews -or $_ -in $knownTODOs -or $_ -in $knownDeprecated }) {
    Write-Host "ℹ️ TABLAS REFERENCIADAS (Vistas/TODOs/Deprecadas):" -ForegroundColor Gray
    $codeTables | Where-Object { $_ -in $knownViews } | ForEach-Object { Write-Host "   - $_ (Vista)" -ForegroundColor DarkGray }
    $codeTables | Where-Object { $_ -in $knownTODOs } | ForEach-Object { Write-Host "   - $_ (TODO - Pendiente implementar)" -ForegroundColor DarkGray }
    $codeTables | Where-Object { $_ -in $knownDeprecated } | ForEach-Object { Write-Host "   - $_ (Deprecada - Migrar a user_token_balances)" -ForegroundColor DarkGray }
    Write-Host ""
}

# Tablas en local pero no usadas en código
$unusedInLocal = $localTables | Where-Object { $_ -notin $codeTables -and $_ -ne "spatial_ref_sys" }
if ($unusedInLocal.Count -gt 0) {
    Write-Host "ℹ️ TABLAS EN LOCAL PERO NO USADAS EN CODIGO:" -ForegroundColor Gray
    Write-Host "   (Estas tablas están preparadas para funcionalidades futuras o sistemas de auditoría)" -ForegroundColor DarkGray
    $unusedInLocal | ForEach-Object { 
        $reason = ""
        switch ($_) {
            "ai_model_metrics" { $reason = " - Métricas de modelos IA (futuro)" }
            "ai_prediction_logs" { $reason = " - Logs de predicciones IA (futuro)" }
            "analytics_events" { $reason = " - Eventos de analytics (puede usarse en Edge Functions)" }
            "app_logs" { $reason = " - Sistema de logging (existe en remoto, preparada para uso futuro)" }
            "cache_statistics" { $reason = " - Estadísticas de caché (optimización futura)" }
            "invitation_statistics" { $reason = " - Estadísticas de invitaciones (analytics)" }
            "monitoring_sessions" { $reason = " - Sesiones de monitoreo v3.4.1" }
            "story_shares" { $reason = " - Compartidos de historias" }
            "summary_feedback" { $reason = " - Feedback de resúmenes de chat" }
            "worldid_rewards" { $reason = " - Recompensas World ID v3.4.1" }
            "worldid_statistics" { $reason = " - Estadísticas World ID v3.4.1" }
            "worldid_verifications" { $reason = " - Verificaciones World ID v3.4.1" }
            default { $reason = " - Tabla preparada para uso futuro" }
        }
        Write-Host "   - $_$reason" -ForegroundColor DarkGray 
    }
    Write-Host ""
}

# Tablas en backup pero no en local
if ($backupTables.Count -gt 0) {
    $missingFromBackup = $localTables | Where-Object { $_ -notin $backupTables }
    $missingFromLocal = $backupTables | Where-Object { $_ -notin $localTables }
    
    if ($missingFromBackup.Count -gt 0) {
        Write-Host "[ADVERTENCIA] TABLAS EN LOCAL PERO NO EN BACKUP:" -ForegroundColor Yellow
        Write-Host "   (Estas tablas pueden ser del sistema o creadas manualmente)" -ForegroundColor DarkGray
        $missingFromBackup | ForEach-Object { 
            if ($_ -eq "spatial_ref_sys") {
                Write-Host "   - $_ (Tabla del sistema PostGIS - NO debe estar en migraciones)" -ForegroundColor Green
            } else {
                Write-Host "   - $_" -ForegroundColor Yellow 
            }
        }
        Write-Host ""
    }
    
    if ($missingFromLocal.Count -gt 0) {
        Write-Host "ℹ️ TABLAS EN BACKUP PERO NO EN LOCAL:" -ForegroundColor Gray
        $missingFromLocal | ForEach-Object { Write-Host "   - $_" -ForegroundColor DarkGray }
        Write-Host ""
    }
}

# 5. Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tablas en LOCAL: $($localTables.Count)" -ForegroundColor Green
Write-Host "Tablas en BACKUP: $($backupTables.Count)" -ForegroundColor Green
Write-Host "Tablas usadas en CODIGO: $($codeTables.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "📊 NOTA: Las tablas en supabase.ts (115) son tipos generados desde Supabase REMOTO." -ForegroundColor Cyan
Write-Host "   Puede haber diferencias entre LOCAL (67) y REMOTO (115) si las migraciones" -ForegroundColor DarkGray
Write-Host "   no están sincronizadas. Ejecuta 'npx supabase db pull' para sincronizar." -ForegroundColor DarkGray
Write-Host ""
Write-Host "Tablas faltantes en LOCAL: $($missingInLocal.Count)" -ForegroundColor $(if ($missingInLocal.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Tablas no usadas en código: $($unusedInLocal.Count)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 6. Lista completa de tablas en local
Write-Host "LISTA COMPLETA DE TABLAS EN LOCAL:" -ForegroundColor Cyan
$localTables | ForEach-Object { Write-Host "  [OK] $_" -ForegroundColor Gray }
Write-Host ""

