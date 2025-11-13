# Script PowerShell para aplicar tablas blockchain directamente
# ComplicesConecta v3.7.0 - Blockchain Tables Setup

Write-Host "🚀 Aplicando tablas blockchain..." -ForegroundColor Green

# Configuración de conexión
$dbHost = "127.0.0.1"
$dbPort = "54322"
$dbName = "postgres"
$dbUser = "postgres"
$dbPassword = "postgres"

# Ruta al script SQL
$sqlScript = Join-Path $PSScriptRoot "apply-blockchain-tables.sql"

# Verificar si el archivo SQL existe
if (-not (Test-Path $sqlScript)) {
    Write-Host "❌ Error: No se encontró el archivo SQL en $sqlScript" -ForegroundColor Red
    exit 1
}

# Construir comando psql
$env:PGPASSWORD = $dbPassword
$psqlCommand = "psql"
$psqlArgs = @(
    "-h", $dbHost,
    "-p", $dbPort,
    "-U", $dbUser,
    "-d", $dbName,
    "-f", $sqlScript
)

Write-Host "📊 Ejecutando script SQL..." -ForegroundColor Yellow

try {
    # Ejecutar psql
    & $psqlCommand @psqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tablas blockchain aplicadas exitosamente" -ForegroundColor Green
        Write-Host "🎯 Sistema blockchain listo para desarrollo" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al aplicar las tablas blockchain" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "❌ Error ejecutando psql: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que PostgreSQL esté instalado y en el PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "🏁 Proceso completado" -ForegroundColor Green
