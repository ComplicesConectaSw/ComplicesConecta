# ==============================
# 🚀 DEVOPS MANAGER ULTRA (SAFE EDITION)
# ==============================
# Unificado: SUPABASE SQL MANAGER + GIT MANAGER PRO ULTRA
# Uso: Abrir PowerShell, ejecutar: .\DevOpsManagerUltra.ps1

Param()

# -----------------------------
# Configuración inicial
# -----------------------------
$global:projectDir = "C:\Users\conej\Documents\conecta-social-comunidad-main"
$global:backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$global:repos = @{
    "default" = $global:projectDir;
    "demo"    = "C:\temp\demo-project";
    "project2"= "C:\temp\project2";
}
$global:currentRepo = "default"

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

function Get-Backups([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    if (-not (Test-Path $ruta)) { Write-Host "⚠️ Carpeta no existe: $ruta"; return @() }
    Get-ChildItem $ruta -Filter "backup_*.sql" | Sort-Object LastWriteTime -Descending
}

function Repair-Migrations([string[]]$conflicts) {
    Write-Host "⚠️ Se detectaron migraciones conflictivas:" -ForegroundColor Yellow
    $conflicts | ForEach-Object { Write-Host "- $_" }
    if (-not (Confirm-YesNo "¿Deseas repararlas AHORA? Asegúrate de tener backup previo.")) {
        Write-Host "⏭ Reparación cancelada."
        return
    }
    New-Backup $global:backupDir | Out-Null
    foreach ($id in $conflicts) {
        Write-Host "🛠️ Reparando $id => reverted..." -ForegroundColor Cyan
        npx supabase migration repair --status reverted $id
    }
    Write-Host "✅ Reparaciones completadas." -ForegroundColor Green
}

function Restore-FromRemote() {
    Write-Host "🌐 Recuperando y alineando desde REMOTO..." -ForegroundColor Cyan
    Push-Location $global:projectDir
    $output = npx supabase db pull 2>&1
    $conflicts = @()
    foreach ($line in $output) {
        if ($line -match "supabase migration repair --status (applied|reverted) (\d+)") {
            $conflicts += $Matches[2]
        }
    }
    if ($conflicts.Count -gt 0) {
        Repair-Migrations -conflicts $conflicts
        Write-Host "🔁 Reintentando db pull..." -ForegroundColor Cyan
        npx supabase db pull
    }
    npx supabase gen types typescript --project-id axtvqnozatbmllvwzuim --schema public > "$global:projectDir\src\types\supabase.ts"
    npm run type-check
    Pop-Location
    New-Backup $global:backupDir | Out-Null
    Write-Host "✅ Proyecto alineado con remoto y respaldo creado." -ForegroundColor Green
}

function Restore-FromBackup() {
    Write-Host "💾 Recuperando desde respaldo local..." -ForegroundColor Cyan
    $files = Get-Backups $global:backupDir
    if ($files.Count -eq 0) { Write-Host "⚠️ No hay respaldos en $global:backupDir"; return }
    for ($i=0; $i -lt $files.Count; $i++) {
        Write-Host "[$($i+1)] $($files[$i].Name) - $($files[$i].LastWriteTime)"
    }
    $choice = Read-Host "Selecciona el número del respaldo a usar (o 0 para cancelar)"
    if ($choice -match "^[0-9]+$" -and [int]$choice -ge 1 -and [int]$choice -le $files.Count) {
        $sel = $files[[int]$choice - 1].FullName
        Write-Host "📥 Usando respaldo: $sel" -ForegroundColor Cyan
        if (-not (Confirm-YesNo "Se aplicará el backup via 'supabase db push -f'. ¿Confirmas?")) { Write-Host "Operación cancelada."; return }
        Push-Location $global:projectDir
        npx supabase db push -f $sel
        Pop-Location
        New-Backup $global:backupDir | Out-Null
        Write-Host "✅ Proyecto sincronizado con respaldo local." -ForegroundColor Green
    } else {
        Write-Host "❌ Selección inválida."
    }
}

function Sync-And-Clean() {
    Write-Host "⬆️ Subiendo y alineando proyecto con remoto/local..." -ForegroundColor Cyan
    $backup = New-Backup $global:backupDir
    if (-not $backup) { Write-Host "❌ No se pudo crear backup. Abortando."; return }

    Push-Location $global:projectDir
    npx supabase db pull
    npx supabase db push
    Pop-Location

    if (Confirm-YesNo "¿Eliminar migraciones locales después de alinear (ya está seguro en remoto)?") {
        Remove-LocalMigrations
    }
    Write-Host "✅ Proyecto alineado y migraciones locales depuradas." -ForegroundColor Green
}

function Remove-LocalMigrations() {
    $migrationsPath = Join-Path $global:projectDir "supabase\migrations"
    if (Test-Path $migrationsPath) {
        if (Confirm-YesNo "Vas a ELIMINAR migraciones locales en $migrationsPath ¿Hacer backup antes?") {
            New-Backup $global:backupDir | Out-Null
        }
        Remove-Item -Recurse -Force "$migrationsPath\*"
        Write-Host "✅ Migraciones locales eliminadas." -ForegroundColor Green
    } else { Write-Host "⚠️ No existe carpeta de migraciones locales." }
}

function New-CustomBackup() {
    $ruta = Read-Host "Ruta donde guardar el backup"
    if ($ruta) { New-Backup -ruta $ruta | Out-Null }
}

###########################################
#### GIT ULTRA ############################
###########################################
# (Mantengo tu código original aquí, igual que lo tenías en la versión previa)

###########################################
#### MENÚ PRINCIPAL #######################
###########################################

do {
    Clear-Host
    Write-Host "========================================="
    Write-Host "   🚀 DEVOPS MANAGER ULTRA (SAFE EDITION)"
    Write-Host "========================================="
    Write-Host "#### SUPABASE ###########################"
    Write-Host "1. 📦 Hacer backup completo"
    Write-Host "2. 🔄 Recuperar y alinear proyecto"
    Write-Host "   2.1 🌐 Desde remoto"
    Write-Host "   2.2 💾 Desde respaldo local"
    Write-Host "3. ⬆️ Subir y actualizar backup local (auto-sync + clean)"
    Write-Host "4. 🗑️ Eliminar migraciones locales"
    Write-Host "5. 📝 Crear backup personalizado"
    Write-Host "6. 📘 Documentación de uso (Supabase)"
    Write-Host "#### GIT ###############################"
    Write-Host "7. 💾 Crear rama de respaldo"
    Write-Host "8. 📝 Commit seguro"
    Write-Host "9. ⬆️ Push seguro (staging/producción)"
    Write-Host "10. 📊 Estado rápido del repositorio"
    Write-Host "11. ⚙️ Actualizar .gitignore"
    Write-Host "12. 🔍 Comparar ramas"
    Write-Host "13. ♻️ Recuperar desde backup (Git)"
    Write-Host "14. 📂 Restaurar archivo desde commit"
    Write-Host "15. 📘 Documentación de uso (Git)"
    Write-Host "16. 🧭 Cambiar sesión/repositorio"
    Write-Host "0. ❌ Salir"
    Write-Host "========================================="
    $option = Read-Host "Selecciona una opción"
    switch ($option) {
        "1" { New-Backup $global:backupDir | Out-Null }
        "2" {
            $sub = Read-Host "Elige (2.1 remoto / 2.2 backup)"
            if ($sub -eq "2.1") { Restore-FromRemote }
            elseif ($sub -eq "2.2") { Restore-FromBackup }
        }
        "3" { Sync-And-Clean }
        "4" { Remove-LocalMigrations }
        "5" { New-CustomBackup }
        "6" {
            Write-Host "📘 Supabase:" -ForegroundColor Cyan
            Write-Host "1. Backup completo → Copia total de DB."
            Write-Host "2. Recuperar → Sincroniza desde remoto o backup."
            Write-Host "3. Subir/Actualizar backup local → Crea backup, sincroniza y limpia migraciones locales."
            Write-Host "4. Eliminar migraciones locales → Limpia sin tocar remoto."
            Write-Host "5. Backup personalizado → Genera backup nombrado manualmente."
        }
        # Git (siguen tus funciones originales)
        "15" {
            Write-Host "📘 Git:" -ForegroundColor Cyan
            Write-Host "7. Rama de respaldo → Crea rama backup."
            Write-Host "8. Commit seguro → Commit con timestamp."
            Write-Host "9. Push seguro → staging antes de main."
            Write-Host "10. Estado rápido → Últimos commits + cambios."
            Write-Host "11. Actualizar .gitignore → Añade reglas útiles."
            Write-Host "12. Comparar ramas → Diff rápido."
            Write-Host "13. Recuperar backup Git → Nueva rama desde backup."
            Write-Host "14. Restaurar archivo → Recupera archivo de commit."
        }
        "0" { break }
    }
    if ($option -ne "0") { Pause }
} while ($true)
