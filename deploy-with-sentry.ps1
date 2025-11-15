# Deploy con Sentry - Para Android builds con source maps
# Version: 3.6.3
# Purpose: Build y deploy con Sentry habilitado para Android

Write-Host "🚀 Deploy con Sentry habilitado..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar que existe .env.local con token Sentry
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: No se encontró .env.local con configuración de Sentry." -ForegroundColor Red
    Write-Host "💡 Crea .env.local con:" -ForegroundColor Yellow
    Write-Host "   SENTRY_AUTH_TOKEN=tu_token_aqui" -ForegroundColor White
    exit 1
}

# Verificar token Sentry
$sentryToken = Get-Content ".env.local" | Where-Object { $_ -match "SENTRY_AUTH_TOKEN=" } | ForEach-Object { $_.Split("=")[1].Trim('"') }
if (-not $sentryToken -or $sentryToken -eq "your_sentry_auth_token_here" -or $sentryToken -eq "") {
    Write-Host "❌ Error: Token de Sentry no configurado en .env.local" -ForegroundColor Red
    Write-Host "💡 Configura SENTRY_AUTH_TOKEN en .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Token de Sentry encontrado: ${sentryToken.Substring(0,20)}..." -ForegroundColor Green

# Limpiar Android build antes de continuar
Write-Host "🧹 Limpiando build de Android..." -ForegroundColor Cyan

# Detener procesos relacionados
Get-Process | Where-Object {$_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*java*" -or $_.ProcessName -like "*adb*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Limpiar directorios problemáticos
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

# Limpiar cache
npm cache clean --force 2>$null
Write-Host "  ✅ Limpieza completada" -ForegroundColor Green

# Build del proyecto con Sentry
Write-Host "🔨 Construyendo proyecto con Sentry..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# Sync con Android (con Sentry habilitado)
Write-Host "📱 Sincronizando con Android (Sentry habilitado)..." -ForegroundColor Cyan

# Configurar variables de entorno para Sentry
$env:SENTRY_AUTH_TOKEN = $sentryToken
$env:SENTRY_ORG = "complicesconecta"
$env:SENTRY_PROJECT = "complicesconecta"

Write-Host "  🔑 Token configurado: ${sentryToken.Substring(0,20)}..." -ForegroundColor Green

$maxRetries = 3
$retryCount = 0

do {
    $retryCount++
    Write-Host "  🔄 Intento $retryCount de $maxRetries..." -ForegroundColor Yellow
    
    npx cap sync android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Sync Android con Sentry exitoso!" -ForegroundColor Green
        break
    } else {
        Write-Host "  ❌ Error en sync Android (intento $retryCount)" -ForegroundColor Red
        
        if ($retryCount -lt $maxRetries) {
            Write-Host "  🧹 Limpiando y reintentando..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            
            # Limpiar directorios problemáticos
            Remove-Item "android\capacitor-cordova-android-plugins\build" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
} while ($retryCount -lt $maxRetries -and $LASTEXITCODE -ne 0)

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error persistente en sync Android después de $maxRetries intentos" -ForegroundColor Red
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verificar que el token Sentry sea válido" -ForegroundColor White
    Write-Host "   2. Verificar conexión a internet" -ForegroundColor White
    Write-Host "   3. Usar .\deploy-without-sentry.ps1 como alternativa" -ForegroundColor White
    exit 1
}

Write-Host "✅ Deploy con Sentry completado exitosamente!" -ForegroundColor Green
Write-Host "📊 Sentry configurado para:" -ForegroundColor Cyan
Write-Host "   - Upload de source maps" -ForegroundColor White
Write-Host "   - Error tracking en Android" -ForegroundColor White
Write-Host "   - Performance monitoring" -ForegroundColor White
