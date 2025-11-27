#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Elimina ramas remotas innecesarias, manteniendo solo master, feature/audit-improvements-backup y complicesbackup
.DESCRIPTION
    Elimina todas las ramas remotas excepto las 3 ramas principales:
    - master
    - feature/audit-improvements-backup (rama más completa)
    - complicesbackup (rama de backup)
.EXAMPLE
    .\scripts\delete-unnecessary-branches.ps1
#>

param()

$ErrorActionPreference = "Stop"

# Ramas a mantener
$protectedBranches = @(
    "master",
    "feature/audit-improvements-backup",
    "complicesbackup"
)

Write-Host "🗑️  ELIMINANDO RAMAS INNECESARIAS" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Obtener todas las ramas remotas
Write-Host "📋 Obteniendo lista de ramas remotas..." -ForegroundColor Blue
$allBranches = git branch -r | ForEach-Object { 
    $_.Trim() -replace "origin/", "" 
} | Where-Object { 
    $_ -ne "HEAD" 
} | Sort-Object

Write-Host "   ✅ Encontradas $($allBranches.Count) ramas remotas" -ForegroundColor Green
Write-Host ""

# Identificar ramas a eliminar
$branchesToDelete = @()
foreach ($branch in $allBranches) {
    $isProtected = $false
    foreach ($protected in $protectedBranches) {
        if ($branch -eq $protected) {
            $isProtected = $true
            break
        }
    }
    if (-not $isProtected) {
        $branchesToDelete += $branch
    }
}

Write-Host "🔒 Ramas protegidas (no se eliminarán):" -ForegroundColor Green
foreach ($protected in $protectedBranches) {
    Write-Host "   ✅ $protected" -ForegroundColor Green
}
Write-Host ""

Write-Host "🗑️  Ramas a eliminar: $($branchesToDelete.Count)" -ForegroundColor Yellow
if ($branchesToDelete.Count -gt 0) {
    Write-Host ""
    Write-Host "¿Deseas continuar con la eliminación? (S/N): " -ForegroundColor Yellow -NoNewline
    $confirmation = Read-Host
    
    if ($confirmation -eq "S" -or $confirmation -eq "s" -or $confirmation -eq "Y" -or $confirmation -eq "y") {
        Write-Host ""
        Write-Host "🗑️  Eliminando ramas..." -ForegroundColor Yellow
        
        $deletedCount = 0
        $failedCount = 0
        
        foreach ($branch in $branchesToDelete) {
            Write-Host "   🗑️  Eliminando: $branch" -ForegroundColor Yellow
            try {
                git push origin --delete $branch 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "      ✅ Eliminada: $branch" -ForegroundColor Green
                    $deletedCount++
                } else {
                    Write-Host "      ❌ Error eliminando: $branch" -ForegroundColor Red
                    $failedCount++
                }
            } catch {
                Write-Host "      ❌ Error eliminando: $branch - $($_.Exception.Message)" -ForegroundColor Red
                $failedCount++
            }
        }
        
        Write-Host ""
        Write-Host "📊 RESUMEN" -ForegroundColor Cyan
        Write-Host ("=" * 70) -ForegroundColor Cyan
        Write-Host "✅ Eliminadas: $deletedCount" -ForegroundColor Green
        Write-Host "❌ Fallidas: $failedCount" -ForegroundColor Red
        Write-Host "🔒 Protegidas: $($protectedBranches.Count)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✅ No hay ramas para eliminar" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Proceso completado" -ForegroundColor Green

