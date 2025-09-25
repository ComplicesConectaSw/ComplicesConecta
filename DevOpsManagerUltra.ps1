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
    "demo" = "C:\temp\demo-project";
    "project2" = "C:\temp\project2";
}
$global:currentRepo = "default"

function Confirm-YesNo([string]$msg) {
    $c = Read-Host "$msg [S/N]"
    return ($c -match '^[SsYy]$')
}

function Ensure-Dir([string]$path) {
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }
}

###########################################
#### SUPABASE ULTRA #######################
###########################################

function Crear-Backup([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    Ensure-Dir $ruta
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

function Listar-Respaldos([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    if (-not (Test-Path $ruta)) { Write-Host "⚠️ Carpeta no existe: $ruta"; return @() }
    Get-ChildItem $ruta -Filter "backup_*.sql" | Sort-Object LastWriteTime -Descending
}

function Reparar-Migraciones([string[]]$conflicts) {
    Write-Host "⚠️ Se detectaron migraciones conflictivas:" -ForegroundColor Yellow
    $conflicts | ForEach-Object { Write-Host "- $_" }
    if (-not (Confirm-YesNo "¿Deseas repararlas AHORA? Asegúrate de tener backup previo.")) {
        Write-Host "⏭ Reparación cancelada."
        return
    }
    Crear-Backup $global:backupDir | Out-Null
    foreach ($id in $conflicts) {
        Write-Host "🛠️ Reparando $id => reverted..." -ForegroundColor Cyan
        npx supabase migration repair --status reverted $id
    }
    Write-Host "✅ Reparaciones completadas." -ForegroundColor Green
}

function Recuperar-DesdeRemoto() {
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
        Reparar-Migraciones -conflicts $conflicts
        Write-Host "🔁 Reintentando db pull..." -ForegroundColor Cyan
        npx supabase db pull
    }
    npx supabase gen types typescript --project-id axtvqnozatbmllvwzuim --schema public > "$global:projectDir\src\types\supabase.ts"
    npm run type-check
    Pop-Location
    Crear-Backup $global:backupDir | Out-Null
    Write-Host "✅ Proyecto alineado con remoto y respaldo creado." -ForegroundColor Green
}

function Recuperar-DesdeBackup() {
    Write-Host "💾 Recuperando desde respaldo local..." -ForegroundColor Cyan
    $files = Listar-Respaldos $global:backupDir
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
        Crear-Backup $global:backupDir | Out-Null
        Write-Host "✅ Proyecto sincronizado con respaldo local." -ForegroundColor Green
    } else {
        Write-Host "❌ Selección inválida."
    }
}

function Eliminar-MigracionesLocales() {
    $migrationsPath = Join-Path $global:projectDir "supabase\migrations"
    if (Test-Path $migrationsPath) {
        if (Confirm-YesNo "Vas a ELIMINAR migraciones locales en $migrationsPath ¿Hacer backup antes?") {
            Crear-Backup $global:backupDir | Out-Null
        }
        Remove-Item -Recurse -Force "$migrationsPath\*"
        Write-Host "✅ Migraciones locales eliminadas." -ForegroundColor Green
    } else { Write-Host "⚠️ No existe carpeta de migraciones locales." }
}

function Crear-Backup-Personalizado() {
    $ruta = Read-Host "Ruta donde guardar el backup"
    if ($ruta) { Crear-Backup -ruta $ruta | Out-Null }
}

###########################################
#### GIT ULTRA ############################
###########################################

function Set-Sesion() {
    Write-Host "👥 Sesiones configuradas:"
    $global:repos.GetEnumerator() | ForEach-Object { Write-Host "$($_.Key): $($_.Value)" }
    $choice = Read-Host "Elige la sesión"
    if ($global:repos.ContainsKey($choice)) {
        $global:currentRepo = $choice
        $global:projectDir = $global:repos[$choice]
        Write-Host "✅ Sesión cambiada a: $choice ($global:projectDir)"
    } else { Write-Host "❌ Sesión no encontrada" }
}

function Crear-Backup-Rama() {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupBranch = "backup/safe-$timestamp"
    Push-Location $global:projectDir
    $currentBranch = git branch --show-current
    git fetch origin
    git checkout -b $backupBranch $currentBranch
    git push origin $backupBranch
    Pop-Location
    Write-Host "✅ Rama de respaldo creada: $backupBranch (desde $currentBranch)"
}

function Commit-Seguro([string]$tipo="chore",[string]$descripcion="commit seguro") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $mensaje = "$tipo(auto-$timestamp): $descripcion"
    Push-Location $global:projectDir
    git add .
    git commit -m "$mensaje"
    Pop-Location
    Write-Host "✅ Commit creado en rama $(git -C $global:projectDir branch --show-current): $mensaje"
}

function Estado-Rapido() {
    Push-Location $global:projectDir
    Write-Host "=============================="
    Write-Host "   📊 ESTADO RÁPIDO DEL REPO"
    Write-Host "=============================="
    $rama = git branch --show-current
    Write-Host "🌿 Rama actual: $rama"
    Write-Host "`n📜 Últimos 5 commits:"
    git log --oneline -n 5
    Write-Host "`n🔧 Cambios pendientes:"
    git status -s
    Pop-Location
}

