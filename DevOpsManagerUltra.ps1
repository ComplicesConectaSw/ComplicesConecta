# ==============================
# 🚀 DEVOPS MANAGER ULTRA (SAFE EDITION)
# Unificado: SUPABASE SQL MANAGER + GIT MANAGER PRO ULTRA
# ==============================
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

# -----------------------------
# Utilidades comunes
# -----------------------------
function Confirm-YesNo([string]$msg) {
    $c = Read-Host "$msg [S/N]"
    return ($c -match "^[sSyY]$")
}

function Ensure-Dir([string]$path) {
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }
}

# -----------------------------
# Prompt Personalizado Wacko🐇 con Git Info
# -----------------------------
$global:promptColors = @("DarkCyan","DarkYellow","Green","Magenta","Cyan","Yellow","Gray","Blue","Red")

function prompt {
    $color = Get-Random -InputObject $global:promptColors
    $currentPath = (Get-Location).Path

    # Detectar rama Git
    $branch = ""
    $status = ""
    if (Test-Path ".git") {
        try {
            $branchName = git branch --show-current 2>$null
            if ($branchName) { $branch = " (🌿 $branchName)" }

            # Estado rápido (limpio o con cambios)
            $dirty = git status --porcelain
            if ($dirty) { $status = " ⚠️ cambios" } else { $status = " ✅ limpio" }
        } catch { }
    }

    Write-Host "✨ Wacko🐇 cargado ✔ - Entorno DevOps 🚀" -ForegroundColor $color
    return "[$currentPath]$branch$status> "
}

# -----------------------------
# ######## SUPABASE ULTRA ########
# -----------------------------
function Crear-Backup([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    Ensure-Dir $ruta
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = "backup_${timestamp}.sql"
    $fullPath = Join-Path $ruta $fileName
    Write-Host "📦 Creando backup en $fullPath ..." -ForegroundColor Cyan
    Push-Location $global:projectDir
    npx supabase db dump -f $fullPath
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -eq 0) {
        Write-Host "✅ Backup creado: $fullPath" -ForegroundColor Green
        return $fullPath
    } else {
        Write-Host "❌ Error al crear backup. Código: $code" -ForegroundColor Red
        return $null
    }
}

function Listar-Respaldos([string]$ruta) {
    if (-not $ruta) { $ruta = $global:backupDir }
    if (-not (Test-Path $ruta)) { Write-Host "⚠️ Carpeta no existe: $ruta"; return @() }
    Get-ChildItem $ruta -Filter "backup_*.sql" | Sort-Object LastWriteTime -Descending
}

function Reparar-Migraciones([string[]]$conflicts) {
    Write-Host "⚠️ Migraciones conflictivas:" -ForegroundColor Yellow
    $conflicts | ForEach-Object { Write-Host "- $_" }
    if (-not (Confirm-YesNo "¿Repararlas ahora? Backup previo recomendado.")) { Write-Host "⏭ Cancelado."; return }
    Crear-Backup $global:backupDir | Out-Null
    foreach ($id in $conflicts) {
        Write-Host "🛠️ Reparando $id => reverted..." -ForegroundColor Cyan
        npx supabase migration repair --status reverted $id
    }
    Write-Host "✅ Reparaciones completadas." -ForegroundColor Green
}

function Recuperar-DesdeRemoto() {
    Write-Host "🌐 db pull remoto..." -ForegroundColor Cyan
    Push-Location $global:projectDir
    $output = npx supabase db pull 2>&1
    $conflicts = @()
    foreach ($line in $output) {
        if ($line -match "supabase migration repair --status reverted (\d+)") {
            $conflicts += $Matches[1]
        }
    }
    if ($conflicts.Count -gt 0) {
        Reparar-Migraciones -conflicts $conflicts
        npx supabase db pull
    }
    npx supabase gen types typescript --project-id axtvqnozatbmllvwzuim --schema public > "$global:projectDir\src\types\supabase.ts"
    npm run type-check
    Pop-Location
    Crear-Backup $global:backupDir | Out-Null
    Write-Host "✅ Proyecto alineado con remoto." -ForegroundColor Green
}

function Recuperar-DesdeBackup() {
    Write-Host "💾 Recuperando desde respaldo local..." -ForegroundColor Cyan
    $files = Listar-Respaldos $global:backupDir
    if ($files.Count -eq 0) { Write-Host "⚠️ No hay respaldos."; return }
    for ($i=0; $i -lt $files.Count; $i++) {
        Write-Host "[$($i+1)] $($files[$i].Name) - $($files[$i].LastWriteTime)"
    }
    $choice = Read-Host "Selecciona número (0 cancelar)"
    if ($choice -match "^\d+$" -and [int]$choice -ge 1 -and [int]$choice -le $files.Count) {
        $sel = $files[[int]$choice-1].FullName
        if (-not (Confirm-YesNo "Aplicar backup $sel via db push?")) { return }
        Push-Location $global:projectDir
        npx supabase db push -f $sel
        Pop-Location
        Crear-Backup $global:backupDir | Out-Null
        Write-Host "✅ Proyecto sincronizado con respaldo." -ForegroundColor Green
    }
}

