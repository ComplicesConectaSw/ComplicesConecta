# ==============================
# 🚀 DEVOPS MANAGER ULTRA (SAFE EDITION)
# ==============================
# Con soporte para Full Dump y cierre correcto
# Uso: Abrir PowerShell, ejecutar: .\DevOpsManagerUltra.ps1

Param()

# -----------------------------
# Configuración inicial
# -----------------------------
$global:defaultProjectDir = "C:\Users\conej\Documents\conecta-social-comunidad-main"
$global:backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"

# Preguntar directorio del proyecto
$inputDir = Read-Host "📂 Ingresa la ruta del proyecto (ENTER para usar $global:defaultProjectDir)"
if ([string]::IsNullOrWhiteSpace($inputDir)) {
    $global:projectDir = $global:defaultProjectDir
} else {
    $global:projectDir = $inputDir
}

# Preguntar modo de trabajo
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   🚀 DEVOPS MANAGER ULTRA - MODO INICIAL"
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Supabase"
Write-Host "2. GitHub"
Write-Host "3. Ambos"
Write-Host "0. Salir"
Write-Host "=========================================" -ForegroundColor Cyan

$mode = Read-Host "Selecciona qué deseas usar"
if ($mode -eq "0") { exit }

# -----------------------------
# Funciones comunes
# -----------------------------
function Confirm-YesNo([string]$msg) {
    $c = Read-Host "$msg [S/N]"
    return ($c -match '^[SsYy]$')
}

function New-Directory([string]$path) {
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }
}

###########################################
#### SUPABASE ULTRA #######################
###########################################
function New-Backup([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    New-Directory $ruta
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = "backup_${timestamp}.sql"
    $fullPath = Join-Path $ruta $fileName
    Write-Host "📦 Creando backup completo en $fullPath ..." -ForegroundColor Cyan
    Push-Location $global:projectDir
    npx supabase db dump -f $fullPath
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -eq 0) {
        Write-Host "✅ Backup creado: $fullPath" -ForegroundColor Green
        return $fullPath
    } else {
        Write-Host "❌ Error al crear el backup. Código: $code" -ForegroundColor Red
        return $null
    }
}

function Export-FullDump([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    New-Directory $ruta
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = "full_backup_${timestamp}.sql"
    $fullPath = Join-Path $ruta $fileName
    Write-Host "⬇️ Exportando FULL DUMP (estructura + datos) en $fullPath ..." -ForegroundColor Cyan
    Push-Location $global:projectDir
    npx supabase db dump -f $fullPath
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -eq 0) {
        Write-Host "✅ Full Dump exportado correctamente en: $fullPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al exportar Full Dump. Código: $code" -ForegroundColor Red
    }
    Pause   # 🔹 Esperar confirmación antes de volver al menú
}

function Clean-InvalidMigrations() {
    $migrationsPath = Join-Path $global:projectDir "supabase\migrations"
    $invalidPath = Join-Path $global:projectDir "supabase\backups\invalid_migrations"
    New-Directory $invalidPath

    $invalid = Get-ChildItem $migrationsPath -File | Where-Object { $_.Name -notmatch "^\d{14}_.+\.sql$" }
    if ($invalid.Count -eq 0) {
        Write-Host "✅ No se encontraron migraciones inválidas." -ForegroundColor Green
        return
    }

    Write-Host "⚠️ Migraciones inválidas detectadas, moviendo a ${invalidPath}:" -ForegroundColor Yellow
    foreach ($f in $invalid) {
        Move-Item $f.FullName $invalidPath -Force
        Write-Host "  - $($f.Name)"
    }
}

function Sync-And-Clean() {
    Write-Host "⬆️ Subiendo y alineando proyecto con remoto/local..." -ForegroundColor Cyan
    $backup = New-Backup $global:backupDir
    if (-not $backup) { Write-Host "❌ No se pudo crear backup. Abortando."; return }

    Remove-InvalidMigrations

    Push-Location $global:projectDir
    $output = npx supabase db push 2>&1
    Pop-Location

    $conflicts = $output | Where-Object { $_ -match "already exists" -or $_ -match "duplicate_object" }
    if ($conflicts.Count -gt 0) {
        Write-Host "⚠️ Conflictos detectados en migraciones:" -ForegroundColor Yellow
        $conflicts | ForEach-Object { Write-Host " - $_" }
        Write-Host "👉 Sugerencia: usa 'npx supabase migration repair --status applied <id>' para marcar como aplicadas."
    }

    if (Confirm-YesNo "¿Eliminar migraciones locales después de alinear (ya están seguras en remoto)?") {
        Remove-LocalMigrations
    }
    Write-Host "✅ Proyecto alineado y migraciones locales depuradas." -ForegroundColor Green
    Pause
}

function Remove-LocalMigrations() {
    $migrationsPath = Join-Path $global:projectDir "supabase\migrations"
    if (Test-Path $migrationsPath) {
        Remove-Item -Recurse -Force "$migrationsPath\*"
        Write-Host "✅ Migraciones locales eliminadas." -ForegroundColor Green
    }
    Pause
}

###########################################
#### GIT ULTRA ############################
###########################################
function New-BranchBackup() {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupBranch = "backup/safe-$timestamp"
    Push-Location $global:projectDir
    $currentBranch = git branch --show-current
    git fetch origin
    git checkout -b $backupBranch $currentBranch
    git push origin $backupBranch
    Pop-Location
    Write-Host "✅ Rama de respaldo creada: $backupBranch (desde $currentBranch)"
    Pause
}

###########################################
#### MENÚ PRINCIPAL #######################
###########################################

$exitScript = $false

do {
    Clear-Host
    Write-Host "========================================="
    Write-Host "   🚀 DEVOPS MANAGER ULTRA (SAFE EDITION)"
    Write-Host "========================================="

    if ($mode -eq "1" -or $mode -eq "3") {
        Write-Host "#### SUPABASE ###########################"
        Write-Host "1. 📦 Hacer backup completo"
        Write-Host "2. ⬆️ Subir y actualizar backup local (auto-sync + clean)"
        Write-Host "3. 🗑️ Eliminar migraciones locales"
        Write-Host "4. ⬇️ Exportar Full Dump (estructura + datos)"
    }

    if ($mode -eq "2" -or $mode -eq "3") {
        Write-Host "#### GIT ###############################"
        Write-Host "7. 💾 Crear rama de respaldo"
    }

    Write-Host "0. ❌ Salir"
    Write-Host "========================================="
    $option = Read-Host "Selecciona una opción"

    switch ($option) {
        "1" { if ($mode -eq "1" -or $mode -eq "3") { New-Backup $global:backupDir | Out-Null } }
        "2" { if ($mode -eq "1" -or $mode -eq "3") { Sync-And-Clean } }
        "3" { if ($mode -eq "1" -or $mode -eq "3") { Remove-LocalMigrations } }
        "4" { if ($mode -eq "1" -or $mode -eq "3") { Export-FullDump $global:backupDir } }
        "7" { if ($mode -eq "2" -or $mode -eq "3") { New-BranchBackup } }
        "0" { 
            if (Confirm-YesNo "⚠️ ¿Seguro que deseas salir del script?") { 
                Write-Host "👋 Saliendo del script. Hasta luego!" -ForegroundColor Cyan
                $exitScript = $true
            } 
        }
    }
} while (-not $exitScript)

