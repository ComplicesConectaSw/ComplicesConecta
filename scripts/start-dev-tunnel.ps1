# Script para Iniciar Dev + Tunnel
# Version: 3.5.1

Write-Host "Iniciando servidor de desarrollo con tunnel..." -ForegroundColor Cyan
Write-Host ""

# Verificar que localtunnel este instalado
$ltInstalled = Get-Command lt -ErrorAction SilentlyContinue
if (-not $ltInstalled) {
    Write-Host "Instalando localtunnel..." -ForegroundColor Yellow
    npm install -g localtunnel
}

Write-Host "Iniciando en ventanas separadas:" -ForegroundColor Yellow
Write-Host "1. Servidor de desarrollo (http://localhost:8080)" -ForegroundColor White
Write-Host "2. Tunnel publico (URL se mostrara en la ventana)" -ForegroundColor White
Write-Host ""

# Iniciar servidor de desarrollo en ventana separada
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Cyan
$devCommand = "cd '$PWD'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $devCommand -WindowStyle Normal

Start-Sleep -Seconds 3

# Iniciar tunnel en ventana separada
Write-Host "Iniciando tunnel con localtunnel..." -ForegroundColor Cyan
$tunnelCommand = "cd '$PWD'; lt --port 8080"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $tunnelCommand -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Servidor y tunnel iniciados en ventanas separadas" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver los errores:" -ForegroundColor Cyan
Write-Host "1. Revisa la ventana del tunnel para ver la URL publica (ej: https://xxxxx.loca.lt)" -ForegroundColor White
Write-Host "2. Abre esa URL en el navegador" -ForegroundColor White
Write-Host "3. Presiona F12 para abrir la consola de desarrollador" -ForegroundColor White
Write-Host "4. Revisa los errores en la pestaña Console" -ForegroundColor White
Write-Host ""
Write-Host "Tambien puedes ver los errores en:" -ForegroundColor Cyan
Write-Host "   - Terminal del servidor de desarrollo" -ForegroundColor White
Write-Host "   - Terminal del tunnel" -ForegroundColor White
Write-Host ""
Write-Host "URL local: http://localhost:8080" -ForegroundColor Green
Write-Host ""
