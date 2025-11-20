    # Deploy sin Sentry - Temporal para plan gratuito
# Version: 3.6.3
# Purpose: Deploy sin configuración de Sentry

Write-Host "🚀 Deploy sin Sentry (Plan Gratuito)..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Crear .env temporal sin Sentry
Write-Host "📄 Creando .env temporal sin Sentry..." -ForegroundColor Yellow

$envContent = @"
# Configuración temporal sin Sentry
VITE_SUPABASE_URL="https://axtvqnozatbmllvwzuim.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ5MDYsImV4cCI6MjA2MTY2MDkwNn0.yzrgK-Z-DR7lsUqftnVUA0GMsWQuf62zSAmDNxZKG9Y"
VITE_APP_MODE="production"
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_51S1karC9tJdg35c1i2FYePo2XSa7Xogqf2J2z2DeZvaXB5ZsX8TO1UMmPQ9rZs1xybIvkKvuvxABlhkFi441lF8C00pkxfgx7a"

# Sentry deshabilitado temporalmente
SENTRY_DSN=""
VITE_SENTRY_DSN=""
SENTRY_DISABLE_AUTO_UPLOAD="true"
"@

$envContent | Out-File -FilePath ".env.deploy" -Encoding UTF8

# Limpiar Android build antes de continuar
Write-Host "🧹 Limpiando build de Android..." -ForegroundColor Cyan
if (Test-Path "clean-android.ps1") {
    # Ejecutar solo la limpieza, sin reconstruir (lo haremos nosotros)
    Write-Host "  🗑️ Ejecutando limpieza de archivos Android..." -ForegroundColor Yellow
    
    # Detener procesos que puedan estar usando los archivos
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
            Write-Host "    🗑️ Eliminando: $dir" -ForegroundColor Gray
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Limpiar cache
    npm cache clean --force 2>$null
    
    Write-Host "  ✅ Limpieza completada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Script de limpieza no encontrado, continuando..." -ForegroundColor Yellow
}

# Build del proyecto (SIEMPRE después de limpiar)
Write-Host "🔨 Construyendo proyecto completo..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# Sync con Android (con reintentos)
Write-Host "📱 Sincronizando con Android..." -ForegroundColor Cyan
$maxRetries = 3
$retryCount = 0

do {
    $retryCount++
    Write-Host "  🔄 Intento $retryCount de $maxRetries..." -ForegroundColor Yellow
    
    npx cap sync android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Sync Android exitoso!" -ForegroundColor Green
        break
    } else {
        Write-Host "  ❌ Error en sync Android (intento $retryCount)" -ForegroundColor Red
        
        if ($retryCount -lt $maxRetries) {
            Write-Host "  🧹 Limpiando y reintentando..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            
            # Limpiar directorios problemáticos
            Remove-Item "android\capacitor-cordova-android-plugins\build" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
} while ($retryCount -lt $maxRetries -and $LASTEXITCODE -ne 0)

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error persistente en sync Android después de $maxRetries intentos" -ForegroundColor Red
    Write-Host "💡 Intenta ejecutar manualmente:" -ForegroundColor Yellow
    Write-Host "   .\clean-android.ps1" -ForegroundColor White
    Write-Host "   npx cap sync android" -ForegroundColor White
    exit 1
}

Write-Host "✅ Deploy completado sin Sentry!" -ForegroundColor Green
Write-Host "💡 Para habilitar Sentry:" -ForegroundColor Yellow
Write-Host "   1. Crea cuenta gratuita en sentry.io" -ForegroundColor White
Write-Host "   2. Crea proyecto React" -ForegroundColor White
Write-Host "   3. Copia el DSN a tu .env.local" -ForegroundColor White
Write-Host "   4. Usa build-and-deploy.ps1 normal" -ForegroundColor White

# Limpiar archivo temporal
Remove-Item ".env.deploy" -ErrorAction SilentlyContinue
