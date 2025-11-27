#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para eliminar archivos de documentación obsoletos consolidados
.DESCRIPTION
    Elimina archivos de documentación que han sido consolidados en documentos maestros
.EXAMPLE
    .\scripts\cleanup-obsolete-docs.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🧹 LIMPIEZA DE DOCUMENTACIÓN OBSOLETA - ComplicesConecta v3.5.0" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Archivos obsoletos a eliminar (ya consolidados)
$obsoleteFiles = @(
    "RESUMEN_SESION_2025-11-04.md",
    "SOLUCIONES_PROXIMA_SESION.md",
    "ERRORES_VERCEL_DIAGNOSTICO.md",
    "PROBLEMAS_ADICIONALES_VERCEL.md",
    "ANALISIS_PROFUNDO_PROBLEMAS.md",
    "Auditoria_React_useLayoutEffect_fix.md",
    "Auditoria_useLayoutEffect_Fix.md"
)

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $obsoleteFiles) {
    $filePath = Join-Path $PSScriptRoot ".." $file
    if (Test-Path $filePath) {
        try {
            Remove-Item $filePath -Force
            Write-Host "✅ Eliminado: $file" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "❌ Error eliminando $file : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  No encontrado: $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "   ✅ Eliminados: $deletedCount" -ForegroundColor Green
Write-Host "   ⚠️  No encontrados: $notFoundCount" -ForegroundColor Yellow
Write-Host ""

if ($deletedCount -gt 0) {
    Write-Host "✅ Limpieza completada exitosamente" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No se encontraron archivos para eliminar" -ForegroundColor Blue
}