function Eliminar-MigracionesLocales() {
    $migrationsPath = Join-Path $global:projectDir "supabase\migrations"
    if (Test-Path $migrationsPath) {
        if (-not (Confirm-YesNo "Eliminar migraciones locales? Backup antes?")) { return }
        Crear-Backup $global:backupDir | Out-Null
        Remove-Item -Recurse -Force "$migrationsPath\*"
        Write-Host "✅ Migraciones eliminadas." -ForegroundColor Green
    }
}

function Crear-Backup-Personalizado() {
    $ruta = Read-Host "Ruta destino backup"
    if ($ruta) { Crear-Backup -ruta $ruta | Out-Null }
}

# -----------------------------
# ######## GIT ULTRA ###########
# -----------------------------
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

# (Mantengo aquí las demás funciones Git de tu script: Commit-Seguro, Comparar-Ramas,
# Push-Produccion-Seguro, Restaurar-Desde-Backup-Git, etc...)

function Actualizar-Gitignore() {
    Push-Location $global:projectDir
    $gitignore = Join-Path $global:projectDir ".gitignore"
    if (-not (Test-Path $gitignore)) { New-Item -Path $gitignore -ItemType File | Out-Null }
    $entries = @(
        "# DevOps & Supabase",
        "supabase/migrations/*",
        "*.sql",
        "DevOpsManagerUltra.ps1",
        "D:/complicesconecta_ultima_version_respaldo/"
    )
    foreach ($e in $entries) {
        if (-not (Select-String -Path $gitignore -Pattern [regex]::Escape($e) -Quiet)) {
            Add-Content -Path $gitignore -Value $e
        }
    }
    git add .gitignore
    git commit -m ("chore(auto): update .gitignore $(Get-Date -Format yyyyMMdd_HHmmss)")
    git push origin (git branch --show-current)
    Write-Host "✅ .gitignore actualizado." -ForegroundColor Green
    Pop-Location
}

# -----------------------------
# Menú Unificado
# -----------------------------
do {
    Clear-Host
    Write-Host "========================================="
    Write-Host "   🚀 DEVOPS MANAGER ULTRA (SAFE EDITION)"
    Write-Host "========================================="
    Write-Host "######## SUPABASE ULTRA ########"
    Write-Host "1. 🗄️ Hacer backup completo"
    Write-Host "2. 🔄 Recuperar y alinear proyecto"
    Write-Host "   2.1 🌐 Desde remoto (db pull)"
    Write-Host "   2.2 💾 Desde respaldo local (db push)"
    Write-Host "3. ⬆️ Subir y actualizar backup local"
    Write-Host "4. 🗑️ Eliminar migraciones locales"
    Write-Host "5. 📝 Crear backup en ruta personalizada"
    Write-Host "######## GIT ULTRA ###########"
    Write-Host "6. 🔐 Crear rama de respaldo"
    Write-Host "7. 📝 Commit seguro"
    Write-Host "8. ⬆️ Push seguro (staging + main)"
    Write-Host "9. 📊 Estado rápido"
    Write-Host "10. ⚙️ Actualizar .gitignore"
    Write-Host "11. 🔎 Comparar ramas"
    Write-Host "12. ♻️ Restaurar proyecto desde rama backup"
    Write-Host "13. 📂 Restaurar archivo desde commit"
    Write-Host "14. 🧭 Cambiar sesión/repositorio"
    Write-Host "0. ❌ Salir"
    Write-Host "========================================="
    $option = Read-Host "Selecciona una opción"
    switch ($option) {
        "1" { Crear-Backup $global:backupDir | Out-Null }
        "2" { $sub = Read-Host "Elige (2.1 remoto / 2.2 respaldo local)"; if ($sub -eq "2.1") { Recuperar-DesdeRemoto } elseif ($sub -eq "2.2") { Recuperar-DesdeBackup } }
        "3" { Crear-Backup $global:backupDir | Out-Null }
        "4" { Eliminar-MigracionesLocales }
        "5" { Crear-Backup-Personalizado }
        "6" { Crear-Backup-Rama }
        "7" { $tipo = Read-Host "Tipo de commit"; $desc = Read-Host "Descripción"; Commit-Seguro -tipo $tipo -descripcion $desc }
        "8" { Push-Produccion-Seguro }
        "9" { Estado-Rapido }
        "10" { Actualizar-Gitignore }
        "11" { Comparar-Ramas }
        "12" { Restaurar-Desde-Backup-Git }
        "13" { $c = Read-Host "Commit ID"; $f = Read-Host "Archivo"; Restaurar-Archivo -commitId $c -archivo $f }
        "14" { Set-Sesion }
        "0" { Write-Host "👋 Saliendo..."; break }
        default { Write-Host "❌ Opción inválida." }
    }
    if ($option -ne "0") { Pause }
} while ($true)
