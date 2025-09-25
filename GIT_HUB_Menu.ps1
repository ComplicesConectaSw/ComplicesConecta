# ==============================
# 🔐 GIT MANAGER PRO ULTRA (Safe Edition)
# ==============================

$global:projectDir = "C:\Users\conej\Documents\conecta-social-comunidad-main"
$global:repos = @{
    "default" = "C:\Users\conej\Documents\conecta-social-comunidad-main"
}
$global:currentRepo = "default"

function Set-Sesion {
    Write-Host "👥 Sesiones configuradas:"
    $global:repos.GetEnumerator() | ForEach-Object { Write-Host "$($_.Key): $($_.Value)" }
    $choice = Read-Host "Elige la sesión (ej: default)"
    if ($global:repos.ContainsKey($choice)) {
        $global:currentRepo = $choice
        $global:projectDir = $global:repos[$choice]
        Write-Host "✅ Sesión cambiada a: $choice ($global:projectDir)"
    } else {
        Write-Host "❌ Sesión no encontrada"
    }
}

function Crear-Backup-Rama {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupBranch = "backup/safe-$timestamp"
    cd $global:projectDir
    $currentBranch = git branch --show-current
    git fetch origin
    git checkout -b $backupBranch $currentBranch
    git push origin $backupBranch
    Write-Host "✅ Rama de respaldo creada: $backupBranch (desde $currentBranch)"
}

function Commit-Seguro {
    param([string]$tipo = "chore", [string]$descripcion = "commit seguro")
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $mensaje = "$tipo(auto-$timestamp): $descripcion"
    cd $global:projectDir
    git add .
    git commit -m "$mensaje"
    Write-Host "✅ Commit creado en rama $(git branch --show-current): $mensaje"
}

function Comparar-Ramas {
    cd $global:projectDir
    $ramaActual = git branch --show-current
    Write-Host "📌 Estás actualmente en: $ramaActual"
    $target = Read-Host "¿Con qué rama quieres comparar? (ej: main o staging)"
    git fetch origin

    Write-Host "📊 Preview de diferencias (archivos cambiados):"
    git diff --stat $target..$ramaActual

    $choice = Read-Host "¿Quieres ver el detalle completo de cambios? (S/N)"
    if ($choice -eq "S") {
        Write-Host "🔍 Mostrando diff detallado entre $ramaActual y $target..."
        git diff $target..$ramaActual
        Write-Host "⚠️ Fin de diferencias."
    } else {
        Write-Host "❌ Detalle de cambios cancelado."
    }
}

function Push-Produccion-Seguro {
    cd $global:projectDir
    $ramaActual = git branch --show-current
    Write-Host "📌 Estás actualmente en: $ramaActual"

    if ($ramaActual -eq "main" -or $ramaActual -eq "master") {
        Write-Host "⚠️ Ya estás en PRODUCCIÓN. Haz commit seguro antes de subir."
        $choice = Read-Host "¿Quieres hacer push directo a main/master? (S/N)"
        if ($choice -eq "S") {
            git push origin $ramaActual
            Write-Host "✅ Cambios subidos directamente a $ramaActual"
        } else {
            Write-Host "❌ Push cancelado."
        }
        return
    }

    # Crear staging
    Write-Host "🌱 Preparando rama de staging..."
    git fetch origin
    if ((git branch -a) -match "remotes/origin/staging") {
        git checkout staging
        git pull origin staging
    } else {
        git checkout -b staging
    }

    Write-Host "🔀 Merge de $ramaActual -> staging"
    git merge $ramaActual --no-ff
    git push origin staging
    Write-Host "✅ Cambios subidos a STAGING para pruebas."

    $choice = Read-Host "¿Quieres también subir de staging a main/master (producción)? (S/N)"
    if ($choice -eq "S") {
        Crear-Backup-Rama
        git checkout main
        git pull origin main
        git merge staging --no-ff
        git push origin main
        Write-Host "🚀 Cambios en $ramaActual → staging → main aplicados con éxito."
    } else {
        Write-Host "🛑 Cambios detenidos en STAGING. Verifica antes de producción."
    }
}

function Restaurar-Desde-Backup {
    cd $global:projectDir
    Write-Host "🔎 Respaldos disponibles:"
    git branch -a | Select-String "backup/" | ForEach-Object { $_.ToString().Trim() }
    $backup = Read-Host "Elige la rama backup para recuperar"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $newBranch = "recover/$timestamp"
    git checkout -b $newBranch $backup
    Write-Host "✅ Proyecto recuperado en nueva rama: $newBranch"
}

function Listar-Ramas {
    cd $global:projectDir
    Write-Host "🌿 Ramas disponibles:"
    git branch -a
}

function Restaurar-Archivo {
    param([string]$commitId, [string]$archivo)
    cd $global:projectDir
    git checkout $commitId -- $archivo
    Write-Host "✅ Archivo $archivo restaurado desde commit $commitId"
}

# ==============================
# 📋 Menú Principal
# ==============================
do {
    Clear-Host
    Write-Host "=============================="
    Write-Host "   🔐 GIT MANAGER PRO ULTRA"
    Write-Host "=============================="
    Write-Host "1. 👥 Cambiar sesión/repositorio"
    Write-Host "2. 💾 Crear rama de respaldo"
    Write-Host "3. 📝 Commit seguro (auto-fecha/hora)"
    Write-Host "4. ⬆️ Subir cambios (staging + producción)"
    Write-Host "5. ♻️ Recuperar proyecto desde backup"
    Write-Host "6. 🌿 Listar ramas"
    Write-Host "7. 📂 Restaurar archivo de commit"
    Write-Host "8. 🔍 Comparar ramas (preview + detalle opcional)"
    Write-Host "0. ❌ Salir"
    Write-Host "=============================="
    $option = Read-Host "Selecciona una opción"

    switch ($option) {
        "1" { Set-Sesion }
        "2" { Crear-Backup-Rama }
        "3" { 
            $tipo = Read-Host "Tipo de commit (fix, feat, chore, refactor)"
            $descripcion = Read-Host "Descripción breve"
            Commit-Seguro -tipo $tipo -descripcion $descripcion
        }
        "4" { Push-Produccion-Seguro }
        "5" { Restaurar-Desde-Backup }
        "6" { Listar-Ramas }
        "7" { 
            $commitId = Read-Host "Commit ID"
            $archivo = Read-Host "Archivo a restaurar"
            Restaurar-Archivo -commitId $commitId -archivo $archivo
        }
        "8" { Comparar-Ramas }
        "0" { Write-Host "👋 Saliendo..."; break }
        default { Write-Host "❌ Opción inválida." }
    }

    if ($option -ne "0") { Pause }
} while ($true)