function Comparar-Ramas() {
    Push-Location $global:projectDir
    $ramaActual = git branch --show-current
    $target = Read-Host "¿Con qué rama quieres comparar?"
    git fetch origin
    Write-Host "📊 Preview de diferencias:"
    git diff --stat $target..$ramaActual
    if (Confirm-YesNo "¿Ver diff completo?") { git diff $target..$ramaActual }
    Pop-Location
}

function Push-Produccion-Seguro() {
    Push-Location $global:projectDir
    $ramaActual = git branch --show-current
    if ($ramaActual -in @("main","master")) {
        if (Confirm-YesNo "¿Push directo a $ramaActual?") { git push origin $ramaActual }
        Pop-Location; return
    }
    git fetch origin
    if ((git branch -a) -match "remotes/origin/staging") {
        git checkout staging; git pull origin staging
    } else { git checkout -b staging }
    git merge $ramaActual --no-ff
    git push origin staging
    if (Confirm-YesNo "¿Promover staging → main?") {
        Crear-Backup-Rama
        git checkout main; git pull origin main
        git merge staging --no-ff
        git push origin main
    }
    Pop-Location
}

function Restaurar-Desde-Backup-Git() {
    Push-Location $global:projectDir
    git branch -a | Select-String "backup/" | ForEach-Object { Write-Host $_.ToString().Trim() }
    $backup = Read-Host "Elige la rama backup"
    if ($backup) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $newBranch = "recover/$timestamp"
        git checkout -b $newBranch $backup
        Write-Host "✅ Proyecto recuperado en nueva rama: $newBranch"
    }
    Pop-Location
}

function Listar-Ramas() { Push-Location $global:projectDir; git branch -a; Pop-Location }
function Restaurar-Archivo([string]$commitId,[string]$archivo) { Push-Location $global:projectDir; git checkout $commitId -- $archivo; Pop-Location }

function Actualizar-Gitignore() {
    Push-Location $global:projectDir
    $gitignore = Join-Path $global:projectDir ".gitignore"
    if (-not (Test-Path $gitignore)) { New-Item -Path $gitignore -ItemType File | Out-Null }
    $entries = @("supabase/migrations/*","*.sql","DevOpsManagerUltra.ps1","D:/complicesconecta_ultima_version_respaldo/")
    foreach ($e in $entries) {
        if (-not (Select-String -Path $gitignore -Pattern [regex]::Escape($e) -Quiet)) { Add-Content -Path $gitignore -Value $e }
    }
    git add .gitignore
    git commit -m ("chore(auto): update .gitignore $(Get-Date -Format yyyyMMdd_HHmmss)")
    git push origin (git branch --show-current)
    Pop-Location
}

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
    Write-Host "3. ⬆️ Subir y actualizar backup local"
    Write-Host "4. 🗑️ Eliminar migraciones locales"
    Write-Host "5. 📝 Crear backup personalizado"
    Write-Host "#### GIT ###############################"
    Write-Host "6. 💾 Crear rama de respaldo"
    Write-Host "7. 📝 Commit seguro"
    Write-Host "8. ⬆️ Push seguro (staging/producción)"
    Write-Host "9. 📊 Estado rápido del repositorio"
    Write-Host "10. ⚙️ Actualizar .gitignore"
    Write-Host "11. 🔍 Comparar ramas"
    Write-Host "12. ♻️ Recuperar desde backup (Git)"
    Write-Host "13. 📂 Restaurar archivo desde commit"
    Write-Host "14. 🧭 Cambiar sesión/repositorio"
    Write-Host "0. ❌ Salir"
    Write-Host "========================================="
    $option = Read-Host "Selecciona una opción"
    switch ($option) {
        "1" { Crear-Backup $global:backupDir | Out-Null }
        "2" {
            $sub = Read-Host "Elige (2.1 remoto / 2.2 backup)"
            if ($sub -eq "2.1") { Recuperar-DesdeRemoto }
            elseif ($sub -eq "2.2") { Recuperar-DesdeBackup }
        }
        "3" { Crear-Backup $global:backupDir | Out-Null }
        "4" { Eliminar-MigracionesLocales }
        "5" { Crear-Backup-Personalizado }
        "6" { Crear-Backup-Rama }
        "7" { $tipo=Read-Host "Tipo"; $desc=Read-Host "Descripción"; Commit-Seguro -tipo $tipo -descripcion $desc }
        "8" { Push-Produccion-Seguro }
        "9" { Estado-Rapido }
        "10" { Actualizar-Gitignore }
        "11" { Comparar-Ramas }
        "12" { Restaurar-Desde-Backup-Git }
        "13" { $commitId=Read-Host "Commit ID"; $archivo=Read-Host "Archivo"; Restaurar-Archivo -commitId $commitId -archivo $archivo }
        "14" { Set-Sesion }
        "0" { break }
    }
    if ($option -ne "0") { Pause }
} while ($true)
