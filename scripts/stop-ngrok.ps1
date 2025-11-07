# Script para Detener Túneles de ngrok
# Versión: 3.5.2

Write-Host "🛑 Deteniendo túneles de ngrok..." -ForegroundColor Cyan
Write-Host ""

# Buscar procesos de ngrok
$ngrokProcesses = Get-Process | Where-Object { $_.ProcessName -like "*ngrok*" }

if ($ngrokProcesses.Count -gt 0) {
    Write-Host "📋 Procesos de ngrok encontrados: $($ngrokProcesses.Count)" -ForegroundColor Yellow
    foreach ($proc in $ngrokProcesses) {
        Write-Host "   - PID: $($proc.Id) | Nombre: $($proc.ProcessName)" -ForegroundColor White
    }
    Write-Host ""
    
    $confirm = Read-Host "¿Deseas detener todos los procesos de ngrok? (S/N)"
    if ($confirm -eq "S" -or $confirm -eq "s" -or $confirm -eq "Y" -or $confirm -eq "y") {
        foreach ($proc in $ngrokProcesses) {
            try {
                Stop-Process -Id $proc.Id -Force
                Write-Host "✅ Proceso $($proc.Id) detenido" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error al detener proceso $($proc.Id): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        Write-Host ""
        Write-Host "✅ Todos los procesos de ngrok han sido detenidos" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Operación cancelada" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No se encontraron procesos de ngrok activos" -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 OPCIONES ALTERNATIVAS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Iniciar un nuevo túnel sin especificar dominio:" -ForegroundColor Yellow
Write-Host "   ngrok http 8080" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣ Usar pooling para múltiples endpoints:" -ForegroundColor Yellow
Write-Host "   ngrok http 8080 --pooling-enabled" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣ Usar Cloudflare Tunnel (sin límites):" -ForegroundColor Yellow
Write-Host "   cloudflared tunnel --url http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣ Usar el script mejorado (detecta automáticamente):" -ForegroundColor Yellow
Write-Host "   .\scripts\start-dev-tunnel.ps1" -ForegroundColor White
Write-Host ""

