# Clean Android Build SOLO - Sin reconstruir
# Version: 3.6.3
# Purpose: Limpiar solo archivos de Android sin reconstruir (para casos específicos)

Write-Host "🧹 Limpieza SOLO de archivos Android (sin reconstruir)..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "android")) {
    Write-Host "❌ Error: No se encontró directorio android." -ForegroundColor Red
    exit 1
}

# Función para forzar eliminación de directorio
function Remove-DirectoryForce {
    param([string]$Path)
    
    if (Test-Path $Path) {
        Write-Host "  🗑️ Eliminando: $Path" -ForegroundColor Yellow
        try {
            Remove-Item $Path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✅ Eliminado exitosamente" -ForegroundColor Green
        }
        catch {
            Write-Host "  ⚠️ Usando método alternativo..." -ForegroundColor Yellow
            $cmdPath = $Path -replace '/', '\'
            cmd /c "rmdir /s /q `"$cmdPath`""
            
            if (-not (Test-Path $Path)) {
                Write-Host "  ✅ Eliminado con método alternativo" -ForegroundColor Green
            } else {
                Write-Host "  ❌ No se pudo eliminar: $Path" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ℹ️ No existe: $Path" -ForegroundColor Gray
    }
}

# Detener procesos relacionados
Write-Host "🛑 Deteniendo procesos relacionados..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*java*" -or $_.ProcessName -like "*adb*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Directorios a limpiar
$directoriesToClean = @(
    "android\.gradle",
    "android\app\build",
    "android\app\release",
    "android\build",
    "android\capacitor-cordova-android-plugins\build",
    "android\.idea",
    "android\app\.cxx"
)

Write-Host "📁 Limpiando directorios de build..." -ForegroundColor Cyan
foreach ($dir in $directoriesToClean) {
    Remove-DirectoryForce -Path $dir
}

# Limpiar archivos específicos
$filesToClean = @(
    "android\local.properties"
)

Write-Host "📄 Limpiando archivos específicos..." -ForegroundColor Cyan
foreach ($file in $filesToClean) {
    if (Test-Path $file) {
        Write-Host "  🗑️ Eliminando archivo: $file" -ForegroundColor Yellow
        Remove-Item $file -Force -ErrorAction SilentlyContinue
    }
}

# Limpiar cache
Write-Host "🧹 Limpiando cache de npm..." -ForegroundColor Cyan
npm cache clean --force 2>$null

Write-Host "✅ Limpieza SOLO de Android completada!" -ForegroundColor Green
Write-Host "⚠️ IMPORTANTE: Debes ejecutar manualmente:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   npx cap sync android" -ForegroundColor White
Write-Host "💡 O usar .\deploy-without-sentry.ps1 para deploy completo" -ForegroundColor Cyan
