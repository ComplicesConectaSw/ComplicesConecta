# Build APK Direct - Generar APK sin Android Studio
# Version: 3.6.3
# Purpose: Generar APK directamente con Gradle evitando errores de Android Studio

Write-Host "📱 Generando APK directamente con Gradle..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "android")) {
    Write-Host "❌ Error: No se encontró directorio android." -ForegroundColor Red
    exit 1
}

# Ejecutar deploy sin Sentry primero
Write-Host "🔧 Preparando proyecto Android..." -ForegroundColor Yellow
if (Test-Path "deploy-android-no-sentry.ps1") {
    & .\deploy-android-no-sentry.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en la preparación del proyecto" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Error: No se encontró deploy-android-no-sentry.ps1" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio android
Set-Location "android"

Write-Host "🔨 Generando APK sin firmar..." -ForegroundColor Cyan

# Limpiar build anterior
Write-Host "  🧹 Limpiando build anterior..." -ForegroundColor Yellow
.\gradlew clean

# Generar APK de release sin firmar (evita problemas de keystore)
Write-Host "  📱 Generando APK de release..." -ForegroundColor Yellow
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK generado exitosamente!" -ForegroundColor Green
    
    # Verificar si el APK existe
    $apkPath = "app\build\outputs\apk\release\app-release-unsigned.apk"
    $apkPathSigned = "app\build\outputs\apk\release\app-release.apk"
    
    # Buscar el APK generado (puede ser signed o unsigned)
    $finalApkPath = ""
    if (Test-Path $apkPathSigned) {
        $finalApkPath = $apkPathSigned
        Write-Host "📱 APK firmado encontrado: $apkPathSigned" -ForegroundColor Green
    } elseif (Test-Path $apkPath) {
        $finalApkPath = $apkPath
        Write-Host "📱 APK sin firmar encontrado: $apkPath" -ForegroundColor Yellow
        Write-Host "⚠️ Nota: APK sin firmar - solo para testing" -ForegroundColor Yellow
    } else {
        # Buscar cualquier APK en el directorio
        $apkFiles = Get-ChildItem "app\build\outputs\apk\release\" -Filter "*.apk" -ErrorAction SilentlyContinue
        if ($apkFiles.Count -gt 0) {
            $finalApkPath = $apkFiles[0].FullName
            Write-Host "📱 APK encontrado: $finalApkPath" -ForegroundColor Green
        }
    }
    
    if ($finalApkPath -and (Test-Path $finalApkPath)) {
        $apkSize = (Get-Item $finalApkPath).Length / 1MB
        Write-Host "📊 Tamaño del APK: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        
        # Copiar APK a la raíz del proyecto para fácil acceso
        $rootApkPath = "..\ComplicesConecta-v3.6.3.apk"
        Copy-Item $finalApkPath $rootApkPath -Force
        Write-Host "📋 APK copiado a: ComplicesConecta-v3.6.3.apk (en la raíz del proyecto)" -ForegroundColor Green
        
        # Mostrar información del APK
        Write-Host "" -ForegroundColor White
        Write-Host "🎉 ¡APK generado exitosamente!" -ForegroundColor Green
        Write-Host "📁 Ubicaciones:" -ForegroundColor Cyan
        Write-Host "   - Original: $finalApkPath" -ForegroundColor White
        Write-Host "   - Copia: ComplicesConecta-v3.6.3.apk" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        Write-Host "📱 Para instalar:" -ForegroundColor Yellow
        Write-Host "   1. Transfiere el APK a tu dispositivo Android" -ForegroundColor White
        Write-Host "   2. Habilita 'Fuentes desconocidas' en Configuración" -ForegroundColor White
        Write-Host "   3. Toca el archivo APK para instalarlo" -ForegroundColor White
        
        if ($finalApkPath -like "*unsigned*") {
            Write-Host "" -ForegroundColor White
            Write-Host "⚠️ IMPORTANTE: APK sin firmar" -ForegroundColor Yellow
            Write-Host "   - Solo para testing y desarrollo" -ForegroundColor White
            Write-Host "   - No se puede publicar en Play Store" -ForegroundColor White
            Write-Host "   - Para producción, necesitas firmar el APK" -ForegroundColor White
        }
        
    } else {
        Write-Host "⚠️ APK generado pero no encontrado en ubicación esperada" -ForegroundColor Yellow
        Write-Host "🔍 Busca archivos APK en:" -ForegroundColor Cyan
        Write-Host "   android\app\build\outputs\apk\release\" -ForegroundColor White
        
        # Listar todos los archivos en el directorio de salida
        $outputDir = "app\build\outputs\apk\release\"
        if (Test-Path $outputDir) {
            Write-Host "📂 Archivos encontrados:" -ForegroundColor Cyan
            Get-ChildItem $outputDir | ForEach-Object {
                Write-Host "   - $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB)" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "❌ Error al generar el APK" -ForegroundColor Red
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que Java SDK esté instalado" -ForegroundColor White
    Write-Host "   2. Verifica que Android SDK esté configurado" -ForegroundColor White
    Write-Host "   3. Ejecuta: .\gradlew --stacktrace assembleRelease" -ForegroundColor White
    Write-Host "   4. Revisa los logs de error arriba" -ForegroundColor White
}

# Volver al directorio raíz
Set-Location ".."

Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   - Ver tareas disponibles: cd android && .\gradlew tasks" -ForegroundColor White
Write-Host "   - Limpiar proyecto: cd android && .\gradlew clean" -ForegroundColor White
Write-Host "   - Build con logs: cd android && .\gradlew assembleRelease --info" -ForegroundColor White
