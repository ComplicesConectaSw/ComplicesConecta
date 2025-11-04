# Script para crear backup de migraciones operativas
# Version: 3.5.0

$backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$sourceDir = "supabase\migrations"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupSubDir = Join-Path $backupDir "backup_operativo_$timestamp"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CREANDO BACKUP DE MIGRACIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio de origen
if (-not (Test-Path $sourceDir)) {
    Write-Host "ERROR: Directorio de origen no existe: $sourceDir" -ForegroundColor Red
    exit 1
}

# Crear directorio de backup
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "Directorio de backup creado: $backupDir" -ForegroundColor Green
}

# Crear subdirectorio con timestamp
New-Item -ItemType Directory -Path $backupSubDir -Force | Out-Null
Write-Host "Directorio de backup creado: $backupSubDir" -ForegroundColor Green
Write-Host ""

# Copiar todas las migraciones
Write-Host "Copiando migraciones..." -ForegroundColor Yellow
$migrationFiles = Get-ChildItem $sourceDir -File
$copiedCount = 0

foreach ($file in $migrationFiles) {
    Copy-Item $file.FullName -Destination $backupSubDir -Force
    $copiedCount++
    Write-Host "  ✓ $($file.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Archivos copiados: $copiedCount" -ForegroundColor Green

# Copiar scripts adicionales
Write-Host ""
Write-Host "Copiando scripts adicionales..." -ForegroundColor Yellow
$additionalScripts = @(
    "supabase\execute-critical-queries.sql",
    "supabase\queries-critical-analyze.sql",
    "supabase\fix_get_profiles_in_cells.sql",
    "supabase\backup_info.txt"
)

foreach ($script in $additionalScripts) {
    if (Test-Path $script) {
        Copy-Item $script -Destination $backupSubDir -Force
        Write-Host "  ✓ $(Split-Path $script -Leaf)" -ForegroundColor Gray
    }
}

# Verificar backup
Write-Host ""
Write-Host "Verificando backup..." -ForegroundColor Yellow
$totalFiles = (Get-ChildItem $backupSubDir -File).Count
$migrationFiles = (Get-ChildItem $backupSubDir -File | Where-Object { $_.Name -match '^\d{14}_' }).Count

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKUP COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ubicacion: $backupSubDir" -ForegroundColor Yellow
Write-Host "Total de archivos: $totalFiles" -ForegroundColor Green
Write-Host "Migraciones numeradas: $migrationFiles" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

