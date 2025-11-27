# 🧪 Script de Prueba de Túnel
# Versión: 3.5.1

Write-Host "🧪 Probando configuración de túnel..." -ForegroundColor Cyan
Write-Host ""

# Verificar ngrok
Write-Host "1️⃣ Verificando ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if ($ngrokInstalled) {
    Write-Host "✅ ngrok está instalado" -ForegroundColor Green
    ngrok version
} else {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar configuración
Write-Host "2️⃣ Verificando configuración..." -ForegroundColor Yellow
try {
    ngrok config check 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Authtoken configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Authtoken no configurado" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Para configurar el authtoken:" -ForegroundColor Cyan
        Write-Host "1. Ve a: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
        Write-Host "2. Copia tu authtoken" -ForegroundColor White
        Write-Host "3. Ejecuta: ngrok config add-authtoken TU_AUTHTOKEN" -ForegroundColor White
        Write-Host ""
        Write-Host "O usa el script:" -ForegroundColor Cyan
        Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/configure-ngrok.ps1 -AuthToken TU_AUTHTOKEN" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "⚠️  Error verificando configuración: $_" -ForegroundColor Yellow
}

Write-Host ""

# Verificar puerto
Write-Host "3️⃣ Verificando puerto de Vite..." -ForegroundColor Yellow
$viteConfig = Get-Content vite.config.ts -Raw
if ($viteConfig -match "port:\s*(\d+)") {
    $port = $matches[1]
    Write-Host "✅ Vite usa el puerto $port" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo determinar el puerto de Vite" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Configuración verificada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el túnel:" -ForegroundColor Cyan
Write-Host "  npm run tunnel:ngrok" -ForegroundColor White
Write-Host ""

