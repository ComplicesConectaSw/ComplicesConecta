#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Regenera tipos de Supabase desde el proyecto remoto
.DESCRIPTION
    Regenera los tipos TypeScript de Supabase desde el proyecto remoto
    y actualiza tanto supabase.ts como supabase-generated.ts
.PARAMETER ProjectId
    ID del proyecto de Supabase (default: axtvqnozatbmllvwzuim)
.PARAMETER UpdateMain
    Si está presente, actualiza también supabase.ts (default: false)
.EXAMPLE
    .\scripts\regenerate-supabase-types.ps1
.EXAMPLE
    .\scripts\regenerate-supabase-types.ps1 -UpdateMain
#>

param(
    [string]$ProjectId = "axtvqnozatbmllvwzuim",
    [switch]$UpdateMain
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 REGENERANDO TIPOS DE SUPABASE" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📅 Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "🔑 Project ID: $ProjectId" -ForegroundColor Gray
Write-Host ""

# Verificar que npx esté disponible
try {
    $null = Get-Command npx -ErrorAction Stop
} catch {
    Write-Host "❌ Error: npx no está disponible" -ForegroundColor Red
    Write-Host "   Instala Node.js y npm para continuar" -ForegroundColor Yellow
    exit 1
}

# Verificar que supabase CLI esté disponible
try {
    $supabaseVersion = npx supabase --version 2>&1
    Write-Host "✅ Supabase CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase CLI no encontrado, intentando instalar..." -ForegroundColor Yellow
    Write-Host "   Esto puede tomar unos minutos..." -ForegroundColor Gray
}

Write-Host ""

# Crear backup del archivo actual si existe
$supabaseTypesPath = "src/types/supabase.ts"
$supabaseGeneratedPath = "src/types/supabase-generated.ts"

if (Test-Path $supabaseTypesPath) {
    $backupPath = "src/types/supabase.ts.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $supabaseTypesPath $backupPath
    Write-Host "📦 Backup creado: $backupPath" -ForegroundColor Green
}

if (Test-Path $supabaseGeneratedPath) {
    $backupPath = "src/types/supabase-generated.ts.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $supabaseGeneratedPath $backupPath
    Write-Host "📦 Backup creado: $backupPath" -ForegroundColor Green
}

Write-Host ""

# Regenerar tipos desde Supabase remoto
Write-Host "🔄 Regenerando tipos desde Supabase remoto..." -ForegroundColor Cyan
Write-Host "   Comando: npx supabase gen types typescript --project-id $ProjectId" -ForegroundColor Gray
Write-Host ""

try {
    # Generar tipos en archivo temporal primero
    $tempFile = "src/types/supabase-generated.tmp.ts"
    
    # Eliminar archivo temporal si existe
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
    
    $output = npx supabase gen types typescript --project-id $ProjectId 2>&1 | Out-String
    
    if ($LASTEXITCODE -eq 0) {
        # Guardar output en archivo
        $output | Set-Content $tempFile -Encoding UTF8 -Force
        
        # Verificar que el archivo tiene contenido válido
        $content = Get-Content $tempFile -Raw
        if ($content -match "export type Database") {
            # Mover archivo temporal a destino
            Move-Item $tempFile $supabaseGeneratedPath -Force
            Write-Host "✅ Tipos generados exitosamente en: $supabaseGeneratedPath" -ForegroundColor Green
            
            # Obtener estadísticas
            $fileInfo = Get-Item $supabaseGeneratedPath
            $lineCount = (Get-Content $supabaseGeneratedPath | Measure-Object -Line).Lines
            
            Write-Host ""
            Write-Host "📊 Estadísticas:" -ForegroundColor Cyan
            Write-Host "   📄 Archivo: $supabaseGeneratedPath" -ForegroundColor Gray
            Write-Host "   📏 Tamaño: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray
            Write-Host "   📝 Líneas: $lineCount" -ForegroundColor Gray
            
            # Contar tablas
            $tableMatches = [regex]::Matches($content, "(\w+):\s*\{[\s\S]*?Row:")
            $tableCount = $tableMatches.Count
            Write-Host "   🗄️  Tablas detectadas: $tableCount" -ForegroundColor Gray
            
            # Actualizar supabase.ts si se solicita
            if ($UpdateMain) {
                Write-Host ""
                Write-Host "🔄 Actualizando supabase.ts..." -ForegroundColor Cyan
                Copy-Item $supabaseGeneratedPath $supabaseTypesPath -Force
                Write-Host "✅ supabase.ts actualizado" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "💡 Para actualizar también supabase.ts, ejecuta:" -ForegroundColor Yellow
                Write-Host "   .\scripts\regenerate-supabase-types.ps1 -UpdateMain" -ForegroundColor White
            }
            
        } else {
            Write-Host "❌ Error: El archivo generado no contiene tipos válidos" -ForegroundColor Red
            if (Test-Path $tempFile) {
                Remove-Item $tempFile
            }
            exit 1
        }
    } else {
        Write-Host "❌ Error generando tipos:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error ejecutando comando:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Proceso completado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Revisar los tipos generados en $supabaseGeneratedPath" -ForegroundColor Gray
if (-not $UpdateMain) {
    Write-Host "   2. Comparar con supabase.ts actual" -ForegroundColor Gray
    Write-Host "   3. Ejecutar con -UpdateMain para actualizar supabase.ts" -ForegroundColor Gray
}
Write-Host "   4. Ejecutar: npm run type-check" -ForegroundColor Gray
Write-Host "   5. Ejecutar: npm run validate:types" -ForegroundColor Gray
Write-Host ""

