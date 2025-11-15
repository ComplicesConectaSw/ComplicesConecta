# Clean Android Build - Resolver errores de directorio no vacío
# Version: 3.6.3
# Purpose: Limpiar completamente los archivos de build de Android

Write-Host "🧹 Limpiando archivos de build de Android..." -ForegroundColor Cyan

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
            # Intentar eliminación normal primero
            Remove-Item $Path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✅ Eliminado exitosamente" -ForegroundColor Green
        }
        catch {
            Write-Host "  ⚠️ Eliminación normal falló, usando método alternativo..." -ForegroundColor Yellow
            
            # Método alternativo usando cmd
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

# Detener procesos que puedan estar usando los archivos
Write-Host "🛑 Deteniendo procesos relacionados..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*java*" -or $_.ProcessName -like "*adb*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Esperar un momento para que se liberen los archivos
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
    "android\local.properties",
    "android\app\src\main\assets\public\*.html",
    "android\app\src\main\assets\public\manifest.json"
)

Write-Host "📄 Limpiando archivos específicos..." -ForegroundColor Cyan

foreach ($filePattern in $filesToClean) {
    if ($filePattern -like "*\*.*") {
        # Es un patrón con wildcard
        $files = Get-ChildItem $filePattern -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Write-Host "  🗑️ Eliminando archivo: $($file.FullName)" -ForegroundColor Yellow
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        }
    } else {
        # Es un archivo específico
        if (Test-Path $filePattern) {
            Write-Host "  🗑️ Eliminando archivo: $filePattern" -ForegroundColor Yellow
            Remove-Item $filePattern -Force -ErrorAction SilentlyContinue
        }
    }
}

# Limpiar cache de npm/node
Write-Host "🧹 Limpiando cache de npm..." -ForegroundColor Cyan
npm cache clean --force 2>$null

Write-Host "✅ Limpieza de Android completada!" -ForegroundColor Green
Write-Host "💡 Ahora puedes ejecutar:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   npx cap sync android" -ForegroundColor White
