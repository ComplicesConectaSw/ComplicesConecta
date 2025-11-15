# Build APK Release - Generar APK automáticamente
# Version: 3.6.3
# Purpose: Generar APK de release usando Gradle desde línea de comandos

Write-Host "📱 Generando APK de Release..." -ForegroundColor Cyan

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

Write-Host "🔨 Generando APK de Release con Gradle..." -ForegroundColor Cyan

# Deshabilitar Sentry temporalmente
Write-Host "  🔧 Deshabilitando Sentry para build..." -ForegroundColor Yellow
$buildGradlePath = "app\build.gradle"
$buildGradleBackup = "app\build.gradle.backup-apk"

# Crear backup
Copy-Item $buildGradlePath $buildGradleBackup -Force

# Deshabilitar plugin y configuración de Sentry
$buildGradleContent = Get-Content $buildGradlePath -Raw
$modifiedContent = $buildGradleContent -replace "id 'io.sentry.android.gradle' version '5.12.1'", "// id 'io.sentry.android.gradle' version '5.12.1' // DESHABILITADO PARA APK"

# También comentar el bloque sentry { }
$modifiedContent = $modifiedContent -replace "sentry \{", "// sentry {"
$modifiedContent = $modifiedContent -replace "(\s+)org = ""complicesconecta""", "`$1// org = ""complicesconecta"""
$modifiedContent = $modifiedContent -replace "(\s+)projectName = ""android""", "`$1// projectName = ""android"""
$modifiedContent = $modifiedContent -replace "(\s+)includeSourceContext = true", "`$1// includeSourceContext = true"
$modifiedContent = $modifiedContent -replace "(\s+)autoUploadProguardMapping = ", "`$1// autoUploadProguardMapping = "
$modifiedContent = $modifiedContent -replace "(\s+)autoUploadSourceContext = ", "`$1// autoUploadSourceContext = "
$modifiedContent = $modifiedContent -replace "(\s+)tracingInstrumentation \{", "`$1// tracingInstrumentation {"
$modifiedContent = $modifiedContent -replace "(\s+)enabled = false", "`$1// enabled = false"

$modifiedContent | Out-File $buildGradlePath -Encoding UTF8

# Generar APK de release
.\gradlew assembleRelease

# Restaurar build.gradle original
Copy-Item $buildGradleBackup $buildGradlePath -Force
Remove-Item $buildGradleBackup -Force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK generado exitosamente!" -ForegroundColor Green
    
    # Verificar si el APK existe
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "📱 APK ubicado en: $apkPath" -ForegroundColor Cyan
        Write-Host "📊 Tamaño del APK: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        
        # Copiar APK a la raíz del proyecto para fácil acceso
        $rootApkPath = "..\app-release-v3.6.3.apk"
        Copy-Item $apkPath $rootApkPath -Force
        Write-Host "📋 APK copiado a: app-release-v3.6.3.apk (en la raíz del proyecto)" -ForegroundColor Green
        
        Write-Host "🎉 ¡APK listo para instalar!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ APK generado pero no encontrado en la ubicación esperada" -ForegroundColor Yellow
        Write-Host "🔍 Busca el APK en: android\app\build\outputs\apk\release\" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Error al generar el APK" -ForegroundColor Red
    Write-Host "💡 Intenta:" -ForegroundColor Yellow
    Write-Host "   1. Abrir Android Studio" -ForegroundColor White
    Write-Host "   2. Build → Generate Signed Bundle/APK" -ForegroundColor White
    Write-Host "   3. Seleccionar APK y seguir el asistente" -ForegroundColor White
}

# Volver al directorio raíz
Set-Location ".."

Write-Host "📁 Ubicaciones del APK:" -ForegroundColor Cyan
Write-Host "   - android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor White
Write-Host "   - app-release-v3.6.3.apk (copia en raíz)" -ForegroundColor White
