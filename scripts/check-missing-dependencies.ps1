# Script para verificar dependencias faltantes en el proyecto
Write-Host "`nVERIFICANDO DEPENDENCIAS FALTANTES`n" -ForegroundColor Cyan

# Leer package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$installedDeps = @{}
$installedDevDeps = @{}

foreach ($dep in $packageJson.dependencies.PSObject.Properties) {
    $installedDeps[$dep.Name] = $dep.Value
}

foreach ($dep in $packageJson.devDependencies.PSObject.Properties) {
    $installedDevDeps[$dep.Name] = $dep.Value
}

# Módulos que se intentan cargar dinámicamente
$dynamicImports = @(
    @{ Name = "web3"; File = "src/utils/dynamicImports.ts"; Line = 48; Required = $false; Description = "Web3.js SDK para Ethereum" },
    @{ Name = "ethers"; File = "src/utils/dynamicImports.ts"; Line = 80; Required = $false; Description = "Ethers.js SDK para Ethereum" },
    @{ Name = "@solana/web3.js"; File = "src/utils/dynamicImports.ts"; Line = 113; Required = $false; Description = "Solana Web3.js SDK" },
    @{ Name = "tronweb"; File = "src/utils/dynamicImports.ts"; Line = 147; Required = $false; Description = "TronWeb SDK para Tron" },
    @{ Name = "@huggingface/transformers"; File = "src/utils/dynamicImports.ts"; Line = 176; Required = $false; Description = "Hugging Face Transformers (comentado/eliminado)" }
)

Write-Host "Analizando imports dinamicos en el codigo...`n" -ForegroundColor Yellow

$missingDeps = @()
$optionalDeps = @()
$foundDeps = @()

foreach ($import in $dynamicImports) {
    $depName = $import.Name
    $isInstalled = $installedDeps.ContainsKey($depName) -or $installedDevDeps.ContainsKey($depName)
    
    if ($isInstalled) {
        $foundDeps += $import
        Write-Host "[OK] $depName - INSTALADO" -ForegroundColor Green
    } else {
        if ($import.Required) {
            $missingDeps += $import
            Write-Host "[ERROR] $depName - FALTANTE (REQUERIDO)" -ForegroundColor Red
        } else {
            $optionalDeps += $import
            Write-Host "[WARN] $depName - FALTANTE (OPCIONAL)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "REPORTE DE DEPENDENCIAS FALTANTES" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

Write-Host "DEPENDENCIAS INSTALADAS: $($foundDeps.Count)" -ForegroundColor Green
foreach ($dep in $foundDeps) {
    Write-Host "   - $($dep.Name)" -ForegroundColor Gray
}

Write-Host "`nDEPENDENCIAS OPCIONALES FALTANTES: $($optionalDeps.Count)" -ForegroundColor Yellow
foreach ($dep in $optionalDeps) {
    Write-Host "   - $($dep.Name)" -ForegroundColor Yellow
    Write-Host "     Descripcion: $($dep.Description)" -ForegroundColor Gray
    Write-Host "     Archivo: $($dep.File):$($dep.Line)" -ForegroundColor Gray
    Write-Host "     Comando: npm install $($dep.Name)" -ForegroundColor DarkGray
}

if ($missingDeps.Count -gt 0) {
    Write-Host "`nDEPENDENCIAS REQUERIDAS FALTANTES: $($missingDeps.Count)" -ForegroundColor Red
    foreach ($dep in $missingDeps) {
        Write-Host "   - $($dep.Name)" -ForegroundColor Red
        Write-Host "     Archivo: $($dep.File):$($dep.Line)" -ForegroundColor Gray
        Write-Host "     Comando: npm install $($dep.Name)" -ForegroundColor DarkGray
    }
}

if ($optionalDeps.Count -gt 0) {
    Write-Host "`nCOMANDO PARA INSTALAR DEPENDENCIAS OPCIONALES:" -ForegroundColor Cyan
    $installCmd = "npm install " + ($optionalDeps | ForEach-Object { $_.Name } | Join-String -Separator " ")
    Write-Host "   $installCmd" -ForegroundColor White
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Guardar reporte
$reportPath = "DEPENDENCIAS_FALTANTES_REPORTE.md"
$reportLines = @()
$reportLines += "# Reporte de Dependencias Faltantes"
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$reportLines += "**Fecha:** $fecha"
$reportLines += "**Version:** $($packageJson.version)"
$reportLines += ""
$reportLines += "## Resumen"
$reportLines += "- Dependencias instaladas: $($foundDeps.Count)"
$reportLines += "- Dependencias opcionales faltantes: $($optionalDeps.Count)"
$reportLines += "- Dependencias requeridas faltantes: $($missingDeps.Count)"
$reportLines += ""
$reportLines += "## Dependencias Opcionales Faltantes"
$reportLines += ""

if ($optionalDeps.Count -gt 0) {
    foreach ($dep in $optionalDeps) {
        $reportLines += "- **$($dep.Name)** - $($dep.Description)"
        $reportLines += "  - Archivo: ``$($dep.File):$($dep.Line)``"
        $reportLines += "  - Comando: ``npm install $($dep.Name)``"
        $reportLines += ""
    }
} else {
    $reportLines += "Ninguna"
    $reportLines += ""
}

$reportLines += "## Dependencias Requeridas Faltantes"
$reportLines += ""

if ($missingDeps.Count -gt 0) {
    foreach ($dep in $missingDeps) {
        $reportLines += "- **$($dep.Name)**"
        $reportLines += "  - Archivo: ``$($dep.File):$($dep.Line)``"
        $reportLines += "  - Comando: ``npm install $($dep.Name)``"
        $reportLines += ""
    }
} else {
    $reportLines += "Ninguna"
    $reportLines += ""
}

if ($optionalDeps.Count -gt 0) {
    $reportLines += "## Comando para Instalar Todas las Dependencias Opcionales"
    $reportLines += ""
    $reportLines += "```bash"
    $installCmd = "npm install " + ($optionalDeps | ForEach-Object { $_.Name } | Join-String -Separator " ")
    $reportLines += $installCmd
    $reportLines += "```"
    $reportLines += ""
}

$reportLines += "## Notas"
$reportLines += ""
$reportLines += "- Las dependencias opcionales se cargan dinamicamente solo si estan disponibles"
$reportLines += "- El codigo maneja la ausencia de estas dependencias sin errores"
$reportLines += "- Se recomienda instalar solo las dependencias que realmente se van a usar"

$reportLines | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Reporte guardado en: $reportPath" -ForegroundColor Green
Write-Host ""
