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
    Write-Host "   ⚠️ No se encontró backup consolidado" -ForegroundColor Red
    $backupTables = @()
}
Write-Host ""

# 3. Extraer tablas usadas en el código
Write-Host "3. Extrayendo tablas usadas en el código..." -ForegroundColor Yellow
$codeTables = @()
$srcFiles = Get-ChildItem "src" -Recurse -File -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\." }

foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw
    $matches = [regex]::Matches($content, "\.from\(['""](\w+)['""]\)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($match in $matches) {
        $tableName = $match.Groups[1].Value
        if ($tableName -notin $codeTables) {
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

# Tablas en código pero no en local
$missingInLocal = $codeTables | Where-Object { $_ -notin $localTables }
if ($missingInLocal.Count -gt 0) {
    Write-Host "⚠️ TABLAS USADAS EN CODIGO PERO NO EN LOCAL:" -ForegroundColor Red
    $missingInLocal | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host ""
} else {
    Write-Host "✅ Todas las tablas usadas en código existen en LOCAL" -ForegroundColor Green
    Write-Host ""
}

# Tablas en local pero no usadas en código
$unusedInLocal = $localTables | Where-Object { $_ -notin $codeTables -and $_ -ne "spatial_ref_sys" }
if ($unusedInLocal.Count -gt 0) {
    Write-Host "ℹ️ TABLAS EN LOCAL PERO NO USADAS EN CODIGO:" -ForegroundColor Gray
    $unusedInLocal | ForEach-Object { Write-Host "   - $_" -ForegroundColor DarkGray }
    Write-Host ""
}

# Tablas en backup pero no en local
if ($backupTables.Count -gt 0) {
    $missingFromBackup = $localTables | Where-Object { $_ -notin $backupTables }
    $missingFromLocal = $backupTables | Where-Object { $_ -notin $localTables }
    
    if ($missingFromBackup.Count -gt 0) {
        Write-Host "⚠️ TABLAS EN LOCAL PERO NO EN BACKUP:" -ForegroundColor Yellow
        $missingFromBackup | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
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
Write-Host "Tablas faltantes en LOCAL: $($missingInLocal.Count)" -ForegroundColor $(if ($missingInLocal.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Tablas no usadas en código: $($unusedInLocal.Count)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 6. Lista completa de tablas en local
Write-Host "LISTA COMPLETA DE TABLAS EN LOCAL:" -ForegroundColor Cyan
$localTables | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Gray }
Write-Host ""

