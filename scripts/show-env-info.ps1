# Script para mostrar informacion de variables de entorno (seguro)
# Version: 3.5.1

Write-Host "Mostrando informacion de variables de entorno..." -ForegroundColor Cyan
Write-Host ""

# Verificar si existe archivo .env
if (Test-Path .env) {
    Write-Host "Archivo .env encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Variables de entorno (primeros 8 caracteres):" -ForegroundColor Yellow
    Write-Host ""
    
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            
            # Mostrar solo primeros 8 caracteres de valores sensibles
            if ($key -match 'PASSWORD|SECRET|TOKEN|KEY|AUTH') {
                if ($value.Length -gt 8) {
                    $masked = $value.Substring(0, 8) + "***"
                } else {
                    $masked = "***"
                }
                Write-Host "$key=$masked" -ForegroundColor Yellow
            } else {
                Write-Host "$key=$value" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "Creando archivo .env de ejemplo..." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Variables de entorno del sistema (VITE_*):" -ForegroundColor Yellow
Get-ChildItem Env: | Where-Object { $_.Name -like "VITE_*" } | ForEach-Object {
    if ($_.Name -match 'PASSWORD|SECRET|TOKEN|KEY|AUTH') {
        if ($_.Value.Length -gt 8) {
            $masked = $_.Value.Substring(0, 8) + "***"
        } else {
            $masked = "***"
        }
        Write-Host "$($_.Name)=$masked" -ForegroundColor Yellow
    } else {
        Write-Host "$($_.Name)=$($_.Value)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Para ver valores completos en consola del navegador:" -ForegroundColor Cyan
Write-Host "1. Abre la consola (F12)" -ForegroundColor White
Write-Host "2. Ejecuta: console.log(import.meta.env)" -ForegroundColor Green
Write-Host ""

