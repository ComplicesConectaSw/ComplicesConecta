# 🔧 Script de Configuración de ngrok Authtoken
# Versión: 3.5.1

param(
    [Parameter(Mandatory=$true)]
    [string]$AuthToken
)

Write-Host "🔧 Configurando ngrok authtoken..." -ForegroundColor Cyan
Write-Host ""

# Verificar que ngrok esté instalado
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    Write-Host "Instalando ngrok..." -ForegroundColor Yellow
    npm install -g ngrok
}

# Configurar authtoken
Write-Host "Configurando authtoken..." -ForegroundColor Yellow
try {
    ngrok config add-authtoken $AuthToken
    Write-Host "✅ Authtoken configurado correctamente" -ForegroundColor Green
    Write-Host ""
    
    # Verificar configuración
    Write-Host "Verificando configuración..." -ForegroundColor Yellow
    ngrok config check
    
    Write-Host ""
    Write-Host "✅ ngrok está listo para usar!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar el túnel, ejecuta:" -ForegroundColor Cyan
    Write-Host "  npm run tunnel:ngrok" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Error configurando authtoken: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Asegúrate de que el authtoken sea correcto." -ForegroundColor Yellow
    Write-Host "Obtén tu authtoken en: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Cyan
    exit 1
}

