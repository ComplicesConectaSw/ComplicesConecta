# Script: Eliminar Documentos Consolidados
# Versión: 3.5.0
# Fecha: 06 Nov 2025

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🗑️  ELIMINAR DOCUMENTOS CONSOLIDADOS                ║" -ForegroundColor Cyan
Write-Host "║  ComplicesConecta v3.5.0                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Lista de documentos consolidados a eliminar
$documentosConsolidados = @(
    "IMPLEMENTACION_FEATURES_INNOVADORAS_v3.5.0.md",
    "IMPLEMENTACION_FEATURES_2_3_4_v3.5.0.md",
    "PLAN_TRABAJO_AUDITORIA_HALLAZGOS.md",
    "REPORTE_ANALISIS_COMPLETO_PROYECTO.md",
    "REPORTE_FINAL_CONSOLIDADO_v3.5.0.md",
    "RESUMEN_IMPLEMENTACION_FEATURES_2_3_4_v3.5.0.md",
    "RESUMEN_IMPLEMENTACION_FEATURES_v3.5.0.md"
)

Write-Host "📋 Documentos a eliminar:" -ForegroundColor Yellow
foreach ($doc in $documentosConsolidados) {
    if (Test-Path $doc) {
        Write-Host "   ✓ $doc" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $doc (no encontrado)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Confirmar eliminación
$confirmacion = Read-Host "¿Deseas eliminar estos documentos? (S/N)"
if ($confirmacion -ne "S" -and $confirmacion -ne "s") {
    Write-Host "❌ Eliminación cancelada" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Eliminando documentos consolidados..." -ForegroundColor Yellow
Write-Host ""

$eliminados = 0
$noEncontrados = 0

foreach ($doc in $documentosConsolidados) {
    if (Test-Path $doc) {
        try {
            Remove-Item $doc -Force
            Write-Host "   ✅ Eliminado: $doc" -ForegroundColor Green
            $eliminados++
        } catch {
            Write-Host "   ❌ Error eliminando $doc : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  No encontrado: $doc" -ForegroundColor Yellow
        $noEncontrados++
    }
}

Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "   ✅ Eliminados: $eliminados" -ForegroundColor Green
Write-Host "   ⚠️  No encontrados: $noEncontrados" -ForegroundColor Yellow
Write-Host ""

if ($eliminados -gt 0) {
    Write-Host "✅ Documentos consolidados eliminados exitosamente" -ForegroundColor Green
    Write-Host "   La información consolidada está en:" -ForegroundColor White
    Write-Host "   📄 DOCUMENTACION_IMPLEMENTACION_REPORTES_CONSOLIDADA_v3.5.0.md" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No se eliminaron documentos" -ForegroundColor Yellow
}

Write-Host ""

