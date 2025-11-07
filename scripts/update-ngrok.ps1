# Script para Actualizar ngrok
# Versión: 3.5.2

Write-Host "🔄 Actualizando ngrok..." -ForegroundColor Cyan
Write-Host ""

# Verificar versión actual
$currentVersion = (ngrok version 2>&1 | Select-String -Pattern "version\s+(\d+\.\d+\.\d+)" | ForEach-Object { $_.Matches.Groups[1].Value })
Write-Host "📊 Versión actual: $currentVersion" -ForegroundColor Yellow
Write-Host "📊 Versión disponible: 3.32.0" -ForegroundColor Green
Write-Host ""

# Verificar cómo está instalado
$ngrokSource = (winget list ngrok 2>&1 | Select-String -Pattern "msstore|winget|chocolatey")
$isMsStore = $ngrokSource -like "*msstore*"

if ($isMsStore) {
    Write-Host "📦 ngrok está instalado desde Microsoft Store" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 OPCIONES DE ACTUALIZACIÓN:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1️⃣ Actualizar desde Microsoft Store (recomendado):" -ForegroundColor Green
    Write-Host "   - Abre Microsoft Store" -ForegroundColor White
    Write-Host "   - Ve a 'Mis bibliotecas' o busca 'ngrok'" -ForegroundColor White
    Write-Host "   - Haz clic en 'Actualizar' si está disponible" -ForegroundColor White
    Write-Host ""
    Write-Host "   O ejecuta este comando para abrir la Store:" -ForegroundColor Cyan
    Write-Host "   Start-Process 'ms-windows-store://pdp/?ProductId=9MVS1J51GMK6'" -ForegroundColor Gray
    Write-Host ""
    
    # Intentar abrir Microsoft Store
    $openStore = Read-Host "¿Quieres abrir Microsoft Store ahora? (S/N)"
    if ($openStore -eq "S" -or $openStore -eq "s" -or $openStore -eq "Y" -or $openStore -eq "y") {
        Start-Process "ms-windows-store://pdp/?ProductId=9MVS1J51GMK6"
        Write-Host "✅ Microsoft Store abierto" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "2️⃣ Descargar desde ngrok.com (alternativa):" -ForegroundColor Green
    Write-Host "   - Visita: https://ngrok.com/download" -ForegroundColor White
    Write-Host "   - Descarga la versión más reciente para Windows" -ForegroundColor White
    Write-Host "   - Instala sobre la versión actual" -ForegroundColor White
    Write-Host ""
    Write-Host "   O ejecuta este comando para abrir la página de descarga:" -ForegroundColor Cyan
    Write-Host "   Start-Process 'https://ngrok.com/download'" -ForegroundColor Gray
    Write-Host ""
    
    $openDownload = Read-Host "¿Quieres abrir la página de descarga de ngrok? (S/N)"
    if ($openDownload -eq "S" -or $openDownload -eq "s" -or $openDownload -eq "Y" -or $openDownload -eq "y") {
        Start-Process "https://ngrok.com/download"
        Write-Host "✅ Página de descarga abierta" -ForegroundColor Green
    }
} else {
    Write-Host "📦 ngrok está instalado desde otra fuente" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Intentando actualizar con winget..." -ForegroundColor Yellow
    winget upgrade ngrok
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "⚠️  No se pudo actualizar con winget" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔧 OPCIONES ALTERNATIVAS:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1️⃣ Descargar desde ngrok.com:" -ForegroundColor Green
        Write-Host "   - Visita: https://ngrok.com/download" -ForegroundColor White
        Write-Host "   - Descarga la versión más reciente" -ForegroundColor White
        Write-Host ""
        Write-Host "2️⃣ Usar npm (si está instalado):" -ForegroundColor Green
        Write-Host "   npm install -g ngrok@latest" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host ""
Write-Host "✅ Proceso completado" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Después de actualizar, verifica la versión con:" -ForegroundColor Cyan
Write-Host "   ngrok version" -ForegroundColor White
Write-Host ""

