# ==============================
# 🗄️ SUPABASE SQL MANAGER
# ==============================

$backupDir = "D:\complicesconecta_ultima_version_respaldo\supabase\migrations"
$projectDir = "C:\Users\conej\Documents\conecta-social-comunidad-main"

function Crear-Backup {
    param([string]$ruta = $backupDir)
    if (-not (Test-Path $ruta)) {
        New-Item -ItemType Directory -Path $ruta -Force | Out-Null
    }
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = "backup_${timestamp}.sql"
    $fullPath = Join-Path $ruta $fileName
    Write-Host "📦 Creando backup completo en $fullPath ..."
    cd $projectDir
    npx supabase db dump -f $fullPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup creado: $fullPath"
    } else {
        Write-Host "❌ Error al crear el backup."
    }
    return $fullPath
}

function Reparar-Migraciones {
    param([string[]]$conflicts)
    Write-Host "⚠️ Se detectaron migraciones conflictivas:"
    $conflicts | ForEach-Object { Write-Host "- $_" }

    $choice = Read-Host "¿Deseas repararlas? (S/N)"
    if ($choice -eq "S") {
        # Backup antes de reparar
        Crear-Backup

        foreach ($id in $conflicts) {
            Write-Host "🛠️ Reparando $id => reverted..."
            npx supabase migration repair --status reverted $id
        }
        Write-Host "✅ Reparaciones completadas"
    } else {
        Write-Host "⏭️ Reparación cancelada por el usuario."
    }
}

function Recuperar-DesdeRemoto {
    Write-Host "🌐 Recuperando y alineando desde REMOTO..."
    cd $projectDir
    $output = npx supabase db pull 2>&1

    # Buscar conflictos de migración
    $conflicts = @()
    foreach ($line in $output) {
        if ($line -match "supabase migration repair --status reverted (\d+)") {
            $conflicts += $Matches[1]
        }
    }

    if ($conflicts.Count -gt 0) {
        Reparar-Migraciones -conflicts $conflicts
        # Reintentar después de reparar
        npx supabase db pull
    }

    # Regenerar tipos y type-check
    npx supabase gen types typescript --project-id axtvqnozatbmllvwzuim --schema public > "$projectDir\src\types\supabase.ts"
    npm run type-check

    # Backup final
    Crear-Backup
    Write-Host "✅ Proyecto alineado con remoto y respaldo creado."
}

function Recuperar-DesdeBackup {
    Write-Host "💾 Recuperando desde respaldo local..."
    if (-not (Test-Path $backupDir)) {
        Write-Host "❌ No existe la carpeta de respaldos: $backupDir"
        return
    }

    # Listar respaldos disponibles
    $files = Get-ChildItem $backupDir -Filter "backup_*.sql" | Sort-Object LastWriteTime -Descending
    if ($files.Count -eq 0) {
        Write-Host "⚠️ No se encontraron respaldos en $backupDir"
        return
    }

    Write-Host "📂 Respaldos disponibles:"
    for ($i=0; $i -lt $files.Count; $i++) {
        Write-Host "[$($i+1)] $($files[$i].Name)"
    }

    $choice = Read-Host "Selecciona el número del respaldo a usar"
    if ($choice -match "^\d+$" -and $choice -ge 1 -and $choice -le $files.Count) {
        $selectedFile = $files[$choice-1].FullName
        Write-Host "📥 Usando respaldo: $selectedFile"
        cd $projectDir
        npx supabase db push -f $selectedFile
        Write-Host "✅ Proyecto sincronizado con respaldo local."
    } else {
        Write-Host "❌ Selección inválida."
    }
}

function Eliminar-MigracionesLocales {
    $migrationsPath = Join-Path $projectDir "supabase\migrations"
    if (Test-Path $migrationsPath) {
        Write-Host "🗑️ Eliminando migraciones locales en $migrationsPath ..."
        Remove-Item -Recurse -Force $migrationsPath\*
        Write-Host "✅ Migraciones locales eliminadas (backup no afectado)."
    } else {
        Write-Host "⚠️ No existe carpeta de migraciones locales."
    }
}

function Crear-Backup-Personalizado {
    $ruta = Read-Host "Escribe la ruta donde guardar el backup"
    Crear-Backup -ruta $ruta
}

# Menú principal
do {
    Clear-Host
    Write-Host "=============================="
    Write-Host "   🗄️ SUPABASE SQL MANAGER"
    Write-Host "=============================="
    Write-Host "1. 📦 Hacer backup completo"
    Write-Host "2. 🔄 Recuperar y alinear proyecto"
    Write-Host "   2.1 🌐 Desde remoto (db pull)"
    Write-Host "   2.2 💾 Desde respaldo local (db push)"
    Write-Host "3. ⬆️ Subir y actualizar backup local"
    Write-Host "4. 🗑️ Eliminar migraciones locales"
    Write-Host "5. 📝 Crear backup en ruta personalizada"
    Write-Host "0. ❌ Salir"
    Write-Host "=============================="
    $option = Read-Host "Selecciona una opción"

    switch ($option) {
        "1" { Crear-Backup }
        "2.1" { Recuperar-DesdeRemoto }
        "2.2" { Recuperar-DesdeBackup }
        "3" { Crear-Backup }
        "4" { Eliminar-MigracionesLocales }
        "5" { Crear-Backup-Personalizado }
        "0" { Write-Host "👋 Saliendo..."; exit }
        default { Write-Host "❌ Opción inválida." }
    }

    Pause
} while ($true)
