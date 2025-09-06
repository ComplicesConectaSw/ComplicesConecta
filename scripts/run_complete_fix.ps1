# =====================================================
# 🤖 SISTEMA AUTOMÁTICO DE CORRECCIÓN SUPABASE COMPLETO
# ComplicesConecta v2.1.2 - Ejecutor PowerShell Windows
# Fecha: 06 de septiembre, 2025 - 05:32 hrs
# =====================================================

Write-Host "🤖 SISTEMA AUTOMÁTICO DE CORRECCIÓN SUPABASE COMPLETO" -ForegroundColor Cyan
Write-Host "🎯 ComplicesConecta v2.1.2 - Auto-Fix System" -ForegroundColor Green
Write-Host "⏰ Iniciado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Yellow
Write-Host ("=" * 60) -ForegroundColor Gray

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Instala Node.js primero." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 PASO 1: EJECUTANDO AUDITORÍA AUTOMÁTICA" -ForegroundColor Cyan
Write-Host ("=" * 40) -ForegroundColor Gray

# Ejecutar auditoría automática
try {
    Write-Host "🚀 Iniciando sistema automático..." -ForegroundColor Yellow
    
    if (Test-Path "scripts\complete_audit_system.js") {
        node scripts\complete_audit_system.js
        Write-Host "✅ Sistema automático ejecutado exitosamente" -ForegroundColor Green
    } elseif (Test-Path "scripts\supabase_auto_fix_simple.js") {
        node scripts\supabase_auto_fix_simple.js
        Write-Host "✅ Sistema automático ejecutado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Script de auditoría no encontrado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error ejecutando auditoría: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 PASO 2: VERIFICANDO RESULTADOS" -ForegroundColor Cyan
Write-Host ("=" * 35) -ForegroundColor Gray

# Verificar archivos generados
$reportPath = "reports\auto_fix_report.md"
$auditPath = "reports\database_audit.json"

if (Test-Path $reportPath) {
    Write-Host "✅ Reporte de corrección encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ No se encontró reporte de corrección" -ForegroundColor Yellow
}

if (Test-Path $auditPath) {
    Write-Host "✅ Datos de auditoría encontrados" -ForegroundColor Green
} else {
    Write-Host "⚠️ No se encontraron datos de auditoría" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🛠️ SCRIPTS SQL GENERADOS:" -ForegroundColor Cyan

$sqlScripts = @(
    "scripts\fix_database.sql",
    "scripts\complete_rls_policies.sql", 
    "scripts\complete_storage_buckets.sql",
    "scripts\create_functions.sql",
    "scripts\create_indexes.sql",
    "scripts\complete_validation_system.sql"
)

foreach ($script in $sqlScripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script" -ForegroundColor Green
    } else {
        Write-Host "⚪ $script (no necesario)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📋 PASO 3: INSTRUCCIONES DE APLICACIÓN" -ForegroundColor Cyan
Write-Host ("=" * 40) -ForegroundColor Gray

Write-Host "Para aplicar las correcciones en Supabase:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣ Conectar a Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/[PROJECT-ID]/sql" -ForegroundColor Blue
Write-Host ""
Write-Host "2️⃣ Ejecutar scripts en orden:" -ForegroundColor Yellow
Write-Host "   📄 Ejecutar: scripts\fix_database.sql" -ForegroundColor White
Write-Host "   🛡️ Ejecutar: scripts\complete_rls_policies.sql" -ForegroundColor White
Write-Host "   🗂️ Ejecutar: scripts\complete_storage_buckets.sql" -ForegroundColor White
Write-Host "   🔧 Ejecutar: scripts\create_functions.sql" -ForegroundColor White
Write-Host "   🚀 Ejecutar: scripts\create_indexes.sql" -ForegroundColor White
Write-Host "   🎯 Ejecutar: scripts\complete_validation_system.sql" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣ Validar correcciones:" -ForegroundColor Yellow
Write-Host "   📊 Ejecutar: SELECT * FROM public.validate_database_complete();" -ForegroundColor Blue
Write-Host "   📋 Ejecutar: SELECT public.generate_audit_report();" -ForegroundColor Blue
Write-Host ""

Write-Host "🎉 SISTEMA AUTOMÁTICO COMPLETADO" -ForegroundColor Green
Write-Host ("=" * 35) -ForegroundColor Gray
Write-Host "📁 Revisa los archivos generados en /reports/ y /scripts/" -ForegroundColor White
Write-Host "🔗 Aplica las correcciones en Supabase SQL Editor" -ForegroundColor White
Write-Host "📊 Re-ejecuta este script después de aplicar correcciones" -ForegroundColor White
Write-Host ""
Write-Host "⏰ Completado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Yellow

# Pausa para que el usuario pueda leer
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
