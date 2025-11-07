# Script para reiniciar Dev + Tunnel
# Version: 3.5.1

Write-Host "Reiniciando servidor de desarrollo con tunnel..." -ForegroundColor Cyan
Write-Host ""

# Verificar si hay procesos en el puerto 8080
Write-Host "Verificando puerto 8080..." -ForegroundColor Yellow
$port8080 = netstat -ano | findstr :8080
if ($port8080) {
    Write-Host "Puerto 8080 en uso. Deteniendo procesos..." -ForegroundColor Yellow
    
    # Obtener PIDs de procesos en puerto 8080
    $pids = $port8080 | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Proceso $pid detenido" -ForegroundColor Green
        } catch {
            Write-Host "No se pudo detener proceso $pid" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Iniciando servidor y tunnel..." -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor de desarrollo
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Yellow
$devCommand = "cd '$PWD'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $devCommand -WindowStyle Normal

Start-Sleep -Seconds 5

# Verificar que el servidor esté corriendo
Write-Host "Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Servidor corriendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "Servidor no responde. Espera unos segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Iniciar tunnel
Write-Host "Iniciando tunnel con localtunnel..." -ForegroundColor Yellow
$tunnelCommand = "cd '$PWD'; lt --port 8080"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $tunnelCommand -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Servidor y tunnel reiniciados" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Local: http://localhost:8080" -ForegroundColor White
Write-Host "  Tunnel: Revisa la ventana del tunnel para ver la URL publica" -ForegroundColor White
Write-Host ""
Write-Host "Si el error 503 persiste:" -ForegroundColor Yellow
Write-Host "  1. Espera 10-15 segundos para que el tunnel se conecte" -ForegroundColor White
Write-Host "  2. Verifica que el servidor local funcione: http://localhost:8080" -ForegroundColor White
Write-Host "  3. Usa ngrok en lugar de localtunnel: npm run tunnel:ngrok" -ForegroundColor White
Write-Host ""

