# Script de Restauración de Respaldo v3.6.3
# Uso: .\restore-backup.ps1

Write-Host "🔄 Restaurando archivos desde respaldo..." -ForegroundColor Cyan

$backupDir = ".backup-working-v3.6.3"

if (-not (Test-Path $backupDir)) {
    Write-Host "❌ Error: No se encontró el directorio de respaldo" -ForegroundColor Red
    exit 1
}

# Restaurar archivos de configuración
Write-Host "📋 Restaurando archivos de configuración..." -ForegroundColor Yellow
Copy-Item -Path "$backupDir/vite.config.ts" -Destination "." -Force
Copy-Item -Path "$backupDir/vercel.json" -Destination "." -Force
Copy-Item -Path "$backupDir/index.html" -Destination "." -Force
Copy-Item -Path "$backupDir/package.json" -Destination "." -Force
Copy-Item -Path "$backupDir/package-lock.json" -Destination "." -Force

# Restaurar código principal
Write-Host "📝 Restaurando código principal..." -ForegroundColor Yellow
Copy-Item -Path "$backupDir/App.tsx" -Destination "src/" -Force
Copy-Item -Path "$backupDir/src/utils/*" -Destination "src/utils/" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backupDir/src/services/*" -Destination "src/services/" -Force -ErrorAction SilentlyContinue

# Restaurar componentes
Write-Host "🧩 Restaurando componentes..." -ForegroundColor Yellow
Copy-Item -Path "$backupDir/src/AdminProduction.tsx" -Destination "src/app/(admin)/" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backupDir/src/StoryViewer.tsx" -Destination "src/components/stories/" -Force -ErrorAction SilentlyContinue

# Restaurar tests
Write-Host "🧪 Restaurando tests..." -ForegroundColor Yellow
Copy-Item -Path "$backupDir/src/tests/*" -Destination "src/tests/" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backupDir/docs/tests/*" -Destination "docs/tests/" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Restauración completada exitosamente" -ForegroundColor Green
