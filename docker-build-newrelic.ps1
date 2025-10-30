# ================================
# Script para Build y Deploy con New Relic
# ComplicesConecta v3.4.1
# ================================

param(
    [string]$Action = "build",
    [string]$Version = "latest"
)

$ImageName = "complicesconecta"
$NewRelicKey = "6f647c9c6eaa46100c049ab77e900462FFFFNRAL"
$AppName = "ComplicesConecta"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ComplicesConecta - New Relic Docker Manager" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Build-Image {
    Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
    docker build -t ${ImageName}:${Version} .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Image built successfully: ${ImageName}:${Version}" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        return $false
    }
}

function Run-Container {
    Write-Host "🚀 Starting container with New Relic..." -ForegroundColor Yellow
    
    # Detener contenedor existente si existe
    docker stop $ImageName 2>$null
    docker rm $ImageName 2>$null
    
    # Ejecutar nuevo contenedor
    docker run -d `
        --name $ImageName `
        -p 3000:3000 `
        -e NEW_RELIC_LICENSE_KEY=$NewRelicKey `
        -e NEW_RELIC_APP_NAME=$AppName `
        ${ImageName}:${Version}
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Application: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "📈 New Relic Dashboard: https://one.newrelic.com/nr1-core?account=7299297" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Logs:" -ForegroundColor Yellow
        docker logs -f $ImageName
        return $true
    } else {
        Write-Host "❌ Container failed to start!" -ForegroundColor Red
        return $false
    }
}

function Show-Logs {
    Write-Host "📋 Showing logs..." -ForegroundColor Yellow
    docker logs -f $ImageName
}

function Stop-Container {
    Write-Host "🛑 Stopping container..." -ForegroundColor Yellow
    docker stop $ImageName
    docker rm $ImageName
    Write-Host "✅ Container stopped and removed" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Yellow
    docker ps -a | Select-String $ImageName
    Write-Host ""
    Write-Host "📈 New Relic Status:" -ForegroundColor Yellow
    docker logs $ImageName --tail 20 | Select-String "New Relic"
}

# Main execution
switch ($Action.ToLower()) {
    "build" {
        Build-Image
    }
    "run" {
        if (Build-Image) {
            Run-Container
        }
    }
    "start" {
        Run-Container
    }
    "stop" {
        Stop-Container
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "rebuild" {
        Stop-Container
        if (Build-Image) {
            Run-Container
        }
    }
    default {
        Write-Host "Usage: .\docker-build-newrelic.ps1 -Action [build|run|start|stop|logs|status|rebuild]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Actions:" -ForegroundColor Cyan
        Write-Host "  build   - Build Docker image only" -ForegroundColor White
        Write-Host "  run     - Build and run container" -ForegroundColor White
        Write-Host "  start   - Start existing container" -ForegroundColor White
        Write-Host "  stop    - Stop and remove container" -ForegroundColor White
        Write-Host "  logs    - Show container logs" -ForegroundColor White
        Write-Host "  status  - Show container and New Relic status" -ForegroundColor White
        Write-Host "  rebuild - Stop, rebuild, and start container" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

