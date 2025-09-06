# =====================================================
# SCRIPT POWERSHELL PARA EJECUTAR CORRECCIÓN AUTOMÁTICA SUPABASE
# ComplicesConecta v2.1.2 - Sistema de Corrección Automática
# Fecha: 06 de septiembre, 2025 - 05:27 hrs
# =====================================================

Write-Host "🤖 SISTEMA AUTOMÁTICO DE CORRECCIÓN SUPABASE" -ForegroundColor Cyan
Write-Host "🎯 ComplicesConecta v2.1.2 - Auto-Fix System" -ForegroundColor Green
Write-Host "⏰ Iniciado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

# Verificar que Node.js esté disponible
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en PATH" -ForegroundColor Red
    Write-Host "💡 Instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "💡 Ejecuta este script desde la raíz del proyecto ComplicesConecta" -ForegroundColor Yellow
    exit 1
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encuentra archivo .env" -ForegroundColor Red
    Write-Host "💡 Crea el archivo .env con las credenciales de Supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔍 PASO 1: EJECUTANDO AUDITORÍA AUTOMÁTICA" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray

# Ejecutar el sistema automático de corrección
try {
    Write-Host "🚀 Iniciando sistema automático..." -ForegroundColor Yellow
    node scripts/supabase_auto_fix.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Sistema automático ejecutado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Sistema completado con advertencias (código: $LASTEXITCODE)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error ejecutando sistema automático: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 PASO 2: VERIFICANDO RESULTADOS" -ForegroundColor Cyan
Write-Host "=" * 35 -ForegroundColor Gray

# Verificar que se generaron los reportes
if (Test-Path "reports/auto_fix_report.md") {
    Write-Host "✅ Reporte generado: reports/auto_fix_report.md" -ForegroundColor Green
} else {
    Write-Host "⚠️ No se encontró reporte de corrección" -ForegroundColor Yellow
}

if (Test-Path "reports/auto_fix_data.json") {
    Write-Host "✅ Datos de auditoría: reports/auto_fix_data.json" -ForegroundColor Green
} else {
    Write-Host "⚠️ No se encontraron datos de auditoría" -ForegroundColor Yellow
}

# Verificar scripts SQL generados
$sqlScripts = @(
    "scripts/auto_fix_database.sql",
    "scripts/auto_fix_rls.sql", 
    "scripts/auto_fix_buckets.sql",
    "scripts/auto_fix_indexes.sql"
)

Write-Host "`n🛠️ SCRIPTS SQL GENERADOS:" -ForegroundColor Cyan
foreach ($script in $sqlScripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script" -ForegroundColor Green
    } else {
        Write-Host "⚪ $script (no necesario)" -ForegroundColor Gray
    }
}

Write-Host "`n📋 PASO 3: INSTRUCCIONES DE APLICACIÓN" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Gray

Write-Host "Para aplicar las correcciones en Supabase:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣ Conectar a Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/[PROJECT-ID]/sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣ Ejecutar scripts en orden:" -ForegroundColor Yellow

foreach ($script in $sqlScripts) {
    if (Test-Path $script) {
        Write-Host "   📄 Copiar y ejecutar: $script" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "3️⃣ Validar correcciones:" -ForegroundColor Yellow
Write-Host "   📄 Ejecutar: scripts/validate_after_fix.sql" -ForegroundColor Cyan
Write-Host ""

# Mostrar resumen del reporte si existe
if (Test-Path "reports/auto_fix_data.json") {
    try {
        $reportData = Get-Content "reports/auto_fix_data.json" | ConvertFrom-Json
        $finalScore = [math]::Round(($reportData.finalAudit.score / $reportData.finalAudit.maxScore) * 100)
        
        Write-Host "📊 RESUMEN DE RESULTADOS:" -ForegroundColor Cyan
        Write-Host "   🎯 Puntuación Final: $finalScore/100" -ForegroundColor $(if ($finalScore -ge 95) { "Green" } elseif ($finalScore -ge 85) { "Yellow" } else { "Red" })
        Write-Host "   🔧 Correcciones Aplicadas: $($reportData.initialAudit.fixes.Count)" -ForegroundColor White
        Write-Host "   📁 Scripts Generados: $($reportData.report.scriptsGenerated)" -ForegroundColor White
        Write-Host "   🚀 Estado: $($reportData.report.status)" -ForegroundColor $(if ($finalScore -ge 95) { "Green" } else { "Yellow" })
    } catch {
        Write-Host "⚠️ No se pudo leer el resumen del reporte" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 SISTEMA AUTOMÁTICO COMPLETADO" -ForegroundColor Green
Write-Host "=" * 35 -ForegroundColor Gray
Write-Host "📁 Revisa los archivos generados en /reports/ y /scripts/" -ForegroundColor White
Write-Host "🔗 Aplica las correcciones en Supabase SQL Editor" -ForegroundColor White
Write-Host "📊 Re-ejecuta este script después de aplicar correcciones" -ForegroundColor White
Write-Host ""
Write-Host "⏰ Completado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Yellow
