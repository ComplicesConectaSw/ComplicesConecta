# Deploy Android SIN Sentry - Para evitar errores de upload
# Version: 3.6.3
# Purpose: Build Android deshabilitando completamente Sentry

Write-Host "🚀 Deploy Android SIN Sentry (evitar errores upload)..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Limpiar Android build
Write-Host "🧹 Limpiando build de Android..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*java*" -or $_.ProcessName -like "*adb*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$directoriesToClean = @(
    "android\.gradle",
    "android\app\build",
    "android\app\release", 
    "android\build",
    "android\capacitor-cordova-android-plugins\build",
    "android\.idea",
    "android\app\.cxx"
)

foreach ($dir in $directoriesToClean) {
    if (Test-Path $dir) {
        Write-Host "  🗑️ Eliminando: $dir" -ForegroundColor Gray
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Backup del build.gradle original
Write-Host "📋 Creando backup de build.gradle..." -ForegroundColor Yellow
Copy-Item "android\app\build.gradle" "android\app\build.gradle.backup" -Force

# Deshabilitar Sentry temporalmente en build.gradle
Write-Host "🔧 Deshabilitando Sentry en build.gradle..." -ForegroundColor Yellow
$buildGradleContent = Get-Content "android\app\build.gradle" -Raw
$modifiedContent = $buildGradleContent -replace "id 'io.sentry.android.gradle' version '5.12.1'", "// id 'io.sentry.android.gradle' version '5.12.1' // TEMPORALMENTE DESHABILITADO"

$modifiedContent | Out-File "android\app\build.gradle" -Encoding UTF8

# Build del proyecto
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    # Restaurar build.gradle
    Copy-Item "android\app\build.gradle.backup" "android\app\build.gradle" -Force
    Remove-Item "android\app\build.gradle.backup" -Force
    exit 1
}

# Sync con Android (sin Sentry)
Write-Host "📱 Sincronizando con Android (SIN Sentry)..." -ForegroundColor Cyan
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en sync Android" -ForegroundColor Red
    # Restaurar build.gradle
    Copy-Item "android\app\build.gradle.backup" "android\app\build.gradle" -Force
    Remove-Item "android\app\build.gradle.backup" -Force
    exit 1
}

# Restaurar build.gradle original
Write-Host "🔄 Restaurando build.gradle original..." -ForegroundColor Yellow
Copy-Item "android\app\build.gradle.backup" "android\app\build.gradle" -Force
Remove-Item "android\app\build.gradle.backup" -Force

Write-Host "✅ Deploy Android SIN Sentry completado!" -ForegroundColor Green
Write-Host "📱 APK listo para generar en Android Studio" -ForegroundColor Cyan
Write-Host "💡 Para habilitar Sentry nuevamente:" -ForegroundColor Yellow
Write-Host "   - Configura correctamente el token en gradle.properties" -ForegroundColor White
Write-Host "   - Usa .\deploy-with-sentry.ps1" -ForegroundColor White
