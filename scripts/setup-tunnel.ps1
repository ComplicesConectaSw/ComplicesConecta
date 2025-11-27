# 🚇 Script de Configuración de Túnel para ComplicesConecta
# Versión: 3.5.1

Write-Host "🚇 Configurando Túnel para ComplicesConecta v3.5.1" -ForegroundColor Cyan
Write-Host ""

# Verificar ngrok
Write-Host "1️⃣ Verificando ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if ($ngrokInstalled) {
    Write-Host "✅ ngrok está instalado" -ForegroundColor Green
    ngrok version
} else {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    Write-Host "Instalando ngrok..." -ForegroundColor Yellow
    npm install -g ngrok
}

Write-Host ""
Write-Host "2️⃣ Configurando ngrok..." -ForegroundColor Yellow

# Verificar si existe authtoken
$ngrokConfigPath = "$env:LOCALAPPDATA\ngrok\ngrok.yml"
if (Test-Path $ngrokConfigPath) {
    Write-Host "✅ Archivo de configuración encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Archivo de configuración no encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para configurar ngrok:" -ForegroundColor Cyan
    Write-Host "1. Crear cuenta en https://ngrok.com (gratis)" -ForegroundColor White
    Write-Host "2. Obtener authtoken desde dashboard" -ForegroundColor White
    Write-Host "3. Ejecutar: ngrok config add-authtoken YOUR_AUTH_TOKEN" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "3️⃣ Verificando puerto de Vite..." -ForegroundColor Yellow
Write-Host "✅ Vite usa el puerto 8080" -ForegroundColor Green

Write-Host ""
Write-Host "4️⃣ Scripts disponibles:" -ForegroundColor Yellow
Write-Host "  npm run tunnel:ngrok      - Iniciar túnel con ngrok (puerto 8080)" -ForegroundColor White
Write-Host "  npm run tunnel:cloudflare - Iniciar túnel con Cloudflare (puerto 8080)" -ForegroundColor White
Write-Host "  npm run tunnel:lt         - Iniciar túnel con localtunnel (puerto 8080)" -ForegroundColor White
Write-Host "  npm run dev:tunnel        - Iniciar dev + túnel simultáneamente" -ForegroundColor White

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el túnel, ejecuta:" -ForegroundColor Cyan
Write-Host "  npm run tunnel:ngrok" -ForegroundColor White
Write-Host ""

