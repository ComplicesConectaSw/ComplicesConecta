# Script para consolidar backup de migraciones
# Version: 3.5.0
# Consolida todos los backups en uno solo y elimina obsoletos

$backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$sourceDir = "supabase\migrations"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$consolidatedBackup = Join-Path $backupDir "backup_consolidado_$timestamp"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONSOLIDACION DE BACKUP DE MIGRACIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio de origen
if (-not (Test-Path $sourceDir)) {
    Write-Host "ERROR: Directorio de origen no existe: $sourceDir" -ForegroundColor Red
    exit 1
}

# Crear directorio de backup consolidado
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

New-Item -ItemType Directory -Path $consolidatedBackup -Force | Out-Null
Write-Host "Directorio de backup consolidado creado: $consolidatedBackup" -ForegroundColor Green
Write-Host ""

# Paso 1: Copiar todas las migraciones actuales (fuente de verdad)
Write-Host "1. Copiando migraciones actuales..." -ForegroundColor Yellow
$migrationFiles = Get-ChildItem $sourceDir -File
$copiedCount = 0

foreach ($file in $migrationFiles) {
    Copy-Item $file.FullName -Destination $consolidatedBackup -Force
    $copiedCount++
}

Write-Host "   Archivos copiados: $copiedCount" -ForegroundColor Green
Write-Host ""

# Paso 2: Copiar scripts adicionales
Write-Host "2. Copiando scripts adicionales..." -ForegroundColor Yellow
$additionalScripts = @(
    "supabase\execute-critical-queries.sql",
    "supabase\queries-critical-analyze.sql",
    "supabase\fix_get_profiles_in_cells.sql",
    "supabase\backup_info.txt"
)

$scriptsCopied = 0
foreach ($script in $additionalScripts) {
    if (Test-Path $script) {
        Copy-Item $script -Destination $consolidatedBackup -Force
        $scriptsCopied++
        Write-Host "   ✓ $(Split-Path $script -Leaf)" -ForegroundColor Gray
    }
}

Write-Host "   Scripts copiados: $scriptsCopied" -ForegroundColor Green
Write-Host ""

# Paso 3: Analizar backups existentes
Write-Host "3. Analizando backups existentes..." -ForegroundColor Yellow
$existingBackups = Get-ChildItem $backupDir -Directory | Where-Object { $_.Name -like "backup_*" -or $_.Name -like "migraciones_*" }
$existingFiles = Get-ChildItem $backupDir -File

Write-Host "   Backups encontrados: $($existingBackups.Count)" -ForegroundColor Gray
Write-Host "   Archivos sueltos: $($existingFiles.Count)" -ForegroundColor Gray
Write-Host ""

# Paso 4: Verificar backup consolidado
Write-Host "4. Verificando backup consolidado..." -ForegroundColor Yellow
$totalFiles = (Get-ChildItem $consolidatedBackup -File).Count
$migrationFiles = (Get-ChildItem $consolidatedBackup -File | Where-Object { $_.Name -match '^\d{14}_' }).Count

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKUP CONSOLIDADO COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ubicacion: $consolidatedBackup" -ForegroundColor Yellow
Write-Host "Total de archivos: $totalFiles" -ForegroundColor Green
Write-Host "Migraciones numeradas: $migrationFiles" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 5: Confirmar limpieza de backups obsoletos
Write-Host "5. Backups obsoletos a eliminar:" -ForegroundColor Yellow
foreach ($backup in $existingBackups) {
    Write-Host "   - $($backup.Name)" -ForegroundColor Gray
}

foreach ($file in $existingFiles) {
    Write-Host "   - $($file.Name) (archivo suelto)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "¿Deseas eliminar los backups obsoletos? (Se conservará el backup consolidado)" -ForegroundColor Yellow
Write-Host "Para eliminar, ejecuta:" -ForegroundColor Cyan
$backupDirEscaped = $backupDir -replace "'", "''"
Write-Host "  Remove-Item '$backupDirEscaped\backup_*' -Recurse -Force" -ForegroundColor Gray
Write-Host "  Remove-Item '$backupDirEscaped\migraciones_*' -Recurse -Force" -ForegroundColor Gray
Write-Host "  Get-ChildItem '$backupDirEscaped' -File | Remove-Item -Force" -ForegroundColor Gray
Write-Host ""

