# Script para Iniciar Dev + Tunnel
# Version: 3.5.2 - Con alternativas automáticas

Write-Host "🚇 Iniciando servidor de desarrollo con tunnel..." -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando está disponible
function Test-Command {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Detectar mejor opción de tunnel disponible
$tunnelType = $null
$tunnelCommand = $null

Write-Host "🔍 Detectando mejor opción de tunnel disponible..." -ForegroundColor Yellow

# Opción 1: Cloudflare Tunnel (más confiable, sin firewall issues)
if (Test-Command "cloudflared") {
    $tunnelType = "cloudflare"
    $tunnelCommand = "cd '$PWD'; cloudflared tunnel --url http://localhost:8080"
    Write-Host "✅ Cloudflare Tunnel detectado (recomendado)" -ForegroundColor Green
}
# Opción 2: ngrok (si está configurado)
elseif (Test-Command "ngrok") {
    $tunnelType = "ngrok"
    $tunnelCommand = "cd '$PWD'; ngrok http 8080"
    Write-Host "✅ ngrok detectado" -ForegroundColor Green
}
# Opción 3: localtunnel (fallback)
elseif (Test-Command "lt") {
    $tunnelType = "localtunnel"
    $tunnelCommand = "cd '$PWD'; lt --port 8080"
    Write-Host "⚠️  localtunnel detectado (puede tener problemas de firewall)" -ForegroundColor Yellow
    Write-Host "💡 Recomendación: Instalar Cloudflare Tunnel para mejor estabilidad" -ForegroundColor Cyan
    Write-Host "   Comando: winget install --id Cloudflare.cloudflared" -ForegroundColor Gray
}
# Ninguna opción disponible
else {
    Write-Host "❌ No se encontró ningún tunnel disponible" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Opciones de instalación:" -ForegroundColor Cyan
    Write-Host "   1. Cloudflare Tunnel (recomendado):" -ForegroundColor White
    Write-Host "      winget install --id Cloudflare.cloudflared" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. ngrok:" -ForegroundColor White
    Write-Host "      npm install -g ngrok" -ForegroundColor Gray
    Write-Host "      ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. localtunnel (puede tener problemas de firewall):" -ForegroundColor White
    Write-Host "      npm install -g localtunnel" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Iniciando en ventanas separadas:" -ForegroundColor Yellow
Write-Host "1. Servidor de desarrollo (http://localhost:8080)" -ForegroundColor White
Write-Host "2. Tunnel público ($tunnelType) - URL se mostrará en la ventana" -ForegroundColor White
Write-Host ""

# Iniciar servidor de desarrollo en ventana separada
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
$devCommand = "cd '$PWD'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $devCommand -WindowStyle Normal

Start-Sleep -Seconds 3

# Iniciar tunnel en ventana separada
Write-Host "🌐 Iniciando tunnel con $tunnelType..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $tunnelCommand -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Servidor y tunnel iniciados en ventanas separadas" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Para ver los errores:" -ForegroundColor Cyan
Write-Host "   1. Revisa la ventana del tunnel para ver la URL pública" -ForegroundColor White
Write-Host "   2. Abre esa URL en el navegador" -ForegroundColor White
Write-Host "   3. Presiona F12 para abrir la consola de desarrollador" -ForegroundColor White
Write-Host "   4. Ejecuta: showErrorReport() para ver reporte completo" -ForegroundColor White
Write-Host ""
Write-Host "💡 También puedes ver los errores en:" -ForegroundColor Cyan
Write-Host "   - Terminal del servidor de desarrollo" -ForegroundColor White
Write-Host "   - Terminal del tunnel" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URL local: http://localhost:8080" -ForegroundColor Green
Write-Host ""
